import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { withAuth } from '@/lib/with-auth';
import { WallpaperService } from '@/features/wallpaper/service';

// Get all background images (metadata only, without binary data)
export const GET = withAuth(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const deviceType = searchParams.get('deviceType') as 'desktop' | 'mobile' | 'all' | null;
  const activeOnly = searchParams.get('active') === 'true';

  const wallpaperService = new WallpaperService();
  // Get background images metadata (excludes binary data at DB level)
  const backgroundImages = await wallpaperService.getAllMetadata({
    userId: user.id,
    ...(deviceType ? { deviceType } : {}),
  });

  // Filter by active status if requested
  const metadata = activeOnly
    ? backgroundImages.filter(img => img.isActive)
    : backgroundImages;

  return NextResponse.json(metadata);
});

// Create a new background image
export const POST = withAuth(async (request, { user }) => {
  const data = await request.json();
  const wallpaperService = new WallpaperService();
  const backgroundImage = await wallpaperService.create({
    userId: user.id,
    ...data,
  });

  // Revalidate the main layout to update UI
  revalidatePath('/(main)', 'layout');

  // Return metadata only (exclude binary data)
  const { data: _, ...metadata } = backgroundImage;

  return NextResponse.json(metadata);
});

// Update a background image
export const PUT = withAuth(async (request, { user }) => {
  const data = await request.json();
  const wallpaperService = new WallpaperService();
  const backgroundImage = await wallpaperService.update({
    userId: user.id,
    ...data,
  });

  // Revalidate the main layout to update UI
  revalidatePath('/(main)', 'layout');

  // Return metadata only (exclude binary data)
  const { data: _, ...metadata } = backgroundImage;

  return NextResponse.json(metadata);
});

// Delete a background image
export const DELETE = withAuth(async (request, { user }) => {
  const { id } = await request.json();
  const wallpaperService = new WallpaperService();
  await wallpaperService.delete({
    id,
    userId: user.id,
  });

  // Revalidate the main layout to update UI
  revalidatePath('/(main)', 'layout');

  return NextResponse.json({ message: 'Background image deleted successfully' });
});

