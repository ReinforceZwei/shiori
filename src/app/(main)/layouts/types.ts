import { BookmarkWithIcon, CollectionWithBookmarks } from "@/features/bookmark/types";

/**
 * Props interface for layouts that display uncollected bookmarks and collections
 */
export interface BookmarkLayoutProps {
  uncollectedBookmarks: BookmarkWithIcon[];
  collections: CollectionWithBookmarks[];
}

