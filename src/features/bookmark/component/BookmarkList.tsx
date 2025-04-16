'use client';

import { useEffect, useState } from "react";
import { getBookmarks } from "../api";

export default function BookmarkList() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  useEffect(() => {
    getBookmarks().then((bookmarks) => {
      setBookmarks(bookmarks);
    });
  }, []);
  return (
    <div>
      <h1>Bookmark List</h1>
      <ul>
        {bookmarks.map((bookmark) => (
          <li key={bookmark.id}>{bookmark.title}</li>
        ))}
      </ul>
    </div>
  );
}