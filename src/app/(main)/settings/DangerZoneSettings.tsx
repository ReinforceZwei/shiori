"use client";

import {
  Paper,
  Stack,
  Group,
  Title,
  Text,
  Divider,
  Button,
  Grid,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { SettingRow } from '@/component/settings';

export default function DangerZoneSettings() {
  const t = useTranslations('Settings_DangerZone');

  return (
    <Paper 
      shadow="xs" 
      p="xl" 
      radius="md" 
      withBorder 
      style={{ 
        borderColor: 'var(--mantine-color-red-6)',
        borderWidth: '2px'
      }}
    >
      <Stack gap="md">
        <Group gap="sm">
          <IconAlertTriangle size={24} color="var(--mantine-color-red-6)" />
          <Title order={3} c="red.6">{t('title')}</Title>
        </Group>

        <Text size="sm" c="dimmed">
          {t('description')}
        </Text>

        <Divider my="xs" color="red.6" />

        <Grid gutter="md">
          <SettingRow
            label={t('delete_account_label')}
            description={t('delete_account_description')}
          >
            <Button
              component={Link}
              href="/delete-my-account"
              color="red"
              variant="light"
              leftSection={<IconTrash size={16} />}
            >
              {t('delete_account_button')}
            </Button>
          </SettingRow>
        </Grid>
      </Stack>
    </Paper>
  );
}

