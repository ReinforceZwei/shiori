"use client";

import { Box, Text, Image, ActionIcon, Loader } from "@mantine/core";
import { useState } from "react";
import { IconEdit, IconWorld, IconX } from "@tabler/icons-react";

export type LauncherItemSize = "medium" | "small";

interface BookmarkLauncherItemProps {
  id: string;
  title: string;
  url: string;
  iconId?: string;
  size?: LauncherItemSize;
  editMode?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const SIZE_CONFIG = {
  medium: {
    iconSize: 64,
    imageSize: 64,
    borderRadius: "16px",
    gap: "8px",
    textSize: "xs" as const,
    textMaxWidth: "100px",
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

export function BookmarkLauncherItem({ 
  id, 
  title, 
  url,
  iconId,
  size = "medium", 
  editMode = false,
  onEdit,
  onDelete 
}: BookmarkLauncherItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = SIZE_CONFIG[size];

  const handleClick = (e: React.MouseEvent) => {
    if (editMode && onEdit) {
      e.preventDefault();
      onEdit();
    }
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
      {/* Icon Container with Delete Badge */}
      <Box style={{ position: "relative" }}>
        <Box
          component={editMode ? "div" : "a"}
          href={editMode ? undefined : url}
          target={editMode ? undefined : "_blank"}
          rel={editMode ? undefined : "noopener noreferrer"}
          onClick={handleClick}
          style={{
            textDecoration: "none",
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
            border: "1px solid var(--mantine-color-default-border)",
            transition: "transform 0.2s ease",
            transform: isHovered ? "scale(1.1)" : "scale(1)",
            position: "relative",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {!iconId ? (
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <IconWorld size={size === "medium" ? 32 : 24} opacity={0.3} />
            </Box>
          ) : (
            <Image
              src={`/api/icon/${iconId}`}
              width={config.imageSize}
              height={config.imageSize}
              fit="contain"
            />
          )}
          
          {/* Edit Icon Overlay */}
          {editMode && isHovered && (
            <Box
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                borderRadius: config.borderRadius,
              }}
            >
              <ActionIcon
                variant="transparent"
                size="lg"
                style={{ color: "white" }}
              >
                <IconEdit size={size === "medium" ? 32 : 24} />
              </ActionIcon>
            </Box>
          )}
        </Box>

        {/* Delete Badge (iOS-style X) */}
        {editMode && onDelete && (
          <Box
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 59, 48, 0.95)", // iOS red
              border: "2px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              transition: "transform 0.2s ease",
              boxShadow: "var(--mantine-shadow-lg)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <IconX size={14} color="white" stroke={3} />
          </Box>
        )}
      </Box>

      {/* Title */}
      <Text
        size={config.textSize}
        fw={400}
        ta="center"
        lineClamp={2}
        style={{
          maxWidth: config.textMaxWidth,
          color: "var(--mantine-color-text)",
          padding: "0.2rem", // Noto Sans font a bit bigger, needs some padding
        }}
      >
        {title}
      </Text>
    </Box>
  );
}
