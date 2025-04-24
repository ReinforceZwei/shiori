'use client';
import { queryBookmarks } from "@/features/bookmark/api";
import BookmarkList, { BookmarkListLoading } from "@/features/bookmark/component/BookmarkList/BookmarkList";
import { useQuery } from "@tanstack/react-query";

export default function CollectionPage() {
  const { data: bookmarks, isPending } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: () => queryBookmarks({ collectionId: null }),
  })
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