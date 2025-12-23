import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { NextIntlClientProvider } from 'next-intl';
import ShioriModalProvider from '@/modals/modal.provider'
import QueryProvider from '@/component/provider/QueryProvider';
import theme from '@/lib/theme';
import { notoSansMono, notoSansTC } from '@/lib/font';
import { IntlClientProvider } from '@/i18n/provider';
import { headers } from 'next/headers';
import { getLocaleFromHeader } from '@/i18n/locale';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const locale = getLocaleFromHeader(headersList);
  const t = await getTranslations({ locale , namespace: 'metadata' });
  return {
    title: {
      default: t('title'),
      template: `%s | ${t('title')}`,
    },
    description: t('description'),
  };
}

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
