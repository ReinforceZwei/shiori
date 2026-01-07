'use server';

import { SettingsService } from "@/features/settings/service";
import { locales } from "@/i18n/locale";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { 
  layoutConfigSchema,
  DEFAULT_LAYOUT_CONFIG 
} from "@/features/settings/layout-config";
import {
  uiConfigSchema,
  DEFAULT_UI_CONFIG
} from "@/features/settings/ui-config";
import { z } from "zod";
import deepmerge from "deepmerge";

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
  revalidatePath('/', 'layout');
  return settings;
}

export async function getLocaleAction() {
  const user = await requireUser();
  const settingsService = new SettingsService();
  const locale = await settingsService.getLocale({ userId: user.id });
  return locale;
}

export async function getColorSchemeAction() {
  const user = await requireUser();
  const settingsService = new SettingsService();
  const settings = await settingsService.get({ userId: user.id });
  return settings?.uiConfig?.colorScheme;
}

/**
 * Update user layout mode setting
 */
export async function updateLayoutModeAction(data: {
  layoutMode: "launcher" | "grid" | "list";
}) {
  const user = await requireUser();
  const settingsService = new SettingsService();
  const settings = await settingsService.upsert({
    userId: user.id,
    layoutMode: data.layoutMode,
  });
  revalidatePath('/settings');
  revalidatePath('/', 'layout');
  return settings;
}

/**
 * Update layout configuration
 */
export async function updateLayoutConfigAction(data: {
  config: Partial<z.infer<typeof layoutConfigSchema>>;
}) {
  const user = await requireUser();
  const settingsService = new SettingsService();
  
  // Fetch current settings (already validated by service)
  const currentSettings = await settingsService.get({ userId: user.id });
  
  // Get existing config or use defaults (type-safe)
  const existingConfig: z.infer<typeof layoutConfigSchema> = currentSettings?.layoutConfig 
    ? (currentSettings.layoutConfig as z.infer<typeof layoutConfigSchema>)
    : DEFAULT_LAYOUT_CONFIG;
  
  // Deep merge the new config with existing config and defaults
  // First merge defaults with existing, then merge with new config
  const mergedConfig = deepmerge.all([
    DEFAULT_LAYOUT_CONFIG, 
    existingConfig, 
    data.config
  ]) as z.infer<typeof layoutConfigSchema>;
  
  // Validate merged config
  const validatedConfig = layoutConfigSchema.parse(mergedConfig);
  
  // Update settings with merged config
  const settings = await settingsService.upsert({
    userId: user.id,
    layoutConfig: validatedConfig,
  });
  
  revalidatePath('/settings');
  revalidatePath('/', 'layout');
  return settings;
}

/**
 * Update UI configuration
 */
export async function updateUIConfigAction(data: {
  config: Partial<z.infer<typeof uiConfigSchema>>;
}) {
  const user = await requireUser();
  const settingsService = new SettingsService();
  
  // Fetch current settings (already validated by service)
  const currentSettings = await settingsService.get({ userId: user.id });
  
  // Get existing config or use defaults (type-safe)
  const existingConfig: z.infer<typeof uiConfigSchema> = currentSettings?.uiConfig 
    ? (currentSettings.uiConfig as z.infer<typeof uiConfigSchema>)
    : DEFAULT_UI_CONFIG;
  
  // Deep merge the new config with existing config and defaults
  // First merge defaults with existing, then merge with new config
  const mergedConfig = deepmerge.all([
    DEFAULT_UI_CONFIG, 
    existingConfig, 
    data.config
  ]) as z.infer<typeof uiConfigSchema>;
  
  // Validate merged config
  const validatedConfig = uiConfigSchema.parse(mergedConfig);
  
  // Update settings with merged config
  const settings = await settingsService.upsert({
    userId: user.id,
    uiConfig: validatedConfig,
  });
  
  revalidatePath('/settings');
  revalidatePath('/', 'layout');
  return settings;
}