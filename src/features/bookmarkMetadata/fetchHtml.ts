import * as cheerio from 'cheerio';
import { fetchUrl } from "./fetchUrl";

const headers = {
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
}

export async function fetchHtml(url: string): Promise<cheerio.CheerioAPI> {
  try {
    const response = await fetchUrl(url, { headers });
    // if (!response.ok) {
    //   throw new Error(`Failed to fetch URL: ${response.statusText}`);
    // }
    const html = await response.text();
    const $ = cheerio.load(html);
    return $;
  } catch (error) {
    throw error;
  }
}