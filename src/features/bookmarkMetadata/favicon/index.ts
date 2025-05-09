import type * as cheerio from 'cheerio';
import { fetchHtml } from '../fetchHtml';
import { fromLinkElement } from './source/linkElement';
import { Favicon } from './types';

import { fetchUrl } from '../fetchUrl';

export async function extractFavicon($: cheerio.CheerioAPI, url: string): Promise<Favicon[]> {
  const icons: Favicon[] = [];

  try {
    const promises = fromLinkElement($).map(async (icon) => {
      // Check if href is already an absolute URL
      const absoluteUrl = icon.href.startsWith('http://') || icon.href.startsWith('https://')
        ? icon.href
        : new URL(icon.href, url).href;
      const response = await fetchUrl(absoluteUrl);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const base64 = arrayBufferToBase64(buffer);
        return {
          ...icon,
          href: absoluteUrl,
          type: response.headers.get('content-type') || icon.type,
          base64: base64,
        };
      }
      return {
        ...icon,
        href: absoluteUrl,
      };
    });
    const results = await Promise.all(promises);
    icons.push(...results.filter(Boolean));
  } catch (error) {
    // ignore
  }

  if (icons.length === 0) {
    const favicon = await fetchFavicon(url);
    if (favicon) {
      icons.push(favicon);
    }
  }

  if (icons.length === 0) {
    const externalApiUrl = `https://www.google.com/s2/favicons?sz=128&domain=${url}`;
    const icon = await fetchImage(externalApiUrl);
    if (icon) {
      icons.push(icon);
    }
  }

  return icons;
}

async function fetchAndConvertToBase64(url: string, source: 'favicon' | 'externalApi'): Promise<Favicon | null> {
  try {
    const response = await fetchUrl(url);
    if (!response.ok) {
      return null;
    }
    const buffer = await response.arrayBuffer();
    const base64 = arrayBufferToBase64(buffer);
    return {
      href: url,
      source: source,
      type: response.headers.get('content-type') || (source === 'favicon' ? 'image/x-icon' : 'image/png'),
      base64: base64,
    };
  } catch (error) {
    console.error(`Error fetching ${source === 'favicon' ? 'favicon' : 'image'}:`, error);
    return null;
  }
}

async function fetchFavicon(url: string): Promise<Favicon | null> {
  const faviconUrl = new URL('/favicon.ico', url).href;
  return fetchAndConvertToBase64(faviconUrl, 'favicon');
}

async function fetchImage(url: string): Promise<Favicon | null> {
  return fetchAndConvertToBase64(url, 'externalApi');
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}