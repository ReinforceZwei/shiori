"use client";

import { Group, ActionIcon, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function SettingsHeader() {
  const router = useRouter();
  const t = useTranslations('Settings');

  return (
    <Group gap="md">
      <ActionIcon 
        variant="subtle" 
        size="lg"
        onClick={() => router.push('/')}
        aria-label={t('back_to_home')}
      >
        <IconArrowLeft size={20} />
      </ActionIcon>
      <Title order={1}>{t('title')}</Title>
    </Group>
  );
}

