"use client";

import { Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { gridLayoutConfigSchema } from "@/features/settings/layout-config";

type GridConfig = z.infer<typeof gridLayoutConfigSchema>;

interface GridLayoutOptionsProps {
  config: GridConfig;
  onChange: (updates: Partial<GridConfig>) => void;
}

export default function GridLayoutOptions({
  config,
  onChange,
}: GridLayoutOptionsProps) {
  const t = useTranslations("Settings_Layout");
  return (
    <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
      {t("grid_coming_soon")}
    </Alert>
  );
}

