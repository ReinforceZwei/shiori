import { 
  Paper, 
  Stack, 
  Group, 
  Text,
  Divider,
  Title
} from '@mantine/core';
import WallpaperSettings from './WallpaperSettings';
import GeneralSettings from './GeneralSettings';
import LayoutSettings from './LayoutSettings';
import SettingsHeader from './SettingsHeader';
import { WallpaperService } from '@/features/wallpaper/service';
import { SettingsService } from '@/features/settings/service';
import { requireUser } from '@/lib/auth';
import { DEFAULT_LAYOUT_CONFIG, layoutConfigSchema } from '@/features/settings/layout-config';
import { z } from 'zod';
import { AppContainer } from '@/component/layout/AppContainer';

export default async function SettingsPage() {
  // Fetch user settings and wallpaper metadata on the server
  const user = await requireUser();
  const settingsService = new SettingsService();
  const wallpaperService = new WallpaperService();
  
  const [settings, wallpapersMetadata] = await Promise.all([
    settingsService.get({ userId: user.id }),
    wallpaperService.getAllMetadata({ userId: user.id }),
  ]);

  // Default to 'en-US' if no settings exist
  const currentLocale = (settings?.locale || 'en-US') as 'en-US' | 'zh-Hant';
  
  // Get layout settings (already validated by service)
  const layoutMode = (settings?.layoutMode || 'launcher') as 'launcher' | 'grid' | 'list';
  const layoutConfig: z.infer<typeof layoutConfigSchema> = settings?.layoutConfig 
    ? (settings.layoutConfig as z.infer<typeof layoutConfigSchema>)
    : DEFAULT_LAYOUT_CONFIG;

  return (
    <AppContainer py="xl">
      <Stack gap="lg">
        {/* Header with back button */}
        <SettingsHeader />

        <Text c="dimmed" size="sm">
          Manage your preferences and configure your application settings.
        </Text>

        <Divider my="sm" />

        {/* General Section */}
        <GeneralSettings locale={currentLocale} />

        {/* Wallpaper Section */}
        <WallpaperSettings initialWallpapers={wallpapersMetadata} />

        {/* Layout Section */}
        <LayoutSettings layoutMode={layoutMode} layoutConfig={layoutConfig} />

        {/* Placeholder for future sections */}
        <Paper 
          shadow="xs" 
          p="xl" 
          radius="md" 
          withBorder
          opacity={0.6}
          style={{ pointerEvents: 'none' }}
        >
          <Stack gap="md">
            <Group gap="sm">
              <Title order={3}>More Sections Coming Soon</Title>
            </Group>
            
            <Text size="sm" c="dimmed">
              Additional settings sections will be available here.
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </AppContainer>
  );
}
