import type {} from 'next-intl';

export const locales = ['en-US', 'zh-Hant'] as const;
 
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof locales)[number];
  }
}