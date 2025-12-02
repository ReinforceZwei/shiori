import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { BookmarkService } from '@/features/bookmark/service';
import { BadRequestError, NotFoundError } from '@/lib/errors';

// Get a single bookmark by ID
export const GET = withAuth(async (request, { params, user }) => {
  const { id } = await params;

  if (!id) {
    throw new BadRequestError('Bookmark ID is required');
  }

  const bookmarkService = new BookmarkService();
  const bookmark = await bookmarkService.getWithIcon({ id, userId: user.id });

  if (!bookmark) {
    throw new NotFoundError(`Bookmark(id: ${id}) not found`);
  }

  // Convert websiteIcon Buffer to base64 for JSON serialization
  const response = {
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description,
    collectionId: bookmark.collectionId,
    userId: bookmark.userId,
    createdAt: bookmark.createdAt,
    updatedAt: bookmark.updatedAt,
    websiteIcon: bookmark.websiteIcon 
      ? Buffer.from(bookmark.websiteIcon.data).toString('base64')
      : null,
    websiteIconMimeType: bookmark.websiteIcon?.mimeType || null,
  };

  return NextResponse.json(response);
});