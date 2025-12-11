import { BookmarkService } from "@/features/bookmark/service";
import { CollectionService } from "@/features/collection/service";
import { requireUser } from "@/lib/auth";
import { BookmarkLauncherGrid } from "./layouts/launcher/BookmarkLauncherGrid";
import { OrderService } from "@/features/order/service";
import { BookmarkWithIcon, CollectionWithBookmarks } from "./layouts/types";
import { WallpaperService, WallpaperDisplay } from "@/features/wallpaper";

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
  const bookmarkService = new BookmarkService();
  const collectionService = new CollectionService();
  const wallpaperService = new WallpaperService();
  const uncollectedBookmarks = await bookmarkService.getAllUncollected({ userId: user.id });
  const collections = await collectionService.getAllWithBookmarks({ userId: user.id });
  const wallpapers = await wallpaperService.getAllActiveMetadata({ userId: user.id });

  const orderService = new OrderService();

  // Get order for uncollected bookmarks
  const uncollectedBookmarksOrder = await orderService.get({
    userId: user.id, 
    type: 'bookmark', 
    collectionId: null,
  });
  
  // Sort uncollected bookmarks based on order
  const sortedUncollectedBookmarks: BookmarkWithIcon[] = sortByOrder(
    uncollectedBookmarks, 
    uncollectedBookmarksOrder?.order as string[] | null
  );
  
  // Get order for collections
  const collectionsOrder = await orderService.get({
    userId: user.id,
    type: 'collection',
    collectionId: null,
  });
  
  // Sort collections based on order
  const sortedCollections = sortByOrder(
    collections,
    collectionsOrder?.order as string[] | null
  );
  
  // Sort bookmarks within each collection
  const sortedCollectionsWithBookmarks: CollectionWithBookmarks[] = await Promise.all(
    sortedCollections.map(async (collection) => {
      // Get order for this collection's bookmarks
      const collectionBookmarksOrder = await orderService.get({
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
    <>
      <WallpaperDisplay wallpapers={wallpapers} />
      <BookmarkLauncherGrid 
        uncollectedBookmarks={sortedUncollectedBookmarks}
        collections={sortedCollectionsWithBookmarks}
      />
    </>
  );
}