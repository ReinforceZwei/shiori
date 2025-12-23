import { WebsiteIconService } from '@/features/website-icon/service';
import { NotFoundError } from '@/lib/errors';

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const websiteIconService = new WebsiteIconService();
  const icon = await websiteIconService.get({ id });

  if (!icon) {
    throw new NotFoundError(`WebsiteIcon(id: ${id}) not found`);
  }

  // Return the image binary data with appropriate content type
  // Cache for 1 year since icon IDs are unique and immutable
  return new Response(icon.data, {
    status: 200,
    headers: {
      'Content-Type': icon.mimeType,
      'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      'Last-Modified': icon.updatedAt.toUTCString(),
    }
  });
};

