"use client";

import { AppShell as MantineAppShell, Burger, Title, Group, NavLink, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import Link from 'next/link';

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [opened, { toggle }] = useDisclosure();
  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: !opened },
      }}
      padding="md"
    >
      <MantineAppShell.Header>
        <Group h='100%' px="md" justify='space-between'>
          <Group>
          <Burger
            opened={opened}
            onClick={toggle}
            //hiddenFrom="sm"
            //size="sm"
          />
          <Title order={2}>Shiori</Title>
          </Group>
          <Group>
            <Button 
              variant="light" 
              onClick={() => modals.openContextModal({
                modal: 'newBookmark',
                title: 'Create New Bookmark',
                innerProps: {}
              })}
            >
              New Bookmark
            </Button>
            <Button 
              variant="light"
              onClick={() => modals.openContextModal({
                modal: 'newCollection',
                title: 'Create New Collection',
                innerProps: {}
              })}
            >
              New Collection
            </Button>
          </Group>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="md">
      <NavLink component={Link} href='/' label="Home" leftSection={<span>📁</span>} />
        <NavLink component={Link} href='/collection' label="Collection" leftSection={<span>📁</span>} />
      </MantineAppShell.Navbar>

      <MantineAppShell.Main h='100dvh'>{children}</MantineAppShell.Main>
    </MantineAppShell>
  );
}