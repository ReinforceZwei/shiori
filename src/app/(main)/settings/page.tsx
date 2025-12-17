import { 
  Container, 
  Paper, 
  Stack, 
  Group, 
  Text,
  Divider,
  Box,
  Title
} from '@mantine/core';
import { IconLayout } from '@tabler/icons-react';
import WallpaperSettings from './WallpaperSettings';
import GeneralSettings from './GeneralSettings';
import SettingsHeader from './SettingsHeader';
import { WallpaperService } from '@/features/wallpaper/service';
import { SettingsService } from '@/features/settings/service';
import { requireUser } from '@/lib/auth';

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

  return (
    <Container size="lg" py="xl">
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
        <Paper 
          shadow="xs" 
          p="xl" 
          radius="md" 
          withBorder
        >
          <Stack gap="md">
            <Group gap="sm">
              <IconLayout size={24} />
              <Title order={3}>Layout</Title>
            </Group>
            
            <Text size="sm" c="dimmed">
              Customize how your content is displayed and organized.
            </Text>

            <Divider my="xs" />

            {/* Placeholder for layout settings */}
            <Box>
              <Text size="sm" c="dimmed" ta="center" py="xl">
                Layout settings will be added here
              </Text>
            </Box>
          </Stack>
        </Paper>

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
    </Container>
  );
}
