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

import type { LauncherOrder } from './strategies/launcher';
import type { ListOrder } from './strategies/list';
import type { CollectionOrder } from './base';

/**
 * Add a bookmark to launcher ordering
 * @param currentOrder - Current launcher order array
 * @param bookmarkId - ID of bookmark to add
 * @param position - Optional position (defaults to end)
 */
export function addBookmarkToLauncherOrder(
  currentOrder: LauncherOrder,
  bookmarkId: string,
  position?: number
): LauncherOrder {
  const newItem = { type: 'bookmark' as const, id: bookmarkId };
  
  if (position !== undefined && position >= 0 && position <= currentOrder.length) {
    return [
      ...currentOrder.slice(0, position),
      newItem,
      ...currentOrder.slice(position),
    ];
  }
  
  return [...currentOrder, newItem];
}

/**
 * Add a collection to launcher ordering
 * @param currentOrder - Current launcher order array
 * @param collectionId - ID of collection to add
 * @param position - Optional position (defaults to end)
 */
export function addCollectionToLauncherOrder(
  currentOrder: LauncherOrder,
  collectionId: string,
  position?: number
): LauncherOrder {
  const newItem = { type: 'collection' as const, id: collectionId };
  
  if (position !== undefined && position >= 0 && position <= currentOrder.length) {
    return [
      ...currentOrder.slice(0, position),
      newItem,
      ...currentOrder.slice(position),
    ];
  }
  
  return [...currentOrder, newItem];
}

/**
 * Remove a bookmark from launcher ordering
 * @param currentOrder - Current launcher order array
 * @param bookmarkId - ID of bookmark to remove
 */
export function removeBookmarkFromLauncherOrder(
  currentOrder: LauncherOrder,
  bookmarkId: string
): LauncherOrder {
  return currentOrder.filter(
    (item) => !(item.type === 'bookmark' && item.id === bookmarkId)
  );
}

/**
 * Remove a collection from launcher ordering
 * @param currentOrder - Current launcher order array
 * @param collectionId - ID of collection to remove
 */
export function removeCollectionFromLauncherOrder(
  currentOrder: LauncherOrder,
  collectionId: string
): LauncherOrder {
  return currentOrder.filter(
    (item) => !(item.type === 'collection' && item.id === collectionId)
  );
}

/**
 * Add a bookmark to list ordering
 * Works for both top-level ordering (list/grid mode) and collection ordering
 * @param currentOrder - Current list/collection order array
 * @param bookmarkId - ID of bookmark to add
 * @param position - Optional position (defaults to end)
 */
export function addBookmarkToListOrder(
  currentOrder: ListOrder | CollectionOrder,
  bookmarkId: string,
  position?: number
): ListOrder {
  if (position !== undefined && position >= 0 && position <= currentOrder.length) {
    return [
      ...currentOrder.slice(0, position),
      bookmarkId,
      ...currentOrder.slice(position),
    ];
  }
  
  return [...currentOrder, bookmarkId];
}

/**
 * Remove a bookmark from list ordering
 * Works for both top-level ordering (list/grid mode) and collection ordering
 * @param currentOrder - Current list/collection order array
 * @param bookmarkId - ID of bookmark to remove
 */
export function removeBookmarkFromListOrder(
  currentOrder: ListOrder | CollectionOrder,
  bookmarkId: string
): ListOrder {
  return currentOrder.filter((id) => id !== bookmarkId);
}

/**
 * Clean up launcher order by removing non-existent items
 * Use after bulk deletions or database inconsistencies
 * 
 * @param order - Current launcher order
 * @param existingBookmarks - Set of existing bookmark IDs
 * @param existingCollections - Set of existing collection IDs
 */
export function cleanupLauncherOrder(
  order: LauncherOrder,
  existingBookmarks: Set<string>,
  existingCollections: Set<string>
): LauncherOrder {
  return order.filter((item) => {
    if (item.type === 'bookmark') return existingBookmarks.has(item.id);
    if (item.type === 'collection') return existingCollections.has(item.id);
    return false;
  });
}

/**
 * Clean up list order by removing non-existent bookmarks
 * Works for both top-level ordering (list/grid mode) and collection ordering
 * Use after bulk deletions or database inconsistencies
 * 
 * @param order - Current list/collection order
 * @param existingBookmarks - Set of existing bookmark IDs
 */
export function cleanupListOrder(
  order: ListOrder | CollectionOrder,
  existingBookmarks: Set<string>
): ListOrder {
  return order.filter((id) => existingBookmarks.has(id));
}

/**
 * Initialize empty launcher order
 */
export function createEmptyLauncherOrder(): LauncherOrder {
  return [];
}

/**
 * Initialize empty list order
 */
export function createEmptyListOrder(): ListOrder {
  return [];
}

