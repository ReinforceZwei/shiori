"use client";

import { Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Settings_Layout");
  return (
    <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
      {t("list_coming_soon")}
    </Alert>
  );
}

