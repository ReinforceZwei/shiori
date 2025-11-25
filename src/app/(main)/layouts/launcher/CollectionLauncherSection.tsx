"use client";

import { Box, Text, SimpleGrid, ActionIcon, Group, alpha, darken, useMantineTheme } from "@mantine/core";
import { useState } from "react";
import { IconChevronDown, IconChevronUp, IconEdit, IconGripVertical } from "@tabler/icons-react";
import { BookmarkLauncherItem, LauncherItemSize } from "./BookmarkLauncherItem";
import { AddBookmarkLauncherItem } from "./AddBookmarkLauncherItem";
import { Bookmark, Collection } from "@/generated/prisma";
import { SortableItem } from "@/lib/dnd";
import { type DragHandleProps } from "@/lib/dnd/components/SortableItem";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";

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
  isDropTarget?: boolean;
  dragHandleProps?: DragHandleProps;
}

export function CollectionLauncherSection({
  collection,
  size,
  spacing,
  cols,
  editMode,
  onEditBookmark,
  onEditCollection,
  isDropTarget = false,
  dragHandleProps = undefined,
}: CollectionLauncherSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const theme = useMantineTheme();
  
  const backgroundColor = isDropTarget 
    ? alpha(theme.colors.green[0], 0.5)
    : alpha(collection.color || '#808080', 0.12);
  const iconColor = collection.color ? darken(collection.color, 0.3) : undefined;
  const borderColor = isDropTarget 
    ? theme.colors.green[6]
    : 'transparent';

  return (
    <Box
      style={{
        backgroundColor,
        borderRadius: "16px",
        marginBottom: spacing === "xl" ? "24px" : "16px",
        border: `2px solid ${borderColor}`,
        transition: "all 0.2s ease",
      }}
    >
      {/* Collection Header */}
      <Group justify="space-between" p={spacing === "xl" ? "24px" : "16px"}>
        <Group gap="sm">
          {editMode && dragHandleProps && (
            <ActionIcon
              {...dragHandleProps}
              variant="subtle"
              size="lg"
              color={iconColor}
              style={{
                cursor: 'grab',
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
              }}
            >
              <IconGripVertical size={20} />
            </ActionIcon>
          )}
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
          <SortableContext
            items={collection.bookmark.map(item => item.id)}
            strategy={rectSortingStrategy}
          >
            {collection.bookmark.map(bookmark => (
              <SortableItem
                key={bookmark.id}
                id={bookmark.id}
                disabled={!editMode}
              >
                <BookmarkLauncherItem
                  id={bookmark.id}
                  title={bookmark.title}
                  url={bookmark.url}
                  size={size}
                  editMode={editMode}
                  onEdit={() => onEditBookmark(bookmark)}
                />
              </SortableItem>
            ))}
          </SortableContext>
        </SimpleGrid>
      )}
    </Box>
  );
}

