'use client';
import BookmarkList, { BookmarkListLoading } from "@/features/bookmark/component/BookmarkList/BookmarkList";
import { useQueryBookmarksQuery } from "@/features/bookmark/hook";

export default function CollectionPage() {
  const { data: bookmarks, isPending } = useQueryBookmarksQuery({ collectionId: null })
  return (
    <div>
      <h1>Collection</h1>
      <p>Uncategorized bookmarks</p>
      {isPending && <BookmarkListLoading />}
      {bookmarks && bookmarks.length === 0 && (
        <div>
          <h2>No bookmarks found</h2>
          <p>This collection has no bookmarks.</p>
        </div>
      )}
      {bookmarks && bookmarks.length > 0 && (
        <BookmarkList bookmarks={bookmarks} />
      )}
    </div>
  );
}