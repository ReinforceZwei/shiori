import { Job } from "@/generated/prisma/client";
import { fetchFavicon, type FetchResult, type Icon } from '@reinforcezwei/favicon-fetcher';
import { z } from 'zod';
import { BookmarkService } from './service';

// Define the job payload schema
const fetchMetadataPayloadSchema = z.object({
  url: z.string().url(),
  bookmarkId: z.string(),
  userId: z.string(),
});

type FetchMetadataPayload = z.infer<typeof fetchMetadataPayloadSchema>;

/**
 * Select the best icon from available icons based on quality heuristics
 */
function selectBestIcon(icons: Icon[]): Icon | null {
  if (icons.length === 0) return null;
  
  const iconsWithMetadata = icons.filter(icon => icon.metadata?.buffer);
  if (iconsWithMetadata.length === 0) return null;

  const scored = iconsWithMetadata.map(icon => {
    let score = 0;
    const metadata = icon.metadata!;
    
    // Size scoring
    const minDimension = Math.min(metadata.width, metadata.height);
    if (minDimension >= 512) {
      score += 150;
    } else if (minDimension >= 192) {
      score += 120;
      if (minDimension === 192 || minDimension === 256 || minDimension === 512) {
        score += 30;
      }
    } else if (minDimension >= 128) {
      score += 80;
    } else if (minDimension >= 64) {
      score += 60;
    } else if (minDimension >= 32) {
      score += 40;
    } else {
      score += 20;
    }
    
    // Format preference
    const formatLower = metadata.format.toLowerCase();
    if (formatLower === 'svg') {
      score += 100;
    } else if (formatLower === 'png') {
      score += 80;
    } else if (formatLower === 'webp') {
      score += 70;
    } else if (formatLower === 'jpg' || formatLower === 'jpeg') {
      score += 50;
    } else if (formatLower === 'ico') {
      score += 30;
    } else {
      score += 20;
    }
    
    // Type preference
    const typeLower = icon.type.toLowerCase();
    if (typeLower.includes('apple-touch-icon')) {
      score += 50;
    } else if (typeLower === 'icon' || typeLower === 'shortcut icon') {
      score += 40;
    }
    
    // Source preference
    if (icon.source === 'manifest') {
      score += 30;
    } else if (icon.source === 'html') {
      score += 20;
    }
    
    return { icon, score };
  });
  
  scored.sort((a, b) => b.score - a.score);
  return scored[0].icon;
}

/**
 * Select the best description from available descriptions
 */
function selectBestDescription(descriptions: FetchResult['descriptions']): string | undefined {
  if (!descriptions || descriptions.length === 0) return undefined;
  
  const ogDesc = descriptions.find(d => d.source === 'opengraph');
  if (ogDesc?.value) return ogDesc.value;
  
  const twitterDesc = descriptions.find(d => d.source === 'twitter');
  if (twitterDesc?.value) return twitterDesc.value;
  
  const htmlDesc = descriptions.find(d => d.source === 'html');
  if (htmlDesc?.value) return htmlDesc.value;
  
  const manifestDesc = descriptions.find(d => d.source === 'manifest');
  if (manifestDesc?.value) return manifestDesc.value;
  
  return undefined;
}

/**
 * Retry a promise with exponential backoff (1 retry = 2 attempts total)
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 1,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Job handler for fetching bookmark metadata
 * 
 * Job type: 'fetch-bookmark-metadata'
 * 
 * Payload schema:
 * {
 *   url: string;
 *   bookmarkId: string;
 *   userId: string;
 * }
 * 
 * Features:
 * - Fetches icon and description from the URL
 * - Retries once on failure (2 attempts total)
 * - Updates the bookmark with fetched metadata
 * - Never throws - treats failures as successful completion
 */
export async function handleFetchBookmarkMetadata(job: Job): Promise<void> {
  let payload: FetchMetadataPayload;
  
  try {
    // Validate payload
    payload = fetchMetadataPayloadSchema.parse(job.payload);
  } catch (error) {
    // Invalid payload - treat as complete to avoid retrying
    return;
  }
  
  try {
    // Retry up to 1 time with exponential backoff (2 attempts total)
    const result: FetchResult = await retryWithBackoff(
      () => fetchFavicon(payload.url, {
        includeMetadata: true,
        timeout: 15000,
      }),
      1,
      1000
    );
    
    if (!result || !result.icons) {
      // Invalid result - treat as complete
      return;
    }
    
    // Select best icon
    const bestIcon = selectBestIcon(result.icons);
    let websiteIcon: { data: string } | undefined;
    
    if (bestIcon?.metadata?.buffer) {
      try {
        const buffer = bestIcon.metadata.buffer;
        websiteIcon = {
          data: buffer.toString('base64'),
        };
      } catch (iconError) {
        // Failed to process icon - continue without it
      }
    }
    
    // Select best description
    const description = selectBestDescription(result.descriptions);
    
    // Update bookmark with fetched metadata
    if (websiteIcon || description) {
      const bookmarkService = new BookmarkService();
      await bookmarkService.update({
        id: payload.bookmarkId,
        userId: payload.userId,
        ...(websiteIcon && { websiteIcon }),
        ...(description && { description }),
      });
    }
  } catch (error) {
    // Fetch failed or update failed - treat as complete (no retry)
    // This is expected behavior for unreachable URLs or network issues
  }
}

