import { fileTypeFromBuffer } from "file-type";

/**
 * Validates image data and returns the detected MIME type
 * @param base64Data - Base64 encoded image data
 * @param allowedTypes - Array of allowed MIME types
 * @returns Detected MIME type
 * @throws Error if data is not a valid image
 */
export async function validateAndDetectImageType(
  base64Data: string,
  allowedTypes: readonly string[]
): Promise<string> {
  // Convert base64 to buffer
  const buffer = Buffer.from(base64Data, 'base64');
  
  // Detect actual file type from binary data
  const fileType = await fileTypeFromBuffer(buffer);
  
  if (!fileType) {
    throw new Error('Unable to detect file type. The data may be corrupted or invalid.');
  }
  
  // Check if it's an allowed image type
  if (!allowedTypes.includes(fileType.mime)) {
    throw new Error(
      `Invalid image type: ${fileType.mime}. Allowed types: ${allowedTypes.join(', ')}`
    );
  }
  
  return fileType.mime;
}

/**
 * Resizes an image to the specified dimensions using the Canvas API
 * @param imageSource - The source image (can be a File, Blob, or data URL)
 * @param maxWidth - The maximum width of the resized image
 * @param maxHeight - The maximum height of the resized image
 * @param options - Additional options for resizing
 * @returns Promise with the resized image as a data URL
 */
export async function resizeImage(
  imageSource: File | Blob | string,
  maxWidth: number,
  maxHeight: number,
  options: {
    maintainAspectRatio?: boolean;
    quality?: number;
    format?: 'image/jpeg' | 'image/png' | 'image/webp';
  } = {}
): Promise<string> {
  const {
    maintainAspectRatio = true,
    quality = 0.8,
    format = 'image/jpeg'
  } = options;

  // Create an image element
  const img = new Image();
  
  // Create a promise to handle image loading
  const imageLoadPromise = new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image'));
  });

  // Set the image source
  if (typeof imageSource === 'string') {
    img.src = imageSource;
  } else {
    img.src = URL.createObjectURL(imageSource);
  }

  // Wait for the image to load
  await imageLoadPromise;

  // Calculate new dimensions
  let width = img.width;
  let height = img.height;

  if (maintainAspectRatio) {
    const aspectRatio = width / height;

    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
  } else {
    width = maxWidth;
    height = maxHeight;
  }

  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // Draw the image on the canvas
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Use better quality settings
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw the image
  ctx.drawImage(img, 0, 0, width, height);

  // Convert to data URL
  const dataUrl = canvas.toDataURL(format, quality);

  // Clean up
  if (typeof imageSource !== 'string') {
    URL.revokeObjectURL(img.src);
  }

  return dataUrl;
}

/**
 * Converts a data URL to a Blob object
 * @param dataUrl - The data URL to convert
 * @returns A Blob object
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  if (arr.length < 2) {
    throw new Error('Invalid data URL');
  }
  
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) {
    throw new Error('Invalid data URL format');
  }
  
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}

/**
 * Gets the dimensions of an image from its source
 * @param imageSource - The source image (can be a File, Blob, or data URL)
 * @returns Promise with the image dimensions
 */
export async function getImageDimensions(
  imageSource: File | Blob | string
): Promise<{ width: number; height: number }> {
  const img = new Image();
  
  const imageLoadPromise = new Promise<{ width: number; height: number }>((resolve, reject) => {
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(new Error('Failed to load image'));
  });

  if (typeof imageSource === 'string') {
    img.src = imageSource;
  } else {
    img.src = URL.createObjectURL(imageSource);
  }

  try {
    const dimensions = await imageLoadPromise;
    
    if (typeof imageSource !== 'string') {
      URL.revokeObjectURL(img.src);
    }
    
    return dimensions;
  } catch (error) {
    if (typeof imageSource !== 'string') {
      URL.revokeObjectURL(img.src);
    }
    throw error;
  }
}

/**
 * Converts an SVG string to a PNG base64 string
 * @param svgString - The SVG string to convert
 * @param width - The width of the resulting PNG
 * @param height - The height of the resulting PNG
 * @param mimeType - Optional MIME type for the SVG (defaults to image/svg+xml)
 * @returns Promise with the PNG base64 string
 */
export function svgToPng(
  svgString: string, 
  width: number, 
  height: number, 
  mimeType: 'image/svg+xml' | 'image/svg' | 'application/svg' | 'application/svg+xml' = 'image/svg+xml'
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas 2D context not available'));
      return;
    }

    // Create an image element
    const img = new Image();
    
    // Convert SVG string to data URL
    const blob = new Blob([svgString], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to PNG base64
      const pngBase64 = canvas.toDataURL('image/png').split(',')[1];
      
      // Clean up
      URL.revokeObjectURL(url);
      
      resolve(pngBase64);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG'));
    };

    img.src = url;
  });
}