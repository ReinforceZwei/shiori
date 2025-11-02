import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/with-auth';

// Create a new bookmark
export const POST = withAuth(async (request, { user }) => {
  const data = await request.json();
  const bookmark = await prisma.bookmark.create({
    data: {
      userId: user.id,
      ...data,
    },
  });
  return NextResponse.json(bookmark);
});

// Get all bookmarks
export const GET = withAuth(async (request, { user }) => {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
  });
  return NextResponse.json(bookmarks);
});

// Update a bookmark
export const PUT = withAuth(async (request, { user }) => {
  const data = await request.json();
  const { id, ...updateData } = data;
  const bookmark = await prisma.bookmark.update({
    where: { id, userId: user.id },
    data: updateData,
  });
  return NextResponse.json(bookmark);
});

// Delete a bookmark
export const DELETE = withAuth(async (request, { user }) => {
  const { id } = await request.json();
  await prisma.bookmark.delete({
    where: { id, userId: user.id },
  });
  return NextResponse.json({ message: 'Bookmark deleted successfully' });
});