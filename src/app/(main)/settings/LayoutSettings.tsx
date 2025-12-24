"use client";

import { useState, useCallback } from "react";
import {
  Paper,
  Stack,
  Group,
  Title,
  Text,
  Divider,
  SegmentedControl,
} from "@mantine/core";
import { IconLayout } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  updateLayoutModeAction,
  updateLayoutConfigAction,
} from "@/app/actions/settings";
import { z } from "zod";
import {
  layoutConfigSchema,
  DEFAULT_LAUNCHER_LAYOUT_CONFIG,
  DEFAULT_GRID_LAYOUT_CONFIG,
  DEFAULT_LIST_LAYOUT_CONFIG,
} from "@/features/settings/layout-config";
import LauncherLayoutOptions from "./layoutOption/LauncherLayoutOptions";
import GridLayoutOptions from "./layoutOption/GridLayoutOptions";
import ListLayoutOptions from "./layoutOption/ListLayoutOptions";

type LayoutMode = "launcher" | "grid" | "list";
type LayoutConfig = z.infer<typeof layoutConfigSchema>;

interface LayoutSettingsProps {
  layoutMode: LayoutMode;
  layoutConfig: LayoutConfig;
}

export default function LayoutSettings({
  layoutMode: initialLayoutMode,
  layoutConfig: initialLayoutConfig,
}: LayoutSettingsProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(initialLayoutMode);
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    launcher: initialLayoutConfig.launcher || DEFAULT_LAUNCHER_LAYOUT_CONFIG,
    grid: initialLayoutConfig.grid || DEFAULT_GRID_LAYOUT_CONFIG,
    list: initialLayoutConfig.list || DEFAULT_LIST_LAYOUT_CONFIG,
  });

  const handleLayoutModeChange = async (value: string) => {
    const newMode = value as LayoutMode;
    const previousMode = layoutMode;

    // Optimistic update
    setLayoutMode(newMode);

    try {
      await updateLayoutModeAction({ layoutMode: newMode });
      notifications.show({
        title: "Layout mode updated",
        message: `Switched to ${newMode} layout`,
        color: "green",
      });
    } catch (error) {
      console.error("Error updating layout mode:", error);
      // Revert on error
      setLayoutMode(previousMode);
      notifications.show({
        title: "Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update layout mode",
        color: "red",
      });
    }
  };

  const handleLayoutConfigUpdate = useCallback(
    async <T extends keyof LayoutConfig>(
      layoutType: T,
      updates: Partial<LayoutConfig[T]>
    ) => {
      const previousConfig = { ...layoutConfig };
      const updatedConfig = {
        ...layoutConfig,
        [layoutType]: { ...layoutConfig[layoutType], ...updates },
      };

      // Optimistic update
      setLayoutConfig(updatedConfig);

      try {
        await updateLayoutConfigAction({
          config: {
            [layoutType]: updatedConfig[layoutType],
          },
        });
      } catch (error) {
        console.error(`Error updating ${layoutType} config:`, error);
        // Revert on error
        setLayoutConfig(previousConfig);
        notifications.show({
          title: "Error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update settings",
          color: "red",
        });
      }
    },
    [layoutConfig]
  );

  return (
    <Paper shadow="xs" p="xl" radius="md" withBorder>
      <Stack gap="md">
        <Group gap="sm">
          <IconLayout size={24} />
          <Title order={3}>Layout</Title>
        </Group>

        <Text size="sm" c="dimmed">
          Customize how your content is displayed and organized.
        </Text>

        <Divider my="xs" />

        {/* Layout Mode Selector */}
        <Group justify="space-between" wrap="wrap">
          <div>
            <Text size="sm" fw={500} mb={4}>
              Layout Mode
            </Text>
            <Text size="xs" c="dimmed">
              Choose how your bookmarks are displayed
            </Text>
          </div>
          <SegmentedControl
            value={layoutMode}
            onChange={handleLayoutModeChange}
            data={[
              { label: "Launcher", value: "launcher" },
              // { label: "Grid", value: "grid" },
              // { label: "List", value: "list" },
              { label: "More Coming Soon...", value: "more-coming", disabled: true },
            ]}
          />
        </Group>

        <Divider my="xs" />

        {/* Layout-specific Options */}
        {layoutMode === "launcher" && (
          <LauncherLayoutOptions
            config={layoutConfig.launcher}
            onChange={(updates) =>
              handleLayoutConfigUpdate("launcher", updates)
            }
          />
        )}

        {layoutMode === "grid" && (
          <GridLayoutOptions
            config={layoutConfig.grid}
            onChange={(updates) => handleLayoutConfigUpdate("grid", updates)}
          />
        )}

        {layoutMode === "list" && (
          <ListLayoutOptions
            config={layoutConfig.list}
            onChange={(updates) => handleLayoutConfigUpdate("list", updates)}
          />
        )}
      </Stack>
    </Paper>
  );
}
