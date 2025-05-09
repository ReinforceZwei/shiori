import type * as cheerio from 'cheerio';

export function extractTitle($: cheerio.CheerioAPI): string[] {
  // Use a Set to avoid duplicates
  const titles = new Set<string>()

  const title = $('title').text().trim();
  if (title) {
    titles.add(title);
  }

  // const ogTitle = $('meta[property="og:title"]').attr('content');
  // if (ogTitle) {
  //   titles.add(ogTitle.trim());
  // }

  // const twitterTitle = $('meta[name="twitter:title"]').attr('content');
  // if (twitterTitle) {
  //   titles.add(twitterTitle.trim());
  // }

  return Array.from(titles);
}