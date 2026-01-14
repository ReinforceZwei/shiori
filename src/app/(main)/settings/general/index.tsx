import { requireUser } from '@/lib/auth';
import { SettingsService } from '@/features/settings/service';
import GeneralSettings from './GeneralSettings';

export default async function GeneralSection() {
  const user = await requireUser();
  const settingsService = new SettingsService();
  const settings = await settingsService.get({ userId: user.id });
  
  // Default to 'en-US' if no settings exist
  const currentLocale = (settings?.locale || 'en-US') as 'en-US' | 'zh-Hant';
  const colorScheme = settings?.uiConfig?.colorScheme || "light";

  return <GeneralSettings locale={currentLocale} colorScheme={colorScheme} />;
}

