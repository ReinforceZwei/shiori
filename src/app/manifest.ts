import { MetadataRoute } from 'next';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { getLocaleFromHeader, locales } from '@/i18n/locale';
import { getLocaleAction } from './actions/settings';
import { mintGreen } from '@/lib/theme';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let locale: (typeof locales)[number] = "en-US";
  
  try {
    locale = await getLocaleAction() as (typeof locales)[number];
  } catch {
    const headersList = await headers();
    locale = getLocaleFromHeader(headersList);
  }
  
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    name: t('title'),
    short_name: t('short_name'),
    description: t('description'),
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: mintGreen[3],
    orientation: 'any',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}

