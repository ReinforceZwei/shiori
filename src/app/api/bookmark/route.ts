import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { withAuth } from '@/lib/with-auth';
import { BookmarkService } from '@/features/bookmark/service';

// Create a new bookmark
export const POST = withAuth(async (request, { user }) => {
  const data = await request.json();
  const bookmarkService = new BookmarkService();
  const bookmark = await bookmarkService.create({
    userId: user.id,
    ...data,
  });
  
  // Revalidate the main layout to update all bookmark-related UI
  revalidatePath('/(main)', 'layout');
  
  return NextResponse.json(bookmark);
});

// Get all bookmarks
export const GET = withAuth(async (request, { user }) => {
  const bookmarkService = new BookmarkService();
  const bookmarks = await bookmarkService.getAll({ userId: user.id });
  return NextResponse.json(bookmarks);
});

// Update a bookmark
export const PUT = withAuth(async (request, { user }) => {
  const data = await request.json();
  const bookmarkService = new BookmarkService();
  const bookmark = await bookmarkService.update({
    userId: user.id,
    ...data,
  });
  
  // Revalidate the main layout to update all bookmark-related UI
  revalidatePath('/(main)', 'layout');
  
  return NextResponse.json(bookmark);
});

// Delete a bookmark
export const DELETE = withAuth(async (request, { user }) => {
  const { id } = await request.json();
  const bookmarkService = new BookmarkService();
  await bookmarkService.delete({
    id,
    userId: user.id,
  });
  
  // Revalidate the main layout to update all bookmark-related UI
  revalidatePath('/(main)', 'layout');
  
  return NextResponse.json({ message: 'Bookmark deleted successfully' });
});