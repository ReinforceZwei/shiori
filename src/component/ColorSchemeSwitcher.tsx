"use client";

import { Select } from "@mantine/core";
import { IconSun, IconMoon, IconDeviceDesktop } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export type ColorScheme = "light" | "dark" | "auto";

const colorSchemes: ColorScheme[] = ["light", "dark", "auto"];

const colorSchemeIcons: Record<ColorScheme, React.ReactNode> = {
  light: <IconSun size={16} />,
  dark: <IconMoon size={16} />,
  auto: <IconDeviceDesktop size={16} />,
};

interface ColorSchemeSwitcherProps {
  /**
   * Current color scheme value (controlled component)
   */
  value: ColorScheme;
  /**
   * Callback when color scheme changes
   */
  onChange: (colorScheme: ColorScheme) => void;
  /**
   * Whether to show the icon
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

export function ColorSchemeSwitcher({
  value,
  onChange,
  showIcon = true,
  size = "sm",
  width = 150,
}: ColorSchemeSwitcherProps) {
  const t = useTranslations("ColorScheme");

  const handleColorSchemeChange = (selectedValue: string | null) => {
    if (!selectedValue || !colorSchemes.includes(selectedValue as ColorScheme)) {
      return;
    }

    const newColorScheme = selectedValue as ColorScheme;
    onChange(newColorScheme);
  };

  const selectData = colorSchemes.map((scheme) => ({
    value: scheme,
    label: t(scheme),
  }));

  return (
    <Select
      value={value}
      onChange={handleColorSchemeChange}
      data={selectData}
      leftSection={showIcon ? colorSchemeIcons[value] : undefined}
      size={size}
      w={width}
      comboboxProps={{ shadow: "md" }}
      allowDeselect={false}
    />
  );
}