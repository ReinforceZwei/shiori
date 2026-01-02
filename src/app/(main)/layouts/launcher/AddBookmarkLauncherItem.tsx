"use client";

import { Box, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { LauncherItemSize } from "./BookmarkLauncherItem";

interface AddBookmarkLauncherItemProps {
  size?: LauncherItemSize;
  collectionId?: string;
}

const SIZE_CONFIG = {
  medium: {
    iconSize: 64,
    plusIconSize: 32,
    borderRadius: "16px",
    gap: "8px",
    textSize: "xs" as const,
    textMaxWidth: "80px",
  },
  small: {
    iconSize: 48,
    plusIconSize: 24,
    borderRadius: "12px",
    gap: "6px",
    textSize: "xs" as const,
    textMaxWidth: "64px",
  },
};

export function AddBookmarkLauncherItem({ size = "medium", collectionId }: AddBookmarkLauncherItemProps) {
  const t = useTranslations("Layout_Launcher");
  const [isHovered, setIsHovered] = useState(false);
  const config = SIZE_CONFIG[size];

  const handleClick = () => {
    modals.openContextModal({
      modal: "newBookmark",
      title: t("create_bookmark_title"),
      innerProps: {
        initialValues: collectionId ? { collectionId } : undefined,
      },
    });
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: config.gap,
      }}
    >
      {/* Icon Container */}
      <Box
        onClick={handleClick}
        style={{
          cursor: "pointer",
          width: `${config.iconSize}px`,
          height: `${config.iconSize}px`,
          borderRadius: config.borderRadius,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--mantine-color-default-hover)",
          boxShadow: "var(--mantine-shadow-lg)",
          border: "2px dashed var(--mantine-color-default-border)",
          transition: "transform 0.2s ease, border-color 0.2s ease",
          transform: isHovered ? "scale(1.1)" : "scale(1)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <IconPlus
          size={config.plusIconSize}
          stroke={1.5}
          style={{
            color: "var(--mantine-color-dimmed)",
            opacity: isHovered ? 1 : 0.6,
            transition: "opacity 0.2s ease",
          }}
        />
      </Box>

      {/* Title */}
      <Text
        size={config.textSize}
        fw={500}
        ta="center"
        lineClamp={2}
        style={{
          maxWidth: config.textMaxWidth,
          color: "var(--mantine-color-text)",
        }}
      >
        {t("add_bookmark")}
      </Text>
    </Box>
  );
}
