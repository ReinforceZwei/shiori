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
import SettingsHeader from './SettingsHeader';
import { getBackgroundImagesMetadata } from '@/features/wallpaper/service';
import { requireUser } from '@/lib/auth';

export default async function SettingsPage() {
  // Fetch wallpaper metadata on the server (excludes binary data at DB level)
  const user = await requireUser();
  const wallpapersMetadata = await getBackgroundImagesMetadata({ userId: user.id });

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Header with back button */}
        <SettingsHeader />

        <Text c="dimmed" size="sm">
          Manage your preferences and configure your application settings.
        </Text>

        <Divider my="sm" />

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
