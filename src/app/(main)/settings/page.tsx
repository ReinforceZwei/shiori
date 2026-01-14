import { 
  Stack, 
  Text,
  Divider,
} from '@mantine/core';
import SettingsHeader from './SettingsHeader';
import GeneralSection from './general';
import WallpaperSection from './wallpaper';
import LayoutSection from './layout';
import DangerZoneSection from './danger-zone';
import ApiKeySection from './api-key';
import { AppContainer } from '@/component/layout/AppContainer';
import { getTranslations } from 'next-intl/server';

export default async function SettingsPage() {
  const t = await getTranslations('Settings');

  return (
    <AppContainer py="xl">
      <Stack gap="lg">
        {/* Header with back button */}
        <SettingsHeader />

        <Text c="dimmed" size="sm">
          {t('description')}
        </Text>

        <Divider my="sm" />

        {/* Each section is a Server Component that fetches its own data */}
        <GeneralSection />
        <WallpaperSection />
        <LayoutSection />
        <ApiKeySection />
        <DangerZoneSection />
      </Stack>
    </AppContainer>
  );
}
