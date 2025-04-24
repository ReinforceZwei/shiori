import styles from "./BookmarkList.module.css";
import { Prisma } from "@/generated/prisma";
import BookmarkItem from "../BookmarkItem/BookmarkItem";
import { BookmarkItemLoading } from "../BookmarkItem/BookmarkItem";

interface BookmarkListProps {
  bookmarks?: Prisma.BookmarkGetPayload<{}>[];
}

export default function BookmarkList({ bookmarks }: BookmarkListProps) {
  if (!bookmarks || bookmarks.length === 0) {
    return null;
  }
  return (
    <ul className={styles.list}>
      {bookmarks.map((bookmark) => (
        <BookmarkItem key={bookmark.id} bookmark={bookmark} />
      ))}
    </ul>
  );
}

export function BookmarkListLoading() {
  return (
    <ul className={styles.list}>
      {Array.from({ length: 5 }).map((_, index) => (
        <BookmarkItemLoading key={index} />
      ))}
    </ul>
  );
}