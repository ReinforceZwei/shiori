"use client";

import { 
  Container, 
  Title, 
  Paper, 
  Stack, 
  Group, 
  Button,
  Text,
  Divider,
  ActionIcon,
  Box
} from '@mantine/core';
import { IconArrowLeft, IconLayout } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        {/* Header with back button */}
        <Group gap="md">
          <ActionIcon 
            variant="subtle" 
            size="lg"
            onClick={() => router.push('/')}
            aria-label="Back to home"
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={1}>Settings</Title>
        </Group>

        <Text c="dimmed" size="sm">
          Manage your preferences and configure your application settings.
        </Text>

        <Divider my="sm" />

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
