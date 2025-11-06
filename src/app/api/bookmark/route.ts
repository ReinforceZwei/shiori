import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import {
  createBookmark,
  getBookmarks,
  updateBookmark,
  deleteBookmark,
} from '@/features/bookmark/service';

// Create a new bookmark
export const POST = withAuth(async (request, { user }) => {
  const data = await request.json();
  const bookmark = await createBookmark({
    userId: user.id,
    ...data,
  });
  return NextResponse.json(bookmark);
});

// Get all bookmarks
export const GET = withAuth(async (request, { user }) => {
  const bookmarks = await getBookmarks({ userId: user.id });
  return NextResponse.json(bookmarks);
});

// Update a bookmark
export const PUT = withAuth(async (request, { user }) => {
  const data = await request.json();
  const bookmark = await updateBookmark({
    userId: user.id,
    ...data,
  });
  return NextResponse.json(bookmark);
});

// Delete a bookmark
export const DELETE = withAuth(async (request, { user }) => {
  const { id } = await request.json();
  await deleteBookmark({
    id,
    userId: user.id,
  });
  return NextResponse.json({ message: 'Bookmark deleted successfully' });
});