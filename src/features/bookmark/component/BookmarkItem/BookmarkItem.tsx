import styles from "./BookmarkItem.module.css";
import { Prisma } from "@/generated/prisma";
import { Skeleton } from '@mantine/core';

interface BookmarkItemProps {
  bookmark: Prisma.BookmarkGetPayload<{}>;
}

export default function BookmarkItem({ bookmark }: BookmarkItemProps) {
  return (
    <li className={styles.listItem}>
      {bookmark.title}
    </li>
  );
}

export function BookmarkItemLoading() {
  return (
    <li className={styles.listItem}>
      <Skeleton height={20} width="60%" />
    </li>
  );
}