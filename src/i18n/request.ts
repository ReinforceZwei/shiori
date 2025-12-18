import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";
import { getMessageFallback, onError } from "./fallback";
import { getUser } from "@/lib/auth";
import { SettingsService } from "@/features/settings/service";
import { locales, getLocaleFromHeader } from "./locale";

export default getRequestConfig(async () => {
  let locale: (typeof locales)[number] = "en-US";
  const user = await getUser();
  
  if (user) {
    // User is signed in - use their locale preference
    const settingsService = new SettingsService();
    locale =
      ((await settingsService.getLocale({
        userId: user.id,
      })) as (typeof locales)[number]) || "en-US";
  } else {
    // No user session - use browser locale from Accept-Language header
    const headersList = await headers();
    locale = getLocaleFromHeader(headersList);
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    getMessageFallback,
    onError,
  };
});
