"use client";

import { Box, Text, Group, alpha, darken } from "@mantine/core";
import { Collection } from "@/generated/prisma/browser";

interface CollectionDragOverlayProps {
  collection: Collection;
  spacing?: "xl" | "md";
}

export function CollectionDragOverlay({
  collection,
  spacing = "xl",
}: CollectionDragOverlayProps) {
  const backgroundColor = alpha(collection.color || '#808080', 0.12);
  const iconColor = collection.color ? darken(collection.color, 0.3) : undefined;

  return (
    <Box
      style={{
        backgroundColor,
        borderRadius: "16px",
        opacity: 0.95,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
        minWidth: "300px",
        cursor: "grabbing",
      }}
    >
      {/* Collection Header */}
      <Group justify="space-between" p={spacing === "xl" ? "24px" : "16px"}>
        <Group gap="sm">
          <Text size="lg" fw={600} c={iconColor}>
            {collection.name}
          </Text>
        </Group>
      </Group>
    </Box>
  );
}

