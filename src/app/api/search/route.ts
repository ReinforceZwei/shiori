import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { SearchService } from '@/features/search/service';

// Search bookmarks
export const GET = withAuth(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || searchParams.get('query') || '';

  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  const searchService = new SearchService();
  const results = await searchService.search({
    query,
    userId: user.id,
    limit: 10,
  });

  return NextResponse.json(results);
});

