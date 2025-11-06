import { withAuth } from '@/lib/with-auth';
import { getBookmarkWithWebsiteIcon } from '@/features/bookmark/service';
import { NotFoundError } from '@/lib/errors';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const GET = withAuth(async (request, { params, user }) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const useFallback = searchParams.get('fallback') === 'true';

  const bookmark = await getBookmarkWithWebsiteIcon({ 
    id, 
    userId: user.id 
  });

  if (!bookmark) {
    throw new NotFoundError(`Bookmark(id: ${id}) not found`);
  }

  // If no icon exists and fallback is requested, return fallback image
  if (!bookmark.websiteIcon && useFallback) {
    const fallbackPath = join(process.cwd(), 'public', 'assets', 'world-wide-web.png');
    const fallbackImage = await readFile(fallbackPath);
    
    return new Response(fallbackImage, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400', // Cache fallback for 1 day
      }
    });
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