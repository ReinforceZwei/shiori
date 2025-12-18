import type {} from 'next-intl';
import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export const locales = ['en-US', 'zh-Hant'] as const;

export function getLocaleFromHeader(headersList: ReadonlyHeaders): (typeof locales)[number] {
  const acceptLanguage = headersList.get("accept-language");

  if (!acceptLanguage) {
    return "en-US";
  }

  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,zh-Hant;q=0.8")
  const languages = acceptLanguage
    .split(",")
    .map((lang: string) => {
      const [locale, priority] = lang.trim().split(";q=");
      return {
        locale: locale.trim(),
        priority: priority ? parseFloat(priority) : 1.0,
      };
    })
    .sort((a: { priority: number }, b: { priority: number }) => b.priority - a.priority);

  // Find the first matching locale from our supported locales
  for (const { locale: browserLocale } of languages) {
    // Exact match (e.g., "zh-Hant")
    if (locales.includes(browserLocale as (typeof locales)[number])) {
      return browserLocale as (typeof locales)[number];
    }
    
    // Partial match for language code (e.g., "zh" matches "zh-Hant")
    const languageCode = browserLocale.split("-")[0].toLowerCase();
    const matchingLocale = locales.find((supportedLocale) =>
      supportedLocale.toLowerCase().startsWith(languageCode)
    );
    
    if (matchingLocale) {
      return matchingLocale;
    }
  }

  return "en-US";
}
 
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof locales)[number];
  }
}