'use client';
import BookmarkList from "@/features/bookmark/component/BookmarkList/BookmarkList";
import { BookmarkListLoading } from "@/features/bookmark/component/BookmarkList/BookmarkList";
import { getCollection } from "@/features/collection/api";
import { Prisma } from "@/generated/prisma";
import { Alert, Skeleton } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

type CollectionWithBookmarks = Prisma.CollectionGetPayload<{ include: { bookmark: true } }>;

export function CollectionBookmarksPageLoading() {
  return (
    <div>
      <Skeleton height={32} width="40%" mb={16} />
      <Skeleton height={20} width="60%" mb={8} />
      <BookmarkListLoading />
    </div>
  );
}

export default function CollectionBookmarksPage() {
  const { id } = useParams<{ id: string }>();
  const { data: collection, isPending, isLoadingError, error } = useQuery({
    queryKey: ["collection", id],
    queryFn: () => getCollection(id, { bookmark: true }) as unknown as CollectionWithBookmarks,
  })
  if (isPending) {
    return <CollectionBookmarksPageLoading />;
  }
  if (isLoadingError && error && !collection) {
    console.error("Error loading collection:", error);
    return (
      <Alert title="Error loading collection" color="red">
        {error.message}
      </Alert>
    );
  }
  if (!collection) {
    // TODO: make a shared 404 component
    return (
      <div>
        <h1>Collection not found</h1>
        <p>The collection you are looking for does not exist.</p>
      </div>
    );
  }
  if (collection.bookmark.length === 0) {
    return (
      <div>
        <h1>No bookmarks found</h1>
        <p>This collection has no bookmarks.</p>
      </div>
    );
  }
  return (
    <div>
      <h1>{collection.name}</h1>
      { collection.description && <p>{collection.description}</p>}
      <BookmarkList bookmarks={collection.bookmark} />
    </div>
  );
}