import type { GoogleFaviconResponse } from '@/app/api/bookmark/icon/google/types';

// URL utilities
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function isValidUrl(url: string): boolean {
  try {
    const normalized = normalizeUrl(url);
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}

export function extractDomain(url: string): string | null {
  try {
    const normalized = normalizeUrl(url);
    const urlObj = new URL(normalized);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

export function isPublicDomain(domain: string | null): boolean {
  if (!domain) return false;
  // Check if domain is localhost, private IP, or .local
  const localhostPattern = /^(localhost|127\.0\.0\.1|::1)$/i;
  const privateIpPattern = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/;
  const localDomainPattern = /\.local$/i;
  
  return !localhostPattern.test(domain) && 
         !privateIpPattern.test(domain) && 
         !localDomainPattern.test(domain);
}

// Image utilities
export async function imageToBase64(file: File): Promise<{ base64: string; mimeType: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      
      // Create an image element to get dimensions
      const img = new window.Image();
      img.onload = () => {
        resolve({ 
          base64, 
          mimeType: file.type,
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = () => {
        // If image loading fails, return with 0 dimensions
        resolve({ 
          base64, 
          mimeType: file.type,
          width: 0,
          height: 0,
        });
      };
      img.src = result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function fetchGoogleFavicon(domain: string, size: number = 128): Promise<{ base64: string; mimeType: string; width: number; height: number } | null> {
  try {
    const response = await fetch(`/api/bookmark/icon/google?domain=${encodeURIComponent(domain)}&size=${size}`);
    if (!response.ok) return null;
    
    const data: GoogleFaviconResponse = await response.json();
    return {
      base64: data.base64,
      mimeType: data.mimeType,
      width: data.metadata.width,
      height: data.metadata.height,
    };
  } catch {
    return null;
  }
}

