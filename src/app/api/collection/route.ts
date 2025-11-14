import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { withAuth } from '@/lib/with-auth';
import {
  createCollection,
  getCollections,
  updateCollection,
  deleteCollection,
} from '@/features/collection/service';

// Create a new collection
export const POST = withAuth(async (request, { user }) => {
  const data = await request.json();
  const collection = await createCollection({
    userId: user.id,
    ...data,
  });
  
  // Revalidate the main layout to update all collection-related UI
  revalidatePath('/(main)', 'layout');
  
  return NextResponse.json(collection);
});

// Get all collections
export const GET = withAuth(async (request, { user }) => {
  const collections = await getCollections({ userId: user.id });
  return NextResponse.json(collections);
});

// Update a collection
export const PUT = withAuth(async (request, { user }) => {
  const data = await request.json();
  const collection = await updateCollection({
    userId: user.id,
    ...data,
  });
  
  // Revalidate the main layout to update all collection-related UI
  revalidatePath('/(main)', 'layout');
  
  return NextResponse.json(collection);
});

// Delete a collection
export const DELETE = withAuth(async (request, { user }) => {
  const { id } = await request.json();
  await deleteCollection({
    id,
    userId: user.id,
  });
  
  // Revalidate the main layout to update all collection-related UI
  revalidatePath('/(main)', 'layout');
  
  return NextResponse.json({ message: 'Collection deleted successfully' });
});

