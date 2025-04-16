import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

// Create a new bookmark
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await request.json();
  const bookmark = await prisma.bookmark.create({
    userId: user.id,
    ...data,
  });
  return NextResponse.json(bookmark);
}

// Get all bookmarks
export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
  });
  return NextResponse.json(bookmarks);
}

// Update a bookmark
export async function PUT(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await request.json();
  const { id, ...updateData } = data;
  const bookmark = await prisma.bookmark.update({
    where: { id, userId: user.id },
    data: updateData,
  });
  return NextResponse.json(bookmark);
}

// Delete a bookmark
export async function DELETE(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await request.json();
  await prisma.bookmark.delete({
    where: { id, userId: user.id },
  });
  return NextResponse.json({ message: 'Bookmark deleted successfully' });
}