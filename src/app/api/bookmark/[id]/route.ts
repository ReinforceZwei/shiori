import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

// Get a single bookmark by ID
export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 });
  }

  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: { id, userId: user.id },
    });

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    return NextResponse.json(bookmark);
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred while fetching the bookmark' }, { status: 500 });
  }
}