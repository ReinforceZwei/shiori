'use server';

import { revalidatePath } from 'next/cache';
import {
  createBookmark as createBookmarkService,
  updateBookmark as updateBookmarkService,
  moveBookmark as moveBookmarkService,
  deleteBookmark as deleteBookmarkService,
} from '@/features/bookmark/service';
import { requireUser } from '@/lib/auth';

/**
 * Server action to create a new bookmark
 * Automatically revalidates the UI after creation
 */
export async function createBookmarkAction(formData: {
  title: string;
  url: string;
  description?: string;
  collectionId?: string;
  websiteIcon?: { data: string };
}) {
  try {
    const user = await requireUser();
    
    const bookmark = await createBookmarkService({
      userId: user.id,
      ...formData,
    });
    
    // Revalidate the main layout to update all bookmark-related UI
    revalidatePath('/(main)', 'layout');
    
    return { success: true, data: bookmark };
  } catch (error) {
    console.error('Error in createBookmarkAction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create bookmark'
    };
  }
}

/**
 * Server action to update an existing bookmark
 * Automatically revalidates the UI after update
 */
export async function updateBookmarkAction(
  id: string,
  formData: {
    title?: string;
    url?: string;
    description?: string;
    collectionId?: string | null;
    websiteIcon?: { data: string };
  }
) {
  try {
    const user = await requireUser();
    
    const bookmark = await updateBookmarkService({
      id,
      userId: user.id,
      ...formData,
    });
    
    // Revalidate the main layout to update all bookmark-related UI
    revalidatePath('/(main)', 'layout');
    
    return { success: true, data: bookmark };
  } catch (error) {
    console.error('Error in updateBookmarkAction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update bookmark'
    };
  }
}

/**
 * Server action to move a bookmark to a different collection with specific order
 * Automatically revalidates the UI after moving
 */
export async function moveBookmarkAction(
  id: string,
  targetCollectionId: string | null,
  targetOrder: string[]
) {
  try {
    const user = await requireUser();
    
    const bookmark = await moveBookmarkService({
      id,
      userId: user.id,
      targetCollectionId,
      targetOrder,
    });
    
    // Revalidate the main layout to update all bookmark-related UI
    revalidatePath('/(main)', 'layout');
    
    return { success: true, data: bookmark };
  } catch (error) {
    console.error('Error in moveBookmarkAction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to move bookmark'
    };
  }
}

/**
 * Server action to delete a bookmark
 * Automatically revalidates the UI after deletion
 */
export async function deleteBookmarkAction(id: string) {
  try {
    const user = await requireUser();
    
    await deleteBookmarkService({
      id,
      userId: user.id,
    });
    
    // Revalidate the main layout to update all bookmark-related UI
    revalidatePath('/(main)', 'layout');
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteBookmarkAction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete bookmark'
    };
  }
}

