import { getBookmarks } from "@/features/bookmark/service";
import { requireUser } from "@/lib/auth";
import { BookmarkLauncherGrid } from "./BookmarkLauncherGrid";

export default async function IndexPage() {
  const user = await requireUser();
  const bookmarks = await getBookmarks({ userId: user.id });

  return <BookmarkLauncherGrid bookmarks={bookmarks} />;
}