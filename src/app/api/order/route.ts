import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { getOrder, upsertOrder } from '@/features/order/service';

/**
 * Get an order record
 * Query params:
 * - type: 'collection' | 'bookmark' (required)
 * - collectionId: string (optional, null for top-level)
 */
export const GET = withAuth(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const collectionId = searchParams.get('collectionId');

  if (!type || (type !== 'collection' && type !== 'bookmark')) {
    return NextResponse.json(
      { error: 'Invalid type parameter. Must be "collection" or "bookmark"' },
      { status: 400 }
    );
  }

  const order = await getOrder({
    userId: user.id,
    type: type as 'collection' | 'bookmark',
    collectionId: collectionId === 'null' ? null : collectionId,
  });

  return NextResponse.json(order);
});

/**
 * Upsert (create or update) an order record
 * Body:
 * - type: 'collection' | 'bookmark' (required)
 * - order: string[] (required) - array of IDs
 * - collectionId: string | null (optional, null for top-level)
 */
export const POST = withAuth(async (request, { user }) => {
  const data = await request.json();

  const order = await upsertOrder({
    userId: user.id,
    ...data,
  });

  return NextResponse.json(order);
});

