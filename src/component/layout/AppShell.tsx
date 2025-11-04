"use client";

import { AppShell as MantineAppShell, Burger, Title, Group, NavLink, Tabs } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
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
            <Tabs defaultValue="bookmarks" variant="pills">
              <Tabs.List>
                <Tabs.Tab value="bookmarks">Bookmarks</Tabs.Tab>
                <Tabs.Tab value="collections">Collections</Tabs.Tab>
              </Tabs.List>
            </Tabs>
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