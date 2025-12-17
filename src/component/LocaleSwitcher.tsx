"use client";

import { Select } from "@mantine/core";
import { IconLanguage } from "@tabler/icons-react";
import { locales } from "@/i18n/locale";

const localeLabels: Record<(typeof locales)[number], string> = {
  "en-US": "English",
  "zh-Hant": "繁體中文",
};

interface LocaleSwitcherProps {
  /**
   * Current locale value (controlled component)
   */
  value: (typeof locales)[number];
  /**
   * Callback when locale changes
   */
  onChange: (locale: (typeof locales)[number]) => void;
  /**
   * Whether to show the language icon
   */
  showIcon?: boolean;
  /**
   * Size of the select component
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Width of the select component
   */
  width?: number | string;
}

export function LocaleSwitcher({
  value,
  onChange,
  showIcon = true,
  size = "sm",
  width = 150,
}: LocaleSwitcherProps) {
  const handleLocaleChange = (selectedValue: string | null) => {
    if (!selectedValue || !locales.includes(selectedValue as (typeof locales)[number])) {
      return;
    }

    const newLocale = selectedValue as (typeof locales)[number];
    onChange(newLocale);
  };

  const selectData = locales.map((loc) => ({
    value: loc,
    label: localeLabels[loc],
  }));

  return (
    <Select
      value={value}
      onChange={handleLocaleChange}
      data={selectData}
      leftSection={showIcon ? <IconLanguage size={16} /> : undefined}
      size={size}
      w={width}
      comboboxProps={{ shadow: "md" }}
      allowDeselect={false}
    />
  );
}

