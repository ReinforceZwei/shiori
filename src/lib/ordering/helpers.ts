/**
 * Helper functions for server-side ordering updates
 * These functions modify ordering JSON without validation (trusted server operations)
 * 
 * Use these when:
 * - Creating new bookmarks/collections
 * - Deleting bookmarks/collections
 * - Moving bookmarks between collections
 * 
 * DO NOT use these for client-submitted ordering updates!
 */

import type { CollectionOrder, BookmarkOrder } from './base';

/**
 * Add an item to an order array
 * @param currentOrder - Current order array
 * @param itemId - ID of item to add
 * @param position - Optional position (defaults to end)
 */
export function addToOrder(
  currentOrder: string[],
  itemId: string,
  position?: number
): string[] {
  if (position !== undefined && position >= 0 && position <= currentOrder.length) {
    return [
      ...currentOrder.slice(0, position),
      itemId,
      ...currentOrder.slice(position),
    ];
  }
  
  return [...currentOrder, itemId];
}

/**
 * Remove an item from an order array
 * @param currentOrder - Current order array
 * @param itemId - ID of item to remove
 */
export function removeFromOrder(
  currentOrder: string[],
  itemId: string
): string[] {
  return currentOrder.filter((id) => id !== itemId);
}

/**
 * Clean up order by removing non-existent items
 * Use after bulk deletions or database inconsistencies
 * 
 * @param order - Current order array
 * @param existingIds - Set of existing item IDs
 */
export function cleanupOrder(
  order: string[],
  existingIds: Set<string>
): string[] {
  return order.filter((id) => existingIds.has(id));
}

/**
 * Initialize empty order
 */
export function createEmptyOrder(): string[] {
  return [];
}

/**
 * Move an item within an order array
 * @param currentOrder - Current order array
 * @param itemId - ID of item to move
 * @param newPosition - New position for the item
 */
export function moveInOrder(
  currentOrder: string[],
  itemId: string,
  newPosition: number
): string[] {
  const currentIndex = currentOrder.indexOf(itemId);
  if (currentIndex === -1) {
    // Item not in order, just add it at the position
    return addToOrder(currentOrder, itemId, newPosition);
  }
  
  // Remove from current position
  const withoutItem = removeFromOrder(currentOrder, itemId);
  
  // Add at new position
  return addToOrder(withoutItem, itemId, newPosition);
}

/**
 * Check if an item exists in an order
 * @param order - Order array
 * @param itemId - ID to check
 */
export function isInOrder(order: string[], itemId: string): boolean {
  return order.includes(itemId);
}

/**
 * Get position of an item in order (-1 if not found)
 * @param order - Order array
 * @param itemId - ID to find
 */
export function getOrderPosition(order: string[], itemId: string): number {
  return order.indexOf(itemId);
}

// Type-safe aliases for clarity
export type { CollectionOrder, BookmarkOrder };

// Re-export for convenience
export {
  addToOrder as addToCollectionOrder,
  removeFromOrder as removeFromCollectionOrder,
  cleanupOrder as cleanupCollectionOrder,
  addToOrder as addToBookmarkOrder,
  removeFromOrder as removeFromBookmarkOrder,
  cleanupOrder as cleanupBookmarkOrder,
};
