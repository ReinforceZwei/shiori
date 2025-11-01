import { Skeleton } from "@mantine/core";
import { BookmarkListLoading } from "@/features/bookmark/component/BookmarkList/BookmarkList";

export default function Loading() {
  return (
    <div>
      <Skeleton height={32} width="40%" mb={16} />
      <Skeleton height={20} width="60%" mb={8} />
      <BookmarkListLoading />
    </div>
  );
}