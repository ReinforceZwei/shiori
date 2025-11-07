import { z } from 'zod';
import type { ValidationResult, ValidationContext, ValidationOptions, PrismaClientLike, OrderType } from './types';

/**
 * Simplified ordering schemas
 * - Collection order: array of collection IDs
 * - Bookmark order: array of bookmark IDs
 */
export const CollectionOrderSchema = z.array(z.uuid());
export const BookmarkOrderSchema = z.array(z.uuid());

export type CollectionOrder = z.infer<typeof CollectionOrderSchema>;
export type BookmarkOrder = z.infer<typeof BookmarkOrderSchema>;

/**
 * Validate collection ordering (type=collection)
 * Used to order collections at the top level
 * 
 * @param prismaClient - Prisma client or transaction client
 * @param order - Array of collection IDs
 * @param context - Must include userId
 * @param options - Validation options
 */
export async function validateCollectionOrder(
  prismaClient: PrismaClientLike,
  order: unknown,
  context: ValidationContext,
  options?: ValidationOptions
): Promise<ValidationResult<CollectionOrder>> {
  const errors: string[] = [];
  
  // 1. Schema validation
  const parseResult = CollectionOrderSchema.safeParse(order);
  if (!parseResult.success) {
    return {
      valid: false,
      errors: [parseResult.error.message],
    };
  }
  
  const normalizedOrder = parseResult.data;
  
  // 2. Check for duplicates
  const seenIds = new Set<string>();
  for (const id of normalizedOrder) {
    if (seenIds.has(id)) {
      errors.push(`Duplicate collection: ${id}`);
    }
    seenIds.add(id);
  }
  
  // 3. Validate all collections exist and belong to user
  if (normalizedOrder.length > 0) {
    const collections = await prismaClient.collection.findMany({
      where: {
        id: { in: normalizedOrder },
        userId: context.userId,
      },
      select: { id: true },
    });
    
    const foundIds = new Set(collections.map((c) => c.id));
    for (const id of normalizedOrder) {
      if (!foundIds.has(id)) {
        errors.push(`Collection not found or access denied: ${id}`);
      }
    }

    // 4. Check completeness if strict mode
    if (options?.strict) {
      const allCollections = await prismaClient.collection.findMany({
        where: { userId: context.userId },
        select: { id: true },
      });
      for (const collection of allCollections) {
        if (!seenIds.has(collection.id)) {
          errors.push(`Missing collection in order: ${collection.id}`);
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

/**
 * Validate bookmark ordering (type=bookmark)
 * Can be used for:
 * - Top-level bookmarks (collectionId=null): orders bookmarks without a collection
 * - Collection bookmarks (collectionId=<id>): orders bookmarks within a collection
 * 
 * @param prismaClient - Prisma client or transaction client
 * @param order - Array of bookmark IDs
 * @param context - Must include userId; collectionId optional (null means top-level)
 * @param options - Validation options
 */
export async function validateBookmarkOrder(
  prismaClient: PrismaClientLike,
  order: unknown,
  context: ValidationContext,
  options?: ValidationOptions
): Promise<ValidationResult<BookmarkOrder>> {
  const errors: string[] = [];
  
  // 1. Schema validation
  const parseResult = BookmarkOrderSchema.safeParse(order);
  if (!parseResult.success) {
    return {
      valid: false,
      errors: [parseResult.error.message],
    };
  }
  
  const normalizedOrder = parseResult.data;
  
  // 2. Check for duplicates
  const seenIds = new Set<string>();
  for (const id of normalizedOrder) {
    if (seenIds.has(id)) {
      errors.push(`Duplicate bookmark: ${id}`);
    }
    seenIds.add(id);
  }
  
  // 3. If collectionId provided, verify collection exists and belongs to user
  if (context.collectionId) {
    const collection = await prismaClient.collection.findUnique({
      where: { id: context.collectionId },
      select: { userId: true },
    });
    
    if (!collection) {
      errors.push(`Collection not found: ${context.collectionId}`);
      return { valid: false, errors };
    }
    
    if (collection.userId !== context.userId) {
      errors.push(`Access denied to collection: ${context.collectionId}`);
      return { valid: false, errors };
    }
  }
  
  // 4. Validate all bookmarks exist, belong to user, and match collection context
  if (normalizedOrder.length > 0) {
    const bookmarks = await prismaClient.bookmark.findMany({
      where: {
        id: { in: normalizedOrder },
        userId: context.userId,
        // If collectionId provided, bookmarks must belong to that collection
        // If null, bookmarks must NOT belong to any collection (top-level)
        collectionId: context.collectionId ?? null,
      },
      select: { id: true, collectionId: true },
    });
    
    const foundIds = new Set(bookmarks.map((b) => b.id));
    for (const id of normalizedOrder) {
      if (!foundIds.has(id)) {
        const contextMsg = context.collectionId 
          ? `in collection ${context.collectionId}`
          : `at top level (no collection)`;
        errors.push(
          `Bookmark ${id} not found, access denied, or not ${contextMsg}`
        );
      }
    }

    // 5. Check completeness if strict mode
    if (options?.strict) {
      const allBookmarks = await prismaClient.bookmark.findMany({
        where: { 
          userId: context.userId,
          collectionId: context.collectionId ?? null,
        },
        select: { id: true },
      });
      for (const bookmark of allBookmarks) {
        if (!seenIds.has(bookmark.id)) {
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

/**
 * Generic order validator that routes to the appropriate validator based on type
 * 
 * @param prismaClient - Prisma client or transaction client
 * @param type - Order type ('collection' or 'bookmark')
 * @param order - Order data to validate
 * @param context - Validation context (userId required, collectionId optional)
 * @param options - Validation options
 */
export async function validateOrder(
  prismaClient: PrismaClientLike,
  type: OrderType,
  order: unknown,
  context: ValidationContext,
  options?: ValidationOptions
): Promise<ValidationResult> {
  if (type === 'collection') {
    return validateCollectionOrder(prismaClient, order, context, options);
  } else {
    return validateBookmarkOrder(prismaClient, order, context, options);
  }
}
