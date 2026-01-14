import { requireUser } from '@/lib/auth';
import { SettingsService } from '@/features/settings/service';
import { DEFAULT_LAYOUT_CONFIG, layoutConfigSchema } from '@/features/settings/layout-config';
import { z } from 'zod';
import LayoutSettings from './LayoutSettings';

export default async function LayoutSection() {
  const user = await requireUser();
  const settingsService = new SettingsService();
  const settings = await settingsService.get({ userId: user.id });
  
  // Get layout settings (already validated by service)
  const layoutMode = (settings?.layoutMode || 'launcher') as 'launcher' | 'grid' | 'list';
  const layoutConfig: z.infer<typeof layoutConfigSchema> = settings?.layoutConfig 
    ? (settings.layoutConfig as z.infer<typeof layoutConfigSchema>)
    : DEFAULT_LAYOUT_CONFIG;

  return <LayoutSettings layoutMode={layoutMode} layoutConfig={layoutConfig} />;
}

