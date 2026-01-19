import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { BookmarkService } from '@/features/bookmark/service';

// Lookup bookmarks by exact URL
export const GET = withAuth(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' }, 
      { status: 400 }
    );
  }

  const bookmarkService = new BookmarkService();
  const bookmarks = await bookmarkService.getByUrl({
    url,
    userId: user.id,
  });

  return NextResponse.json({
    exists: bookmarks.length > 0,
    count: bookmarks.length,
    bookmarks,
  });
});

