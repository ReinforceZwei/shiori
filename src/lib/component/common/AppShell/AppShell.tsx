"use client";

import { AppShell as MantineAppShell, Burger, Title, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

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
        <Group h='100%' px="md">
          <Burger
            opened={opened}
            onClick={toggle}
            //hiddenFrom="sm"
            //size="sm"
          />
          <Title order={2}>Shiori</Title>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="md">Navbar</MantineAppShell.Navbar>

      <MantineAppShell.Main>{children}</MantineAppShell.Main>
    </MantineAppShell>
  );
}