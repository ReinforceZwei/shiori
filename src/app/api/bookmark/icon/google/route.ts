import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { BadRequestError, ServerError } from '@/lib/errors';
import { fileTypeFromBuffer } from 'file-type';

export const GET = withAuth(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  const sizeParam = searchParams.get('size');
  const size = sizeParam ? parseInt(sizeParam, 10) : 128;

  if (!domain) {
    throw new BadRequestError('Domain parameter is required');
  }

  // Validate size parameter
  if (isNaN(size) || size <= 0 || size > 256) {
    throw new BadRequestError('Size must be a number between 1 and 256');
  }

  try {
    // Fetch from Google Favicon API
    const googleUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
    const response = await fetch(googleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new ServerError(`Failed to fetch favicon from Google API: ${response.status}`);
    }

    // Get the image buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Detect MIME type from buffer
    const fileType = await fileTypeFromBuffer(buffer);
    const mimeType = fileType?.mime || 'image/png'; // Default to PNG if detection fails

    // Convert to base64
    const base64 = buffer.toString('base64');

    // Try to get dimensions (for PNG we can parse, for others we'll use the size parameter)
    let width = size;
    let height = size;
    let format = fileType?.ext || 'png';

    return NextResponse.json({
      domain,
      base64,
      mimeType,
      metadata: {
        width,
        height,
        format,
        size: buffer.length,
      },
    });
  } catch (error) {
    console.error('Error fetching Google favicon:', error);
    throw new ServerError('Failed to fetch favicon from Google API');
  }
});

