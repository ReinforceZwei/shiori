import { z } from 'zod';
import { OrderingStrategy } from '../base';
import type { ValidationResult, ValidationContext, ValidationOptions, PrismaClientLike } from '../types';

// Launcher-specific types
export const LauncherItemSchema = z.object({
  type: z.enum(['collection', 'bookmark']),
  id: z.uuid(),
});

export const LauncherOrderSchema = z.array(LauncherItemSchema);
export type LauncherOrder = z.infer<typeof LauncherOrderSchema>;

/**
 * Launcher layout validation strategy
 * Supports mixed collections + bookmarks at top level
 */
export class LauncherOrderingStrategy extends OrderingStrategy<LauncherOrder> {
  readonly layoutType = 'launcher';
  readonly orderSchema = LauncherOrderSchema;

  async validateTopLevelOrder(
    prismaClient: PrismaClientLike,
    order: unknown,
    context: ValidationContext,
    options?: ValidationOptions
  ): Promise<ValidationResult<LauncherOrder>> {
    const errors: string[] = [];
    
    // 1. Schema validation
    const parseResult = this.parse(order);
    if (!parseResult.valid) {
      return parseResult;
    }
    
    const normalizedOrder = parseResult.normalized!;
    
    // 2. Check for duplicates
    const seenIds = new Set<string>();
    for (const item of normalizedOrder) {
      const key = `${item.type}:${item.id}`;
      if (seenIds.has(key)) {
        errors.push(`Duplicate item: ${key}`);
      }
      seenIds.add(key);
    }
    
    // 3. Separate items by type
    const collectionIds = normalizedOrder
      .filter((item) => item.type === 'collection')
      .map((item) => item.id);
    const bookmarkIds = normalizedOrder
      .filter((item) => item.type === 'bookmark')
      .map((item) => item.id);
    
    // 4. Validate collections exist and belong to user
    if (collectionIds.length > 0) {
      const collections = await prismaClient.collection.findMany({
        where: { id: { in: collectionIds }, userId: context.userId },
        select: { id: true },
      });
      
      const foundCollectionIds = new Set(collections.map((c) => c.id));
      for (const id of collectionIds) {
        if (!foundCollectionIds.has(id)) {
          errors.push(`Collection not found or access denied: ${id}`);
        }
      }

      // 5. Check completeness if strict mode
      if (options?.strict) {
        const allCollections = await prismaClient.collection.findMany({
          where: { userId: context.userId },
          select: { id: true },
        });
        for (const collection of allCollections) {
          if (!foundCollectionIds.has(collection.id)) {
            errors.push(`Missing collection in order: ${collection.id}`);
          }
        }
      }
    }
    
    // 6. Validate bookmarks exist, belong to user, and have no collection
    if (bookmarkIds.length > 0) {
      const bookmarks = await prismaClient.bookmark.findMany({
        where: {
          id: { in: bookmarkIds },
          userId: context.userId,
        },
        select: { id: true, collectionId: true },
      });
      
      const foundBookmarkIds = new Set<string>();
      for (const bookmark of bookmarks) {
        foundBookmarkIds.add(bookmark.id);
        if (bookmark.collectionId !== null) {
          errors.push(
            `Bookmark ${bookmark.id} belongs to a collection and cannot be in top-level order`
          );
        }
      }

      // Check which bookmarks weren't found
      for (const id of bookmarkIds) {
        if (!foundBookmarkIds.has(id)) {
          errors.push(`Bookmark not found or access denied: ${id}`);
        }
      }

      // 7. Check completeness if strict mode
      if (options?.strict) {
        const allTopLevelBookmarks = await prismaClient.bookmark.findMany({
          where: { userId: context.userId, collectionId: null },
          select: { id: true },
        });
        for (const bookmark of allTopLevelBookmarks) {
          if (!foundBookmarkIds.has(bookmark.id)) {
            errors.push(`Missing bookmark in order: ${bookmark.id}`);
          }
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      normalized: errors.length === 0 ? normalizedOrder : undefined,
    };
  }
  
  // validateCollectionOrder is inherited from base class
  // Collections always contain only bookmarks (array of UUIDs) regardless of layout mode
}

