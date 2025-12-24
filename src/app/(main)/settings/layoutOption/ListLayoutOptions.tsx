"use client";

import { Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { z } from "zod";
import { listLayoutConfigSchema } from "@/features/settings/layout-config";

type ListConfig = z.infer<typeof listLayoutConfigSchema>;

interface ListLayoutOptionsProps {
  config: ListConfig;
  onChange: (updates: Partial<ListConfig>) => void;
}

export default function ListLayoutOptions({
  config,
  onChange,
}: ListLayoutOptionsProps) {
  return (
    <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
      Configuration options for list layout are coming soon!
    </Alert>
  );
}

