import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/spotlight/styles.css';

import type { Metadata, Viewport } from "next";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { NextIntlClientProvider } from 'next-intl';
import ShioriModalProvider from '@/modals/modal.provider'
import QueryProvider from '@/component/provider/QueryProvider';
import theme, { mintGreen } from '@/lib/theme';
import { notoSansMono, notoSansTC } from '@/lib/font';
import { IntlClientProvider } from '@/i18n/provider';
import { headers } from 'next/headers';
import { getLocaleFromHeader, locales } from '@/i18n/locale';
import { getTranslations } from 'next-intl/server';
import { getLocaleAction } from './actions/settings';

export async function generateMetadata(): Promise<Metadata> {
  let locale: (typeof locales)[number] = "en-US";
  try {
    locale = await getLocaleAction() as (typeof locales)[number];
  } catch {
    const headersList = await headers();
    locale = getLocaleFromHeader(headersList);
  }
  const t = await getTranslations({ locale , namespace: 'metadata' });
  return {
    title: {
      default: t('title'),
      template: `%s | ${t('title')}`,
    },
    description: t('description'),
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: t('title'),
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
    }
  };
}

export const viewport: Viewport = {
  themeColor: mintGreen[3],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

import '@/lib/theme.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body className={`${notoSansMono.variable} ${notoSansTC.variable}`}>
        <NextIntlClientProvider>
          <IntlClientProvider>
            <MantineProvider theme={theme}>
              <QueryProvider>
                <ShioriModalProvider>
                  <Notifications position='top-right' />
                  {children}
                </ShioriModalProvider>
              </QueryProvider>
            </MantineProvider>
          </IntlClientProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
