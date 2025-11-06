import { z } from 'zod';
import type { ValidationResult, ValidationContext, ValidationOptions, PrismaClientLike } from './types';
import { prisma } from '@/lib/prisma';

// Collection ordering schema - always array of bookmark IDs
// Exported for use in helpers and type definitions
export const CollectionOrderSchema = z.array(z.uuid());
export type CollectionOrder = z.infer<typeof CollectionOrderSchema>;

/**
 * Abstract base class for ordering validation strategies
 * Each layout mode implements its own validation logic
 */
export abstract class OrderingStrategy<TOrder = unknown> {
  abstract readonly layoutType: string;
  abstract readonly orderSchema: z.ZodSchema<TOrder>;
  
  /**
   * Validate top-level ordering for this layout
   * Used when user updates ordering from the UI
   * Each layout implements its own logic since top-level can differ
   * @param prismaClient - Prisma client or transaction client for database queries
   */
  abstract validateTopLevelOrder(
    prismaClient: PrismaClientLike,
    order: unknown,
    context: ValidationContext,
    options?: ValidationOptions
  ): Promise<ValidationResult<TOrder>>;

  /**
   * Validate collection-level ordering
   * Collections always contain only bookmarks (array of UUIDs), regardless of layout mode
   * This is implemented in the base class to avoid duplication
   * @param prismaClient - Prisma client or transaction client for database queries
   */
  async validateCollectionOrder(
    prismaClient: PrismaClientLike,
    order: unknown,
    context: ValidationContext & { collectionId: string },
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
        errors.push(`Duplicate bookmark: ${id}`);
      }
      seenIds.add(id);
    }
    
    // 3. Verify collection exists and belongs to user
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
    
    // 4. Validate all bookmarks exist and belong to this collection
    if (normalizedOrder.length > 0) {
      const bookmarks = await prismaClient.bookmark.findMany({
        where: {
          id: { in: normalizedOrder },
          collectionId: context.collectionId,
        },
        select: { id: true },
      });
      
      const foundIds = new Set(bookmarks.map((b) => b.id));
      for (const id of normalizedOrder) {
        if (!foundIds.has(id)) {
          errors.push(
            `Bookmark ${id} not found or does not belong to collection ${context.collectionId}`
          );
        }
      }

      // 5. Check completeness if strict mode
      if (options?.strict) {
        const allBookmarks = await prismaClient.bookmark.findMany({
          where: { collectionId: context.collectionId },
          select: { id: true },
        });
        for (const bookmark of allBookmarks) {
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

  /**
   * Parse raw JSON from client
   * First-pass schema validation before detailed checks
   */
  parse(value: unknown): ValidationResult<TOrder> {
    const result = this.orderSchema.safeParse(value);
    if (!result.success) {
      return {
        valid: false,
        errors: [result.error.message],
      };
    }
    return {
      valid: true,
      errors: [],
      normalized: result.data,
    };
  }
}

