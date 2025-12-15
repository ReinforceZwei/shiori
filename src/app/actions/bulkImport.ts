'use server';

import { revalidatePath } from 'next/cache';
import { BulkService } from '@/features/bulk/service';
import { requireUser } from '@/lib/auth';
import { fetchFavicon, type FetchResult, type Icon } from '@reinforcezwei/favicon-fetcher';
import { fileTypeFromBuffer } from 'file-type';

/**
 * Select the best icon from available icons based on quality heuristics
 * 
 * Optimized for app icon usage (iOS home screen, macOS launcher, etc.)
 * Priority order:
 * 1. Size: Prefer larger icons (192px+) for high-DPI displays and scalability
 * 2. Format: Prefer SVG (scalable) > PNG (high quality) > others
 * 3. Type: Prefer apple-touch-icon > icon > others
 * 4. Source: Prefer manifest > html > default
 */
function selectBestIcon(icons: Icon[]): Icon | null {
  if (icons.length === 0) return null;
  
  const iconsWithMetadata = icons.filter(icon => icon.metadata?.buffer);
  if (iconsWithMetadata.length === 0) return null;

  const scored = iconsWithMetadata.map(icon => {
    let score = 0;
    const metadata = icon.metadata!;
    
    // Size scoring (prefer larger sizes for app icons)
    const minDimension = Math.min(metadata.width, metadata.height);
    if (minDimension >= 512) {
      score += 150; // Best for high-DPI displays
    } else if (minDimension >= 192) {
      score += 120; // Great for app icons
      // Bonus for common app icon sizes
      if (minDimension === 192 || minDimension === 256 || minDimension === 512) {
        score += 30;
      }
    } else if (minDimension >= 128) {
      score += 80; // Good
    } else if (minDimension >= 64) {
      score += 60; // Acceptable
    } else if (minDimension >= 32) {
      score += 40; // Usable
    } else {
      score += 20; // Too small
    }
    
    // Format preference (SVG is best for scalability)
    const formatLower = metadata.format.toLowerCase();
    if (formatLower === 'svg') {
      score += 100; // Perfect for any size, scalable
    } else if (formatLower === 'png') {
      score += 80; // High quality with transparency
    } else if (formatLower === 'webp') {
      score += 70; // Modern format with good quality
    } else if (formatLower === 'jpg' || formatLower === 'jpeg') {
      score += 50; // Good but no transparency
    } else if (formatLower === 'ico') {
      score += 30; // Traditional but limited
    } else {
      score += 20;
    }
    
    // Type preference
    const typeLower = icon.type.toLowerCase();
    if (typeLower.includes('apple-touch-icon')) {
      score += 50; // Designed for app icons
    } else if (typeLower === 'icon' || typeLower === 'shortcut icon') {
      score += 40;
    }
    
    // Source preference
    if (icon.source === 'manifest') {
      score += 30; // Usually curated for app usage
    } else if (icon.source === 'html') {
      score += 20;
    }
    
    return { icon, score };
  });
  
  // Sort by score (highest first) and return best
  scored.sort((a, b) => b.score - a.score);
  return scored[0].icon;
}

/**
 * Select the best description from available descriptions
 * 
 * Priority:
 * 1. OpenGraph description (og:description) - usually well-crafted for sharing
 * 2. Twitter description - also well-crafted
 * 3. HTML meta description - standard but good
 * 4. Manifest description - last resort (often app-specific)
 */
function selectBestDescription(descriptions: FetchResult['descriptions']): string | undefined {
  if (!descriptions || descriptions.length === 0) return undefined;
  
  // Try OpenGraph first
  const ogDesc = descriptions.find(d => d.source === 'opengraph');
  if (ogDesc?.value) return ogDesc.value;
  
  // Try Twitter
  const twitterDesc = descriptions.find(d => d.source === 'twitter');
  if (twitterDesc?.value) return twitterDesc.value;
  
  // Try HTML meta
  const htmlDesc = descriptions.find(d => d.source === 'html');
  if (htmlDesc?.value) return htmlDesc.value;
  
  // Fallback to manifest
  const manifestDesc = descriptions.find(d => d.source === 'manifest');
  if (manifestDesc?.value) return manifestDesc.value;
  
  return undefined;
}

/**
 * Process items with concurrency control to avoid overwhelming the server
 * Similar to p-limit pattern
 * Handles errors gracefully to ensure all results are populated
 */
async function processConcurrently<T, R>(
  items: T[],
  concurrency: number,
  processor: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  const executing: Set<Promise<void>> = new Set();
  
  for (const [index, item] of items.entries()) {
    // Wrap processor in error handling to ensure result is always set
    const promise = (async () => {
      try {
        results[index] = await processor(item);
      } catch (error) {
        console.error(`Error processing item at index ${index}:`, error);
        // Set a null/undefined result on error - this will be handled downstream
        results[index] = undefined as any;
      }
    })();
    
    executing.add(promise);
    promise.finally(() => executing.delete(promise));
    
    // Wait for at least one promise to complete when we hit concurrency limit
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  
  // Wait for all remaining promises
  await Promise.all(Array.from(executing));
  return results;
}

/**
 * Retry a promise with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Fetch metadata (icon and description) for a bookmark URL with retry logic
 */
async function fetchBookmarkMetadata(url: string): Promise<{
  websiteIcon?: { data: string; mimeType: string };
  description?: string;
} | null> {
  try {
    // Validate URL before fetching
    if (!url || typeof url !== 'string') {
      console.warn(`Invalid URL provided: ${url}`);
      return null;
    }

    // Retry up to 2 times with exponential backoff
    const result: FetchResult = await retryWithBackoff(
      () => fetchFavicon(url, {
        includeMetadata: true,
        timeout: 15000, // Increased from 10s to 15s
      }),
      2, // Max 2 retries (3 attempts total)
      1000 // Start with 1s delay
    );
    
    // Defensive check: ensure result has expected structure
    if (!result || !result.icons) {
      console.warn(`Invalid result structure for ${url}`);
      return null;
    }
    
    // Select best icon
    const bestIcon = selectBestIcon(result.icons);
    let websiteIcon: { data: string; mimeType: string } | undefined;
    
    if (bestIcon?.metadata?.buffer) {
      try {
        const buffer = bestIcon.metadata.buffer;
        
        // Detect MIME type from buffer
        const fileType = await fileTypeFromBuffer(buffer);
        let mimeType = fileType?.mime || `image/${bestIcon.metadata.format}`;
        
        // Special handling for SVG
        if (mimeType === 'application/xml' && bestIcon.metadata.format.toLowerCase() === 'svg') {
          mimeType = 'image/svg+xml';
        }
        
        websiteIcon = {
          data: buffer.toString('base64'),
          mimeType,
        };
      } catch (iconError) {
        console.warn(`Failed to process icon for ${url}:`, iconError);
        // Continue without icon rather than failing completely
      }
    }
    
    // Select best description
    const description = selectBestDescription(result.descriptions);
    
    return {
      websiteIcon,
      description,
    };
  } catch (error) {
    console.warn(`Failed to fetch metadata for ${url}:`, error);
    return null;
  }
}

/**
 * Server action to bulk import bookmarks with collections
 * Automatically fetches icons and descriptions before import
 * Automatically revalidates the UI after import
 * 
 * Features:
 * - Concurrency control: Max 8 concurrent metadata fetches to avoid overwhelming servers
 * - Retry logic: Up to 2 retries with exponential backoff for failed requests
 * - Graceful degradation: Failed fetches don't block the import
 */
export async function bulkImportBookmarksAction(data: {
  collections: Array<{
    mode: 'create' | 'existing' | 'uncollected';
    newName?: string;
    existingId?: string;
    bookmarks: Array<{
      title: string;
      url: string;
      description?: string;
      websiteIcon?: {
        data: string;
        mimeType: string;
      };
    }>;
  }>;
}) {
  try {
    const user = await requireUser();
    
    // Flatten all bookmarks from all collections for batch processing
    type BookmarkWithCollectionIndex = {
      bookmark: typeof data.collections[0]['bookmarks'][0];
      collectionIndex: number;
      bookmarkIndex: number;
    };
    
    const allBookmarks: BookmarkWithCollectionIndex[] = [];
    data.collections.forEach((collection, collectionIndex) => {
      collection.bookmarks.forEach((bookmark, bookmarkIndex) => {
        allBookmarks.push({ bookmark, collectionIndex, bookmarkIndex });
      });
    });
    
    console.log(`Starting metadata fetch for ${allBookmarks.length} bookmarks with concurrency limit of 8...`);
    const startTime = Date.now();
    
    // Fetch metadata with concurrency control (max 8 concurrent requests)
    const metadataResults = await processConcurrently(
      allBookmarks,
      8, // Concurrency limit
      async (item) => {
        try {
          const metadata = await fetchBookmarkMetadata(item.bookmark.url);
          return {
            ...item,
            metadata,
          };
        } catch (error) {
          console.error(`Failed to process metadata for bookmark at collection ${item.collectionIndex}, bookmark ${item.bookmarkIndex}:`, error);
          // Return item with null metadata instead of throwing
          return {
            ...item,
            metadata: null,
          };
        }
      }
    );
    
    const fetchDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    const successCount = metadataResults.filter(r => r && r.metadata !== null).length;
    console.log(`Metadata fetch completed in ${fetchDuration}s. Success: ${successCount}/${allBookmarks.length}`);
    
    // Reconstruct collections with enriched metadata
    const collectionsWithMetadata = data.collections.map((collection, collectionIndex) => {
      const bookmarksWithMetadata = collection.bookmarks.map((bookmark, bookmarkIndex) => {
        // Find the metadata result for this bookmark
        // Use defensive check to handle undefined results from failed fetches
        const result = metadataResults.find(
          r => r && r.collectionIndex === collectionIndex && r.bookmarkIndex === bookmarkIndex
        );
        const metadata = result?.metadata;
        
        // Merge fetched metadata with original bookmark data
        return {
          ...bookmark,
          // Use fetched description if available, otherwise keep original
          description: metadata?.description || bookmark.description,
          // Use fetched icon if available, otherwise keep original
          websiteIcon: metadata?.websiteIcon || bookmark.websiteIcon,
        };
      });
      
      return {
        ...collection,
        bookmarks: bookmarksWithMetadata,
      };
    });
    
    // Import with enriched metadata
    const bulkService = new BulkService();
    await bulkService.importBookmarksWithCollections({
      userId: user.id,
      collections: collectionsWithMetadata,
    });
    
    // Revalidate the main layout to update all bookmark and collection UI
    revalidatePath('/(main)', 'layout');
    
    return { success: true };
  } catch (error) {
    console.error('Error in bulkImportBookmarksAction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to import bookmarks'
    };
  }
}
