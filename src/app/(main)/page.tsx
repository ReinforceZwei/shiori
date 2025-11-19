import { getBookmarks } from "@/features/bookmark/service";
import { getCollectionsWithBookmarks } from "@/features/collection/service";
import { requireUser } from "@/lib/auth";
import { BookmarkLauncherGrid } from "./BookmarkLauncherGrid";
import { getOrder } from "@/features/order/service";

// Helper function to sort items based on order array
function sortByOrder<T extends { id: string }>(items: T[], orderArray: string[] | null | undefined): T[] {
  if (!orderArray || orderArray.length === 0) {
    return items;
  }
  
  // Create a map for quick lookup of order positions
  const orderMap = new Map(orderArray.map((id, index) => [id, index]));
  
  return [...items].sort((a, b) => {
    const orderA = orderMap.get(a.id);
    const orderB = orderMap.get(b.id);
    
    // If both items are in the order array, sort by their positions
    if (orderA !== undefined && orderB !== undefined) {
      return orderA - orderB;
    }
    
    // Items in the order array come first
    if (orderA !== undefined) return -1;
    if (orderB !== undefined) return 1;
    
    // Items not in order array maintain their original relative order
    return 0;
  });
}

export default async function IndexPage() {
  const user = await requireUser();
  const bookmarks = await getBookmarks({ userId: user.id });
  const collections = await getCollectionsWithBookmarks({ userId: user.id });
  
  // Filter bookmarks without a collection (uncollected)
  const uncollectedBookmarks = bookmarks.filter(b => !b.collectionId);

  // Get order for uncollected bookmarks
  const uncollectedBookmarksOrder = await getOrder({
    userId: user.id, 
    type: 'bookmark', 
    collectionId: null,
  });
  
  // Sort uncollected bookmarks based on order
  const sortedUncollectedBookmarks = sortByOrder(
    uncollectedBookmarks, 
    uncollectedBookmarksOrder?.order as string[] | null
  );
  
  // Sort bookmarks within each collection
  const sortedCollections = await Promise.all(
    collections.map(async (collection) => {
      // Get order for this collection's bookmarks
      const collectionBookmarksOrder = await getOrder({
        userId: user.id,
        type: 'bookmark',
        collectionId: collection.id,
      });
      
      // Sort the bookmarks in this collection
      const sortedBookmarks = sortByOrder(
        collection.bookmark,
        collectionBookmarksOrder?.order as string[] | null
      );
      
      return {
        ...collection,
        bookmark: sortedBookmarks,
      };
    })
  );
  
  return (
    <BookmarkLauncherGrid 
      uncollectedBookmarks={sortedUncollectedBookmarks}
      collections={sortedCollections}
    />
  );
}