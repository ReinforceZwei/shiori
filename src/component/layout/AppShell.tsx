"use client";

import {
  AppShell as MantineAppShell,
  Burger,
  Title,
  Group,
  Menu,
  ActionIcon,
  alpha,
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
  const tMetadata = useTranslations("metadata");

  return (
    <MantineAppShell header={{ height: 60 }} padding="md">
      <MantineAppShell.Header
        withBorder={false}
        style={(theme) => ({
          backgroundColor: alpha(theme.colors.mintGreen[1], 0.7),
          backdropFilter: "blur(10px)",
        })}
      >
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
                  leftSection={<IconSettings size={16} />}
                  onClick={() => router.push("/settings")}
                >
                  {t("settings")}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconLogout size={16} />}
                  onClick={() =>
                    modals.openConfirmModal({
                      title: t("sign_out_confirm_title"),
                      children: t("sign_out_confirm_message"),
                      labels: {
                        confirm: t("sign_out_confirm_button"),
                        cancel: t("sign_out_cancel_button"),
                      },
                      confirmProps: { color: "red" },
                      onConfirm: () => router.push("/signout"),
                    })
                  }
                  c="roseRed"
                >
                  {t("sign_out")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <Title order={2}>{tMetadata("title")}</Title>
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
                  {t("create_new_collection")}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFileImport size={16} />}
                  onClick={() => router.push("/import")}
                >
                  {t("import_bookmarks")}
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
