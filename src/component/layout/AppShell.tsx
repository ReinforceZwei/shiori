"use client";

import { AppShell as MantineAppShell, Burger, Title, Group, Menu, ActionIcon } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus, IconBookmark, IconFolder, IconHome, IconFolderOpen, IconSettings } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  
  return (
    <MantineAppShell
      header={{ height: 60 }}
      padding="md"
    >
      <MantineAppShell.Header>
        <Group h='100%' px="md" justify='space-between'>
          <Group>
            <Menu>
              <Menu.Target>
                <Burger />
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item 
                  leftSection={<IconHome size={16} />}
                  onClick={() => router.push('/')}
                >
                  Home
                </Menu.Item>
                <Menu.Item 
                  leftSection={<IconFolderOpen size={16} />}
                  onClick={() => router.push('/collection')}
                >
                  Collection
                </Menu.Item>
                <Menu.Item 
                  leftSection={<IconSettings size={16} />}
                  onClick={() => router.push('/settings')}
                >
                  Settings
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <Title order={2}>Shiori</Title>
          </Group>
          <Group>
            <Menu>
              <Menu.Target>
                <ActionIcon variant="light" size="lg">
                  <IconPlus size={20} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item 
                  leftSection={<IconBookmark size={16} />}
                  onClick={() => modals.openContextModal({
                    modal: 'newBookmark',
                    title: 'Create New Bookmark',
                    innerProps: {}
                  })}
                >
                  Bookmark
                </Menu.Item>
                <Menu.Item 
                  leftSection={<IconFolder size={16} />}
                  onClick={() => modals.openContextModal({
                    modal: 'newCollection',
                    title: 'Create New Collection',
                    innerProps: {}
                  })}
                >
                  Collection
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Main h='100dvh'>{children}</MantineAppShell.Main>
    </MantineAppShell>
  );
}