import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { fetchFavicon, type FetchResult } from '@reinforcezwei/favicon-fetcher';
import { BadRequestError, ServerError } from '@/lib/errors';
import { fileTypeFromBuffer } from 'file-type';

export const GET = withAuth(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    throw new BadRequestError('URL parameter is required');
  }

  try {
    // Always fetch with metadata to get image buffers and dimensions
    const result: FetchResult = await fetchFavicon(url, {
      includeMetadata: true,
      timeout: 10000, // 10 seconds timeout
    });

    // Convert icon buffers to base64 for JSON response
    // This solves referer/CORS issues since client will use data URLs
    // Note: The package provides buffer at runtime despite TypeScript types
    const iconsWithMetadata = result.icons.filter(icon => icon.metadata?.buffer);
    
    const iconsWithBase64 = await Promise.all(
      iconsWithMetadata.map(async (icon) => {
        const metadata = icon.metadata!;
        const buffer = metadata.buffer;
        
        // Detect MIME type from actual buffer data (more reliable than format string)
        const fileType = await fileTypeFromBuffer(buffer);
        const mimeType = fileType?.mime || inferMimeTypeFromFormat(metadata.format);
        
        return {
          url: icon.url,           // Original URL (for reference)
          type: icon.type,         // Icon type (e.g., 'icon', 'apple-touch-icon')
          sizes: icon.sizes,       // Size attribute (e.g., '192x192', 'any')
          source: icon.source,     // Where found ('html', 'manifest', 'default')
          base64: buffer.toString('base64'),  // Base64 encoded image data
          mimeType,                // MIME type detected from buffer
          metadata: {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: metadata.size,
          },
        };
      })
    );

    return NextResponse.json({
      url: result.url,
      title: result.title,
      titles: result.titles,
      descriptions: result.descriptions,
      icons: iconsWithBase64,
    });
  } catch (error) {
    console.error('Error fetching website metadata:', error);
    throw new ServerError('Failed to fetch website metadata');
  }
});

/**
 * Infer MIME type from image format string (fallback when file-type detection fails)
 */
function inferMimeTypeFromFormat(format: string): string {
  const formatLower = format.toLowerCase();
  
  const mimeTypeMap: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff',
  };

  return mimeTypeMap[formatLower] || `image/${formatLower}`;
}

