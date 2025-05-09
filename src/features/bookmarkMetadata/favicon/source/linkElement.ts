import * as cheerio from 'cheerio';
import { Favicon } from '../types';

function parseSize(size?: string): number {
  if (!size) {
    return 0;
  }
  // Match sizes like "32x32", "16x16", "any", or "any 32x32"
  const sizeMatch = size.match(/(\d+)x(\d+)/);
  if (sizeMatch) {
    return parseInt(sizeMatch[1], 10);
  } else if (size === 'any') {
    return 0;
  }
  return 0;
}

export function fromLinkElement($: cheerio.CheerioAPI): Favicon[] {
  // Use a Map to avoid duplicates
  const linkElements = new Map<string, Favicon>();
  const linkSelector = 'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]';

  $(linkSelector).each((_, el) => {
    const $el = $(el);
    const favicon: Favicon = {
      source: 'link',
      href: $el.attr('href')?.trim() || '',
      sizes: parseSize($el.attr('sizes')),
      type: $el.attr('type')?.trim(),
    };
    if (favicon.href) {
      linkElements.set(favicon.href, favicon);
    }
  })

  return Array.from(linkElements.values());
}