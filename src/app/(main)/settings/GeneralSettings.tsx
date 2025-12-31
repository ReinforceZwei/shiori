"use client";

import { useState, useEffect } from 'react';
import {
  Paper,
  Stack,
  Group,
  Title,
  Text,
  Divider,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconSettings,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/component/LocaleSwitcher';
import { ColorSchemeSwitcher, ColorScheme } from '@/component/ColorSchemeSwitcher';
import { locales } from '@/i18n/locale';
import { notifications } from '@mantine/notifications';
import { updateLocaleAction } from '@/app/actions/settings';
import { useRouter } from 'next/navigation';

interface GeneralSettingsProps {
  locale: (typeof locales)[number];
}

export default function GeneralSettings({ locale }: GeneralSettingsProps) {
  const t = useTranslations('Settings_General');
  const router = useRouter();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  
  // To avoid hydration issues, we use a local state that gets initialized after mount
  // This ensures server and client render the same initial value
  const [mountedColorScheme, setMountedColorScheme] = useState<ColorScheme>('light');

  useEffect(() => {
    setMountedColorScheme(colorScheme);
  }, [colorScheme]);

  const handleLocaleChange = async (newLocale: (typeof locales)[number]) => {
    if (newLocale === locale) return;
    
    try {
      await updateLocaleAction({ locale: newLocale });
      // Trigger a refresh to update the locale in the provider
      router.refresh();
    } catch (error) {
      console.error('Error updating locale:', error);
      notifications.show({
        title: t('error_title'),
        message: error instanceof Error ? error.message : t('error_message'),
        color: 'red',
      });
    }
  };

  const handleColorSchemeChange = (newColorScheme: ColorScheme) => {
    setColorScheme(newColorScheme);
  };

  return (
    <Paper shadow="xs" p="xl" radius="md" withBorder>
      <Stack gap="md">
        <Group gap="sm">
          <IconSettings size={24} />
          <Title order={3}>{t('title')}</Title>
        </Group>

        <Text size="sm" c="dimmed">
          {t('description')}
        </Text>

        <Divider my="xs" />

        {/* Color Scheme Setting */}
        <Group justify="space-between" wrap="wrap">
          <div>
            <Text size="sm" fw={500} mb={4}>
              {t('theme_label')}
            </Text>
            <Text size="xs" c="dimmed">
              {t('theme_description')}
            </Text>
          </div>
          <ColorSchemeSwitcher
            value={mountedColorScheme}
            onChange={handleColorSchemeChange}
            showIcon={true}
            size="sm"
            width={180}
          />
        </Group>

        {/* Language Setting */}
        <Group justify="space-between" wrap="wrap">
          <div>
            <Text size="sm" fw={500} mb={4}>
              {t('language_label')}
            </Text>
            <Text size="xs" c="dimmed">
              {t('language_description')}
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

