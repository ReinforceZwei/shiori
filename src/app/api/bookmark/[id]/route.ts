import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/with-auth';

// Get a single bookmark by ID
export const GET = withAuth(async (request, { params, user }) => {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 });
  }

  const bookmark = await prisma.bookmark.findUnique({
    where: { id, userId: user.id },
  });

  if (!bookmark) {
    return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
  }

  return NextResponse.json(bookmark);
});