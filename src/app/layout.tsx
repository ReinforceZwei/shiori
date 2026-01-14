import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/spotlight/styles.css';

import type { Metadata, Viewport } from "next";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { NextIntlClientProvider } from 'next-intl';
import ShioriModalProvider from '@/modals/modal.provider'
import QueryProvider from '@/component/provider/QueryProvider';
import { theme, mintGreen } from '@/lib/theme';
import { notoSansMono, notoSansTC } from '@/lib/theme/font';
import { IntlClientProvider } from '@/i18n/provider';
import { headers } from 'next/headers';
import { getLocaleFromHeader, locales } from '@/i18n/locale';
import { getTranslations } from 'next-intl/server';
import { getColorSchemeAction, getLocaleAction } from './actions/settings';
import { getClientConfig } from '@/lib/config';
import { AppConfigProvider } from '@/lib/config/client';

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

import '@/lib/theme/theme.css';
import { ColorScheme } from '@/component/ColorSchemeSwitcher';
import { ContextMenuProvider } from '@/lib/context-menu';
import { SetColorSchemeScript } from '@/lib/theme/SetColorSchemeScript';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clientConfig = getClientConfig();
  let colorScheme: ColorScheme = "light";
  try {
    colorScheme = await getColorSchemeAction() as ColorScheme;
  } catch {
    colorScheme = "light";
  }
  
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <SetColorSchemeScript colorScheme={colorScheme} />
        <ColorSchemeScript
          defaultColorScheme={colorScheme}
        />
      </head>
      <body className={`${notoSansMono.variable} ${notoSansTC.variable}`}>
        <AppConfigProvider config={clientConfig}>
          <NextIntlClientProvider>
            <IntlClientProvider>
              <MantineProvider
                theme={theme}
                defaultColorScheme={colorScheme}
              >
                <QueryProvider>
                  <ShioriModalProvider>
                    <ContextMenuProvider>
                      <Notifications position='top-right' />
                      {children}
                    </ContextMenuProvider>
                  </ShioriModalProvider>
                </QueryProvider>
              </MantineProvider>
            </IntlClientProvider>
          </NextIntlClientProvider>
        </AppConfigProvider>
      </body>
    </html>
  );
}
