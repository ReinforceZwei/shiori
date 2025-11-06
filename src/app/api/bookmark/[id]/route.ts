import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { getBookmark } from '@/features/bookmark/service';
import { BadRequestError, NotFoundError } from '@/lib/errors';

// Get a single bookmark by ID
export const GET = withAuth(async (request, { params, user }) => {
  const { id } = await params;

  if (!id) {
    throw new BadRequestError('Bookmark ID is required');
  }

  const bookmark = await getBookmark({ id, userId: user.id });

  if (!bookmark) {
    throw new NotFoundError(`Bookmark(id: ${id}) not found`);
  }

  return NextResponse.json(bookmark);
});