"use client";

import { Box, Text, SimpleGrid, ActionIcon, Group, alpha, darken } from "@mantine/core";
import { useState } from "react";
import { IconChevronDown, IconChevronUp, IconEdit } from "@tabler/icons-react";
import { BookmarkLauncherItem, LauncherItemSize } from "./BookmarkLauncherItem";
import { AddBookmarkLauncherItem } from "./AddBookmarkLauncherItem";
import { Bookmark, Collection } from "@/generated/prisma";

interface CollectionLauncherSectionProps {
  collection: Collection & { bookmark: Bookmark[] };
  size: LauncherItemSize;
  spacing: "xl" | "md";
  cols: {
    base: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  editMode: boolean;
  onEditBookmark: (bookmark: Bookmark) => void;
  onEditCollection: (collection: Collection) => void;
}

export function CollectionLauncherSection({
  collection,
  size,
  spacing,
  cols,
  editMode,
  onEditBookmark,
  onEditCollection,
}: CollectionLauncherSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const backgroundColor = alpha(collection.color || '#808080', 0.12);
  const iconColor = collection.color ? darken(collection.color, 0.3) : undefined;

  return (
    <Box
      style={{
        backgroundColor,
        borderRadius: "16px",
        marginBottom: spacing === "xl" ? "24px" : "16px",
      }}
    >
      {/* Collection Header */}
      <Group justify="space-between" p={spacing === "xl" ? "24px" : "16px"}>
        <Group gap="sm">
          <ActionIcon
            variant="subtle"
            onClick={() => setIsExpanded(!isExpanded)}
            size="lg"
            color={iconColor}
            style={{
              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
            }}
          >
            {isExpanded ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
          </ActionIcon>
          <Text size="lg" fw={600}>
            {collection.name}
          </Text>
        </Group>
        
        {editMode && (
          <ActionIcon
            variant="subtle"
            onClick={() => onEditCollection(collection)}
            size="lg"
            color={iconColor}
            style={{
              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
            }}
          >
            <IconEdit size={20} />
          </ActionIcon>
        )}
      </Group>

      {/* Collection Content */}
      {isExpanded && (
        <SimpleGrid
          cols={cols}
          spacing={spacing}
          verticalSpacing={spacing}
          pb={spacing === "xl" ? "24px" : "16px"}
        >
          <AddBookmarkLauncherItem size={size} collectionId={collection.id} />
          {collection.bookmark.map((bookmark) => (
            <BookmarkLauncherItem
              key={bookmark.id}
              id={bookmark.id}
              title={bookmark.title}
              url={bookmark.url}
              size={size}
              editMode={editMode}
              onEdit={() => onEditBookmark(bookmark)}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

