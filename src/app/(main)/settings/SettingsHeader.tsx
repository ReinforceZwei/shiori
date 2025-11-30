"use client";

import { Group, ActionIcon, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function SettingsHeader() {
  const router = useRouter();

  return (
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
  );
}

