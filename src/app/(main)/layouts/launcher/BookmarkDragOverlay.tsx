"use client";

import { Box, Text, Image } from "@mantine/core";
import { IconWorld } from "@tabler/icons-react";
import { LauncherItemSize } from "./BookmarkLauncherItem";

interface BookmarkDragOverlayProps {
  id: string;
  title: string;
  hasIcon?: boolean;
  size?: LauncherItemSize;
}

const SIZE_CONFIG = {
  medium: {
    iconSize: 64,
    imageSize: 64,
    borderRadius: "16px",
    gap: "8px",
    textSize: "xs" as const,
    textMaxWidth: "80px",
  },
  small: {
    iconSize: 48,
    imageSize: 48,
    borderRadius: "12px",
    gap: "6px",
    textSize: "xs" as const,
    textMaxWidth: "64px",
  },
};

export function BookmarkDragOverlay({ 
  id, 
  title,
  hasIcon = false,
  size = "medium",
}: BookmarkDragOverlayProps) {
  const config = SIZE_CONFIG[size];

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: config.gap,
        cursor: "grabbing",
      }}
    >
      {/* Icon Container */}
      <Box
        style={{
          width: `${config.iconSize}px`,
          height: `${config.iconSize}px`,
          borderRadius: config.borderRadius,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--mantine-color-default-hover)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
          border: "1px solid var(--mantine-color-default-border)",
          opacity: 0.95,
        }}
      >
        {!hasIcon ? (
          <IconWorld size={size === "medium" ? 32 : 24} opacity={0.3} />
        ) : (
          <Image
            src={`/api/bookmark/${id}/websiteicon`}
            width={config.imageSize}
            height={config.imageSize}
            fit="contain"
            fallbackSrc="/assets/world-wide-web.png"
          />
        )}
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
        {title}
      </Text>
    </Box>
  );
}

