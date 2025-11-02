import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/with-auth';

export const GET = withAuth(async (request, { params, user }) => {
  const { id } = await params;

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
});