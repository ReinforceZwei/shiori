import { withAuth } from '@/lib/with-auth';
import { WallpaperService } from '@/features/wallpaper/service';
import { BadRequestError, NotFoundError } from '@/lib/errors';

// Get the actual background image binary data (for use in <img src="/api/wallpaper/{id}" />)
export const GET = withAuth(async (request, { params, user }) => {
  const { id } = await params;

  if (!id) {
    throw new BadRequestError('Background image ID is required');
  }

  const wallpaperService = new WallpaperService();
  const backgroundImage = await wallpaperService.get({ 
    id, 
    userId: user.id 
  });

  if (!backgroundImage) {
    throw new NotFoundError(`BackgroundImage(id: ${id}) not found`);
  }

  // Return the image binary data with appropriate content type
  return new Response(backgroundImage.data, {
    status: 200,
    headers: {
      'Content-Type': backgroundImage.mimeType,
      'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400', // Cache for 1 week
      'Last-Modified': backgroundImage.updatedAt.toUTCString(),
    }
  });
});

