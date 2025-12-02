'use server';

import { revalidatePath } from 'next/cache';
import { WallpaperService } from '@/features/wallpaper/service';
import { requireUser } from '@/lib/auth';

/**
 * Server action to upload a new background image
 * Automatically revalidates the UI after creation
 */
export async function createBackgroundImageAction(formData: {
  data: string; // base64 encoded image
  filename?: string;
  deviceType?: 'desktop' | 'mobile' | 'all';
  isActive?: boolean;
  displaySize?: string;
  displayPosition?: string;
  displayRepeat?: string;
  displayOpacity?: number;
  displayBlur?: number;
}) {
  try {
    const user = await requireUser();
    
    const wallpaperService = new WallpaperService();
    const backgroundImage = await wallpaperService.create({
      userId: user.id,
      data: formData.data,
      filename: formData.filename,
      deviceType: formData.deviceType || 'all',
      isActive: formData.isActive ?? false,
      displaySize: formData.displaySize || 'cover',
      displayPosition: formData.displayPosition || 'center',
      displayRepeat: formData.displayRepeat || 'no-repeat',
      displayOpacity: formData.displayOpacity ?? 1.0,
      displayBlur: formData.displayBlur ?? 0,
    });
    
    // Revalidate the main layout and settings page
    revalidatePath('/(main)', 'layout');
    revalidatePath('/settings');
    
    return { success: true, data: backgroundImage };
  } catch (error) {
    console.error('Error in createBackgroundImageAction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to upload wallpaper'
    };
  }
}

/**
 * Server action to update an existing background image
 * Automatically revalidates the UI after update
 */
export async function updateBackgroundImageAction(
  id: string,
  formData: {
    data?: string;
    filename?: string;
    deviceType?: 'desktop' | 'mobile' | 'all';
    isActive?: boolean;
    displaySize?: string;
    displayPosition?: string;
    displayRepeat?: string;
    displayOpacity?: number;
    displayBlur?: number;
  }
) {
  try {
    const user = await requireUser();
    
    const wallpaperService = new WallpaperService();
    const backgroundImage = await wallpaperService.update({
      id,
      userId: user.id,
      ...formData,
    });
    
    // Revalidate the main layout and settings page
    revalidatePath('/(main)', 'layout');
    revalidatePath('/settings');
    
    return { success: true, data: backgroundImage };
  } catch (error) {
    console.error('Error in updateBackgroundImageAction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update wallpaper'
    };
  }
}

/**
 * Server action to set the active state of a background image
 * Automatically revalidates the UI after update
 */
export async function setActiveBackgroundImageAction(
  id: string,
  isActive: boolean
) {
  try {
    const user = await requireUser();
    
    const wallpaperService = new WallpaperService();
    const backgroundImage = await wallpaperService.setActive({
      id,
      userId: user.id,
      isActive,
    });
    
    // Revalidate the main layout and settings page
    revalidatePath('/(main)', 'layout');
    revalidatePath('/settings');
    
    return { success: true, data: backgroundImage };
  } catch (error) {
    console.error('Error in setActiveBackgroundImageAction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to set wallpaper active state'
    };
  }
}

/**
 * Server action to delete a background image
 * Automatically revalidates the UI after deletion
 */
export async function deleteBackgroundImageAction(id: string) {
  try {
    const user = await requireUser();
    
    const wallpaperService = new WallpaperService();
    await wallpaperService.delete({
      id,
      userId: user.id,
    });
    
    // Revalidate the main layout and settings page
    revalidatePath('/(main)', 'layout');
    revalidatePath('/settings');
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteBackgroundImageAction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete wallpaper'
    };
  }
}

