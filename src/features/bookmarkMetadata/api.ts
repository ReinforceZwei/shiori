'use server';
import { unauthorized } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { extractFavicon } from './favicon'
import { extractTitle } from './title';
import { fetchHtml } from './fetchHtml';

export async function getWebsiteIcon(url: string) {
  const user = await getUser();
  if (!user) {
    return unauthorized();
  }
  try {
    const $ = await fetchHtml(url);
    const icons = await extractFavicon($, url);
    return icons;
  } catch (error) {
    console.error('Error fetching favicon:', error);
    throw error;
  }
}

export async function getWebsiteMetadata(url: string) {
  const user = await getUser();
  if (!user) {
    return unauthorized();
  }
  try {
    const $ = await fetchHtml(url);
    const icons = await extractFavicon($, url);
    const title = extractTitle($);
    return { icons, title };
  } catch (error) {
    console.error('Error fetching favicon:', error);
    throw error;
  }
}