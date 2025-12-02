'use server';

import { revalidatePath } from 'next/cache';
import { CollectionService } from '@/features/collection/service';
import { requireUser } from '@/lib/auth';

/**
 * Server action to create a new collection
 * Automatically revalidates the UI after creation
 */
export async function createCollectionAction(formData: {
  name: string;
  description?: string;
  color?: string;
}) {
  try {
    const user = await requireUser();
    
    const collectionService = new CollectionService();
    const collection = await collectionService.create({
      userId: user.id,
      ...formData,
    });
    
    // Revalidate the main layout to update all collection-related UI
    revalidatePath('/(main)', 'layout');
    
    return { success: true, data: collection };
  } catch (error) {
    console.error('Error in createCollectionAction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create collection'
    };
  }
}

/**
 * Server action to update an existing collection
 * Automatically revalidates the UI after update
 */
export async function updateCollectionAction(
  id: string,
  formData: {
    name?: string;
    description?: string | null;
    color?: string | null;
  }
) {
  try {
    const user = await requireUser();
    
    const collectionService = new CollectionService();
    const collection = await collectionService.update({
      id,
      userId: user.id,
      ...formData,
    });
    
    // Revalidate the main layout to update all collection-related UI
    revalidatePath('/(main)', 'layout');
    
    return { success: true, data: collection };
  } catch (error) {
    console.error('Error in updateCollectionAction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update collection'
    };
  }
}

/**
 * Server action to delete a collection
 * Automatically revalidates the UI after deletion
 */
export async function deleteCollectionAction(id: string) {
  try {
    const user = await requireUser();
    
    const collectionService = new CollectionService();
    await collectionService.delete({
      id,
      userId: user.id,
    });
    
    // Revalidate the main layout to update all collection-related UI
    revalidatePath('/(main)', 'layout');
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteCollectionAction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete collection'
    };
  }
}

