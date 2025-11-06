import { getOrderingStrategy } from './registry';
import type { LayoutType, ValidationContext, ValidationResult, ValidationOptions, PrismaClientLike } from './types';

// Re-export types
export * from './types';
export { OrderingStrategy, CollectionOrderSchema } from './base';
export type { CollectionOrder } from './base';
export { getOrderingStrategy, registerOrderingStrategy, hasOrderingStrategy, getRegisteredLayoutTypes } from './registry';

// Re-export strategy types
export type { LauncherOrder } from './strategies/launcher';
export type { ListOrder } from './strategies/list';

// Re-export helpers for server-side operations
export * from './helpers';

/**
 * Validate top-level ordering for a specific layout type
 * Use this in service functions when client updates top-level ordering
 * 
 * @param prismaClient - Prisma client or transaction client for database queries
 * @param layoutType - The layout mode (launcher, grid, list)
 * @param order - The ordering data from client
 * @param context - Validation context (userId)
 * @param options - Validation options (strict mode, etc.)
 * @returns Validation result with normalized data or errors
 * 
 * @example
 * ```typescript
 * const result = await validateTopLevelOrder(
 *   tx,
 *   'launcher',
 *   orderData,
 *   { userId: user.id },
 *   { strict: false }
 * );
 * 
 * if (!result.valid) {
 *   throw new ValidationError(result.errors.join(', '));
 * }
 * 
 * // Use result.normalized when saving
 * ```
 */
export async function validateTopLevelOrder(
  prismaClient: PrismaClientLike,
  layoutType: LayoutType,
  order: unknown,
  context: ValidationContext,
  options?: ValidationOptions
): Promise<ValidationResult> {
  const strategy = getOrderingStrategy(layoutType);
  return strategy.validateTopLevelOrder(prismaClient, order, context, options);
}

/**
 * Validate collection-level ordering for a specific layout type
 * Use this in service functions when client updates collection bookmark order
 * 
 * @param prismaClient - Prisma client or transaction client for database queries
 * @param layoutType - The layout mode (launcher, grid, list)
 * @param order - The ordering data from client
 * @param context - Validation context (userId, collectionId)
 * @param options - Validation options (strict mode, etc.)
 * @returns Validation result with normalized data or errors
 * 
 * @example
 * ```typescript
 * const result = await validateCollectionOrder(
 *   tx,
 *   'list',
 *   orderData,
 *   { userId: user.id, collectionId: 'col-123' },
 *   { strict: false }
 * );
 * 
 * if (!result.valid) {
 *   throw new ValidationError(result.errors.join(', '));
 * }
 * 
 * // Use result.normalized when saving
 * ```
 */
export async function validateCollectionOrder(
  prismaClient: PrismaClientLike,
  layoutType: LayoutType,
  order: unknown,
  context: ValidationContext & { collectionId: string },
  options?: ValidationOptions
): Promise<ValidationResult> {
  const strategy = getOrderingStrategy(layoutType);
  return strategy.validateCollectionOrder(prismaClient, order, context, options);
}

