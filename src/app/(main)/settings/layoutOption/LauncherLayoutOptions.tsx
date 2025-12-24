"use client";

import {
  Stack,
  Group,
  Text,
  SegmentedControl,
  Slider,
  Switch,
} from "@mantine/core";
import { z } from "zod";
import { launcherLayoutConfigSchema } from "@/features/settings/layout-config";

type LauncherConfig = z.infer<typeof launcherLayoutConfigSchema>;

interface LauncherLayoutOptionsProps {
  config: LauncherConfig;
  onChange: (updates: Partial<LauncherConfig>) => void;
}

export default function LauncherLayoutOptions({
  config,
  onChange,
}: LauncherLayoutOptionsProps) {
  return (
    <Stack gap="lg">
      {/* Density */}
      <Group justify="space-between" wrap="wrap">
        <div>
          <Text size="sm" fw={500} mb={4}>
            Density
          </Text>
          <Text size="xs" c="dimmed">
            Control the spacing between items
          </Text>
        </div>
        <SegmentedControl
          value={config.density}
          onChange={(value) =>
            onChange({
              density: value as "compact" | "comfortable",
            })
          }
          data={[
            { label: "Compact", value: "compact" },
            { label: "Comfortable", value: "comfortable" },
          ]}
        />
      </Group>

      {/* Collection Opacity */}
      <Stack gap="xs" py="sm">
        <div>
          <Text size="sm" fw={500} mb={4}>
            Collection Opacity
          </Text>
          <Text size="xs" c="dimmed">
            Adjust the opacity of collection backgrounds
          </Text>
        </div>
        <Slider
          value={config.collectionOpacity}
          onChange={(value) => onChange({ collectionOpacity: value })}
          label={(value) => `${(value * 100).toFixed(0)}%`}
          min={0}
          max={1}
          step={0.05}
          marks={[
            { value: 0, label: "0%" },
            { value: 0.5, label: "50%" },
            { value: 1, label: "100%" },
          ]}
        />
      </Stack>

      {/* Collection Blur */}
      <Stack gap="xs" py="sm">
        <div>
          <Text size="sm" fw={500} mb={4}>
            Collection Blur
          </Text>
          <Text size="xs" c="dimmed">
            Adjust the blur effect on collection backgrounds
          </Text>
        </div>
        <Slider
          value={config.collectionBlur}
          onChange={(value) => onChange({ collectionBlur: value })}
          label={(value) => `${value}px`}
          min={0}
          max={30}
          step={1}
          marks={[
            { value: 0, label: "0px" },
            { value: 15, label: "15px" },
            { value: 30, label: "30px" },
          ]}
        />
      </Stack>

      {/* Show Empty Uncollected */}
      <Group justify="space-between" wrap="wrap">
        <div>
          <Text size="sm" fw={500} mb={4}>
            Show Empty Uncollected Section
          </Text>
          <Text size="xs" c="dimmed">
            Display the uncollected section even when empty
          </Text>
        </div>
        <Switch
          checked={config.showEmptyUncollected}
          onChange={(event) =>
            onChange({
              showEmptyUncollected: event.currentTarget.checked,
            })
          }
        />
      </Group>
    </Stack>
  );
}

