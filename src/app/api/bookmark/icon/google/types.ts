/**
 * Type definitions for the Google Favicon Proxy API
 * 
 * Endpoint: GET /api/bookmark/icon/google
 */

/**
 * Successful response from the Google favicon proxy API
 */
export interface GoogleFaviconResponse {
  /** The domain that was fetched */
  domain: string;
  
  /** Base64 encoded image data */
  base64: string;
  
  /** MIME type (e.g., 'image/png', 'image/jpeg') */
  mimeType: string;
  
  /** Image metadata */
  metadata: {
    /** Image width in pixels */
    width: number;
    
    /** Image height in pixels */
    height: number;
    
    /** Image format (png, jpeg, etc.) */
    format: string;
    
    /** File size in bytes */
    size: number;
  };
}

/**
 * Error response from the Google favicon proxy API
 */
export interface GoogleFaviconError {
  /** Error type/message */
  error: string;
  
  /** Detailed error message (optional) */
  message?: string;
}

