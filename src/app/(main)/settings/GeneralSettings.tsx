"use client";

import { useState } from 'react';
import {
  Paper,
  Stack,
  Group,
  Title,
  Text,
  Divider,
} from '@mantine/core';
import {
  IconSettings,
} from '@tabler/icons-react';
import { LocaleSwitcher } from '@/component/LocaleSwitcher';
import { locales } from '@/i18n/locale';
import { notifications } from '@mantine/notifications';
import { updateLocaleAction } from '@/app/actions/settings';

interface GeneralSettingsProps {
  locale: (typeof locales)[number];
}

export default function GeneralSettings({ locale }: GeneralSettingsProps) {

  const handleLocaleChange = async (newLocale: (typeof locales)[number]) => {
    if (newLocale === locale) return;
    
    try {
      await updateLocaleAction({ locale: newLocale });
    } catch (error) {
      console.error('Error updating locale:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update language',
        color: 'red',
      });
    }
  };

  return (
    <Paper shadow="xs" p="xl" radius="md" withBorder>
      <Stack gap="md">
        <Group gap="sm">
          <IconSettings size={24} />
          <Title order={3}>General</Title>
        </Group>

        <Text size="sm" c="dimmed">
          Configure your basic application preferences.
        </Text>

        <Divider my="xs" />

        {/* Language Setting */}
        <Group justify="space-between" wrap="wrap">
          <div>
            <Text size="sm" fw={500} mb={4}>
              Language
            </Text>
            <Text size="xs" c="dimmed">
              Select your preferred language for the application
            </Text>
          </div>
          <LocaleSwitcher
            value={locale}
            onChange={handleLocaleChange}
            showIcon={true}
            size="sm"
            width={180}
          />
        </Group>
      </Stack>
    </Paper>
  );
}

