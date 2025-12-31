"use client";

import {
  Stack,
  Grid,
  Text,
  SegmentedControl,
  Slider,
  Switch,
} from "@mantine/core";
import { z } from "zod";
import { launcherLayoutConfigSchema } from "@/features/settings/layout-config";
import { SettingRow } from "@/component/settings";

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
    <Grid gutter="md">
      {/* Density */}
      <SettingRow
        label="Density"
        description="Control the spacing between items"
      >
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
      </SettingRow>

      {/* Collection Opacity */}
      <SettingRow
        label="Collection Opacity"
        description="Adjust the opacity of collection backgrounds"
      >
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
          w="100%"
          mb="md"
        />
      </SettingRow>

      {/* Collection Blur */}
      <SettingRow
        label="Collection Blur"
        description="Adjust the blur effect on collection backgrounds"
      >
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
          w="100%"
          mb="md"
        />
      </SettingRow>

      {/* Show Empty Uncollected */}
      <SettingRow
        label="Show Empty Uncollected Section"
        description="Display the uncollected section even when empty"
      >
        <Switch
          checked={config.showEmptyUncollected}
          onChange={(event) =>
            onChange({
              showEmptyUncollected: event.currentTarget.checked,
            })
          }
        />
      </SettingRow>
    </Grid>
  );
}

