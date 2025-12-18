"use client";

import {
  AppShell as MantineAppShell,
  Burger,
  Title,
  Group,
  Menu,
  ActionIcon,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconPlus,
  IconBookmark,
  IconFolder,
  IconHome,
  IconFolderOpen,
  IconSettings,
  IconFileImport,
  IconLogout,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const t = useTranslations("AppShell");

  return (
    <MantineAppShell header={{ height: 60 }} padding="md">
      <MantineAppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Menu>
              <Menu.Target>
                <Burger />
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconHome size={16} />}
                  onClick={() => router.push("/")}
                >
                  {t("home")}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFolderOpen size={16} />}
                  onClick={() => router.push("/collection")}
                >
                  {t("collection")}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFileImport size={16} />}
                  onClick={() => router.push("/import")}
                >
                  {t("import_bookmarks")}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconSettings size={16} />}
                  onClick={() => router.push("/settings")}
                >
                  {t("settings")}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconLogout size={16} />}
                  onClick={() => router.push("/signout")}
                >
                  {t("sign_out")}
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
                  onClick={() =>
                    modals.openContextModal({
                      modal: "newBookmark",
                      title: t("create_new_bookmark"),
                      innerProps: {},
                    })
                  }
                >
                  {t("bookmark")}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFolder size={16} />}
                  onClick={() =>
                    modals.openContextModal({
                      modal: "newCollection",
                      title: t("create_new_collection"),
                      innerProps: {},
                    })
                  }
                >
                  {t("collection")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Main h="100dvh">{children}</MantineAppShell.Main>
    </MantineAppShell>
  );
}
