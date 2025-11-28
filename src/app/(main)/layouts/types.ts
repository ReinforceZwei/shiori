import { Prisma } from "@/lib/prisma";

/**
 * Bookmark with websiteIcon (only id field included for websiteIcon)
 */
export type BookmarkWithIcon = Prisma.BookmarkGetPayload<{
  include: { websiteIcon: { select: { id: true } } };
}>;

/**
 * Collection with bookmarks that include websiteIcon
 */
export type CollectionWithBookmarks = Prisma.CollectionGetPayload<{
  include: {
    bookmark: {
      include: { websiteIcon: { select: { id: true } } };
    };
  };
}>;

/**
 * Props interface for layouts that display uncollected bookmarks and collections
 */
export interface BookmarkLayoutProps {
  uncollectedBookmarks: BookmarkWithIcon[];
  collections: CollectionWithBookmarks[];
}

