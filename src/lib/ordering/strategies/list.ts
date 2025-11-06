import { z } from 'zod';
import { OrderingStrategy } from '../base';
import type { ValidationResult, ValidationContext, ValidationOptions, PrismaClientLike } from '../types';

// Simple list: just bookmark IDs
export const ListOrderSchema = z.array(z.uuid());
export type ListOrder = z.infer<typeof ListOrderSchema>;

/**
 * List/Grid layout validation strategy
 * Only supports bookmarks (collections shown separately)
 */
export class ListOrderingStrategy extends OrderingStrategy<ListOrder> {
  readonly layoutType = 'list';
  readonly orderSchema = ListOrderSchema;

  async validateTopLevelOrder(
    prismaClient: PrismaClientLike,
    order: unknown,
    context: ValidationContext,
    options?: ValidationOptions
  ): Promise<ValidationResult<ListOrder>> {
    const errors: string[] = [];
    
    // 1. Schema validation
    const parseResult = this.parse(order);
    if (!parseResult.valid) {
      return parseResult;
    }
    
    const normalizedOrder = parseResult.normalized!;
    
    // 2. Check for duplicates
    const seenIds = new Set<string>();
    for (const id of normalizedOrder) {
      if (seenIds.has(id)) {
        errors.push(`Duplicate bookmark: ${id}`);
      }
      seenIds.add(id);
    }
    
    // 3. Validate all are bookmarks without collection
    if (normalizedOrder.length > 0) {
      const bookmarks = await prismaClient.bookmark.findMany({
        where: {
          id: { in: normalizedOrder },
          userId: context.userId,
        },
        select: { id: true, collectionId: true },
      });
      
      const foundIds = new Set<string>();
      for (const bookmark of bookmarks) {
        foundIds.add(bookmark.id);
        if (bookmark.collectionId !== null) {
          errors.push(
            `Bookmark ${bookmark.id} belongs to a collection and cannot be in top-level order`
          );
        }
      }

      // Check which bookmarks weren't found
      for (const id of normalizedOrder) {
        if (!foundIds.has(id)) {
          errors.push(`Bookmark not found or access denied: ${id}`);
        }
      }

      // 4. Check completeness if strict mode
      if (options?.strict) {
        const allTopLevelBookmarks = await prismaClient.bookmark.findMany({
          where: { userId: context.userId, collectionId: null },
          select: { id: true },
        });
        for (const bookmark of allTopLevelBookmarks) {
          if (!foundIds.has(bookmark.id)) {
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

