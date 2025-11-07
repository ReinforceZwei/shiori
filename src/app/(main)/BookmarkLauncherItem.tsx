"use client";

import { Box, Text, Image } from "@mantine/core";
import { useState } from "react";

interface BookmarkLauncherItemProps {
  id: string;
  title: string;
  url: string;
}

export function BookmarkLauncherItem({ id, title, url }: BookmarkLauncherItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      component="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        textDecoration: "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        transition: "transform 0.2s ease",
        transform: isHovered ? "scale(1.05)" : "scale(1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon Container */}
      <Box
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "16px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--mantine-color-default-hover)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          border: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <Image
          src={`/api/bookmark/${id}/websiteicon?fallback=true`}
          alt={title}
          width={64}
          height={64}
          fit="contain"
          fallbackSrc="/assets/world-wide-web.png"
        />
      </Box>

      {/* Title */}
      <Text
        size="xs"
        fw={500}
        ta="center"
        lineClamp={2}
        style={{
          maxWidth: "80px",
          color: "var(--mantine-color-text)",
        }}
      >
        {title}
      </Text>
    </Box>
  );
}

