/**
 * Type definitions for the Bookmark Metadata API
 * 
 * Endpoint: GET /api/bookmark/metadata
 */

/**
 * Title metadata with source information
 */
export interface BookmarkTitle {
  /** Title text */
  value: string;
  
  /** Source type where the title was found */
  source: 'html' | 'opengraph' | 'twitter' | 'manifest';
  
  /** Property name (e.g., 'title', 'og:title', 'twitter:title', 'name', 'short_name') */
  property: string;
}

/**
 * Description metadata with source information
 */
export interface BookmarkDescription {
  /** Description text */
  value: string;
  
  /** Source type where the description was found */
  source: 'html' | 'opengraph' | 'twitter' | 'manifest';
  
  /** Property name (e.g., 'description', 'og:description', 'twitter:description') */
  property: string;
}

/**
 * Icon metadata returned by the API
 */
export interface BookmarkIcon {
  /** Original icon URL (for reference) */
  url: string;
  
  /** Icon type (e.g., 'icon', 'apple-touch-icon', 'manifest-icon') */
  type: string;
  
  /** Size attribute (e.g., '192x192', 'any') */
  sizes: string;
  
  /** Where the icon was found */
  source: 'html' | 'manifest' | 'default';
  
  /** Base64 encoded image data (ready to use with data URLs) */
  base64: string;
  
  /** MIME type (e.g., 'image/png', 'image/svg+xml') */
  mimeType: string;
  
  /** Image metadata */
  metadata: {
    /** Image width in pixels */
    width: number;
    
    /** Image height in pixels */
    height: number;
    
    /** Image format (png, ico, jpeg, svg) */
    format: string;
    
    /** File size in bytes */
    size: number;
  };
}

/**
 * Successful response from the metadata API
 */
export interface BookmarkMetadataResponse {
  /** The normalized URL that was fetched */
  url: string;
  
  /** Page title extracted from the HTML (primary title for backward compatibility) */
  title: string;
  
  /** Array of all titles from multiple sources with metadata */
  titles: BookmarkTitle[];
  
  /** Array of all descriptions from multiple sources with metadata */
  descriptions: BookmarkDescription[];
  
  /** Array of icons found on the page */
  icons: BookmarkIcon[];
}

/**
 * Error response from the metadata API
 */
export interface BookmarkMetadataError {
  /** Error type/message */
  error: string;
  
  /** Detailed error message (optional) */
  message?: string;
}

/**
 * Helper function to create a data URL from an icon
 * @param icon - The icon object from the API response
 * @returns A data URL string that can be used as an img src
 */
export function createIconDataUrl(icon: BookmarkIcon): string {
  return `data:${icon.mimeType};base64,${icon.base64}`;
}

/**
 * Helper function to select the best icon from a list
 * Prioritizes larger icons and specific formats
 * @param icons - Array of icons from the API response
 * @returns The best icon or undefined if no icons
 */
export function selectBestIcon(icons: BookmarkIcon[]): BookmarkIcon | undefined {
  if (!icons || icons.length === 0) return undefined;
  
  // Sort by size (largest first) and prefer PNG/WebP over SVG/ICO
  return icons.sort((a, b) => {
    // Prefer larger dimensions
    const areaA = a.metadata.width * a.metadata.height;
    const areaB = b.metadata.width * b.metadata.height;
    
    if (areaA !== areaB) {
      return areaB - areaA;
    }
    
    // Prefer modern formats
    const formatPriority: Record<string, number> = {
      'webp': 4,
      'png': 3,
      'jpeg': 2,
      'jpg': 2,
      'svg': 1,
      'ico': 0,
    };
    
    const priorityA = formatPriority[a.metadata.format.toLowerCase()] || 0;
    const priorityB = formatPriority[b.metadata.format.toLowerCase()] || 0;
    
    return priorityB - priorityA;
  })[0];
}

