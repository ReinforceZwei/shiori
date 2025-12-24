"use client";

import { Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
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
  return (
    <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
      Configuration options for grid layout are coming soon!
    </Alert>
  );
}

