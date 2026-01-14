"use client";

import {
  Stack,
  Grid,
  Text,
  SegmentedControl,
  Slider,
  Switch,
} from "@mantine/core";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Settings_Layout");
  return (
    <Grid gutter="md">
      {/* Density */}
      <SettingRow
        label={t("launcher_density_label")}
        description={t("launcher_density_description")}
      >
        <SegmentedControl
          value={config.density}
          onChange={(value) =>
            onChange({
              density: value as "compact" | "comfortable",
            })
          }
          data={[
            { label: t("launcher_density_compact"), value: "compact" },
            { label: t("launcher_density_comfortable"), value: "comfortable" },
          ]}
        />
      </SettingRow>

      {/* Collection Opacity */}
      <SettingRow
        label={t("launcher_collection_opacity_label")}
        description={t("launcher_collection_opacity_description")}
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
        label={t("launcher_collection_blur_label")}
        description={t("launcher_collection_blur_description")}
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
        label={t("launcher_show_empty_uncollected_label")}
        description={t("launcher_show_empty_uncollected_description")}
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

