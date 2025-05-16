import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: { 
        id,
        userId: user.id 
      },
      include: {
        websiteIcon: true
      }
    });

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    if (!bookmark.websiteIcon) {
      return new Response(null, { 
        status: 204,
        headers: {
          'Cache-Control': 'public, max-age=3600' // Cache "no icon" response for 1 hour
        }
      });
    }

    const response = NextResponse.json({ 
      data: bookmark.websiteIcon.data 
    });

    // Cache successful responses for 1 week since icons rarely change
    response.headers.set('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
    response.headers.set('Last-Modified', bookmark.websiteIcon.updatedAt.toUTCString());

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while fetching the website icon' },
      { status: 500 }
    );
  }
}