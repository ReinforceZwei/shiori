import { getRequestConfig } from "next-intl/server";
import { getMessageFallback, onError } from "./fallback";
import { getUser } from "@/lib/auth";
import { SettingsService } from "@/features/settings/service";
import { locales } from "./locale";

export default getRequestConfig(async () => {
  let locale: (typeof locales)[number] = "en-US";
  const user = await getUser();
  if (user) {
    const settingsService = new SettingsService();
    locale =
      ((await settingsService.getLocale({
        userId: user.id,
      })) as (typeof locales)[number]) || "en-US";
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    getMessageFallback,
    onError,
  };
});
