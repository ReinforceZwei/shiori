'use server';

import { SettingsService } from "@/features/settings/service";
import { locales } from "@/i18n/locale";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * This funcion intended for signup
 */
export async function initSettingsAction(data: {
  locale: (typeof locales)[number];
}) {
  const user = await requireUser();
  const settingsService = new SettingsService();
  const settings = await settingsService.get({ userId: user.id });
  if (settings) {
    // User already has settings, reject the request
    throw new Error("User already has settings");
  }
  // User doesn't have settings, create them
  const newSettings = await settingsService.upsert({
    userId: user.id,
    locale: data.locale,
  });
  return newSettings;
}

/**
 * Update user locale setting
 */
export async function updateLocaleAction(data: {
  locale: (typeof locales)[number];
}) {
  const user = await requireUser();
  const settingsService = new SettingsService();
  const settings = await settingsService.upsert({
    userId: user.id,
    locale: data.locale,
  });
  revalidatePath('/settings');
  revalidatePath('/(main)', 'layout');
  return settings;
}

export async function getLocaleAction() {
  const user = await requireUser();
  const settingsService = new SettingsService();
  const locale = await settingsService.getLocale({ userId: user.id });
  return locale;
}