import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { getBackgroundImage } from '@/features/wallpaper/service';
import { BadRequestError, NotFoundError } from '@/lib/errors';

// Get a single background image's metadata (without binary data)
export const GET = withAuth(async (request, { params, user }) => {
  const { id } = await params;

  if (!id) {
    throw new BadRequestError('Background image ID is required');
  }

  const backgroundImage = await getBackgroundImage({ 
    id, 
    userId: user.id 
  });

  if (!backgroundImage) {
    throw new NotFoundError(`BackgroundImage(id: ${id}) not found`);
  }

  // Return metadata only (exclude binary data)
  const { data: _, ...metadata } = backgroundImage;

  return NextResponse.json(metadata);
});

