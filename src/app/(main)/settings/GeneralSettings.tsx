"use client";

import {
  Paper,
  Stack,
  Group,
  Title,
  Text,
  Divider,
  Grid,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconSettings,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/component/LocaleSwitcher';
import { ColorSchemeSwitcher, ColorScheme } from '@/component/ColorSchemeSwitcher';
import { SettingRow } from '@/component/settings';
import { locales } from '@/i18n/locale';
import { notifications } from '@mantine/notifications';
import { updateLocaleAction, updateUIConfigAction } from '@/app/actions/settings';
import { useRouter } from 'next/navigation';

interface GeneralSettingsProps {
  locale: (typeof locales)[number];
  colorScheme: ColorScheme;
}

export default function GeneralSettings({ locale, colorScheme: initialColorScheme }: GeneralSettingsProps) {
  const t = useTranslations('Settings_General');
  const router = useRouter();
  const { setColorScheme } = useMantineColorScheme();

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

  const handleColorSchemeChange = async (newColorScheme: ColorScheme) => {
    if (newColorScheme === initialColorScheme) return;
    
    // Update Mantine color scheme immediately for instant UI feedback
    setColorScheme(newColorScheme);
    
    try {
      await updateUIConfigAction({
        config: { colorScheme: newColorScheme }
      });
      // Trigger a refresh to update the color scheme in the provider
      router.refresh();
    } catch (error) {
      console.error('Error updating color scheme:', error);
      // Revert to previous color scheme on error
      setColorScheme(initialColorScheme);
      notifications.show({
        title: t('error_title'),
        message: error instanceof Error ? error.message : t('error_message'),
        color: 'red',
      });
    }
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

        <Grid gutter="md">
          {/* Color Scheme Setting */}
          <SettingRow
            label={t('theme_label')}
            description={t('theme_description')}
          >
            <ColorSchemeSwitcher
              value={initialColorScheme}
              onChange={handleColorSchemeChange}
              showIcon={true}
              size="sm"
              width="100%"
            />
          </SettingRow>

          {/* Language Setting */}
          <SettingRow
            label={t('language_label')}
            description={t('language_description')}
          >
            <LocaleSwitcher
              value={locale}
              onChange={handleLocaleChange}
              showIcon={true}
              size="sm"
              width="100%"
            />
          </SettingRow>
        </Grid>
      </Stack>
    </Paper>
  );
}

