/**
 * Simplified ordering validation system
 * 
 * With the new Order table schema, we no longer mix collection and bookmark ordering.
 * Instead, we have separate order records:
 * 
 * - type=collection, collectionId=null: Orders collections at top level
 * - type=bookmark, collectionId=null: Orders top-level bookmarks (not in any collection)
 * - type=bookmark, collectionId=<id>: Orders bookmarks within a specific collection
 */

import { validateOrder } from './base';

// Re-export types
export type { OrderType, ValidationContext, ValidationResult, ValidationOptions, PrismaClientLike } from './types';
export type { CollectionOrder, BookmarkOrder } from './base';
export { 
  validateOrder, 
  validateCollectionOrder, 
  validateBookmarkOrder,
  CollectionOrderSchema,
  BookmarkOrderSchema,
} from './base';

/**
 * Main validation function - routes to appropriate validator based on type
 * 
 * @param prismaClient - Prisma client or transaction client for database queries
 * @param type - Order type ('collection' or 'bookmark')
 * @param order - The ordering data from client (array of UUIDs)
 * @param context - Validation context (userId required, collectionId for bookmark orders in collections)
 * @param options - Validation options (strict mode, etc.)
 * @returns Validation result with normalized data or errors
 * 
 * @example
 * ```typescript
 * // Validate collection ordering (top-level collections)
 * const result = await validateOrder(
 *   tx,
 *   'collection',
 *   ['col-id-1', 'col-id-2'],
 *   { userId: user.id }
 * );
 * 
 * // Validate top-level bookmarks (no collection)
 * const result = await validateOrder(
 *   tx,
 *   'bookmark',
 *   ['bookmark-id-1', 'bookmark-id-2'],
 *   { userId: user.id }
 * );
 * 
 * // Validate bookmarks within a collection
 * const result = await validateOrder(
 *   tx,
 *   'bookmark',
 *   ['bookmark-id-1', 'bookmark-id-2'],
 *   { userId: user.id, collectionId: 'col-123' }
 * );
 * 
 * if (!result.valid) {
 *   throw new ValidationError(result.errors.join(', '));
 * }
 * 
 * // Use result.normalized when saving to database
 * ```
 */
export { validateOrder as default };
