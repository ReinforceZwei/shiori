import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { getCollection } from '@/features/collection/service';
import { BadRequestError, NotFoundError } from '@/lib/errors';

// Get a single collection by ID
export const GET = withAuth(async (request, { params, user }) => {
  const { id } = await params;

  if (!id) {
    throw new BadRequestError('Collection ID is required');
  }

  const collection = await getCollection({ id, userId: user.id });

  if (!collection) {
    throw new NotFoundError(`Collection(id: ${id}) not found`);
  }

  return NextResponse.json(collection);
});

