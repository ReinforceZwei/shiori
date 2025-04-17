'use client';

import { useEffect, useState } from "react";
import { getBookmarks } from "../../api";
import styles from "./BookmarkList.module.css";

export default function BookmarkList() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  useEffect(() => {
    getBookmarks().then((bookmarks) => {
      setBookmarks(bookmarks);
    });
  }, []);
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bookmark List</h1>
      <ul className={styles.list}>
        {bookmarks.map((bookmark) => (
          <li key={bookmark.id} className={styles.listItem}>{bookmark.title}</li>
        ))}
      </ul>
    </div>
  );
}