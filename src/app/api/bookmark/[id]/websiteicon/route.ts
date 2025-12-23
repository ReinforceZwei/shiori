import { withAuth } from '@/lib/with-auth';
import { BookmarkService } from '@/features/bookmark/service';
import { NotFoundError } from '@/lib/errors';

export const GET = withAuth(async (request, { params, user }) => {
  const { id } = await params;

  const bookmarkService = new BookmarkService();
  const bookmark = await bookmarkService.getWithIcon({ 
    id, 
    userId: user.id 
  });

  if (!bookmark) {
    throw new NotFoundError(`Bookmark(id: ${id}) not found`);
  }

  if (!bookmark.websiteIcon) {
    return new Response(null, { 
      status: 204,
      headers: {
        'Cache-Control': 'public, max-age=3600' // Cache "no icon" response for 1 hour
      }
    });
  }

  // Return the image binary data with appropriate content type
  return new Response(bookmark.websiteIcon.data, {
    status: 200,
    headers: {
      'Content-Type': bookmark.websiteIcon.mimeType,
      'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400', // Cache for 1 week
      'Last-Modified': bookmark.websiteIcon.updatedAt.toUTCString(),
    }
  });
});