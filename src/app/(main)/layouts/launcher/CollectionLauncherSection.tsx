"use client";

import { Box, Text, SimpleGrid, ActionIcon, Group, alpha, darken, useMantineTheme } from "@mantine/core";
import { IconChevronDown, IconChevronUp, IconEdit, IconGripVertical, IconTrash } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { BookmarkLauncherItem, LauncherItemSize } from "./BookmarkLauncherItem";
import { AddBookmarkLauncherItem } from "./AddBookmarkLauncherItem";
import { SortableItem } from "@/lib/dnd";
import { type DragHandleProps } from "@/lib/dnd/components/SortableItem";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { BookmarkWithIcon, CollectionWithBookmarks } from "../types";
import { deleteCollectionAction } from "@/app/actions/collection";

interface CollectionLauncherSectionProps {
  collection: CollectionWithBookmarks;
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
  opacity?: number;
  blur?: number;
  editMode: boolean;
  onEditBookmark: (bookmark: BookmarkWithIcon) => void;
  onDeleteBookmark: (bookmark: BookmarkWithIcon) => void;
  onEditCollection: (collection: CollectionWithBookmarks) => void;
  isDropTarget?: boolean;
  dragHandleProps?: DragHandleProps;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export function CollectionLauncherSection({
  collection,
  size,
  spacing,
  cols,
  opacity = 0.5,
  blur = 10,
  editMode,
  onEditBookmark,
  onDeleteBookmark,
  onEditCollection,
  isDropTarget = false,
  dragHandleProps = undefined,
  isExpanded,
  onToggleExpanded,
}: CollectionLauncherSectionProps) {
  const theme = useMantineTheme();
  
  const backgroundColor = isDropTarget 
    ? alpha(theme.colors.green[0], opacity)
    : alpha(collection.color || '#808080', opacity);
  const iconColor = collection.color ? darken(collection.color, 0.5) : undefined;
  const borderColor = isDropTarget 
    ? theme.colors.green[6]
    : 'transparent';

  const handleDeleteCollection = () => {
    const bookmarkCount = collection.bookmark.length;
    
    modals.openConfirmModal({
      title: 'Delete Collection',
      children: (
        <Text size="sm">
          Are you sure you want to delete <strong>{collection.name}</strong>?
          {bookmarkCount > 0 && (
            <>
              <br /><br />
              {bookmarkCount} {bookmarkCount === 1 ? 'bookmark' : 'bookmarks'} will be moved to Uncollected.
            </>
          )}
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          const result = await deleteCollectionAction(collection.id);
          
          if (result.success) {
            notifications.show({
              title: 'Collection deleted',
              message: `${collection.name} has been deleted successfully.`,
              color: 'green',
            });
          } else {
            notifications.show({
              title: 'Cannot delete collection',
              message: result.error || 'An error occurred while deleting the collection.',
              color: 'red',
            });
          }
        } catch (error) {
          console.error('Error deleting collection:', error);
          notifications.show({
            title: 'Cannot delete collection',
            message: 'An error occurred while deleting the collection. Please try again.',
            color: 'red',
          });
        }
      },
    });
  };

  return (
    <Box
      style={{
        backgroundColor,
        backdropFilter: `blur(${blur}px)`,
        borderRadius: "16px",
        marginBottom: spacing === "xl" ? "24px" : "16px",
        border: `2px solid ${borderColor}`,
        transition: "all 0.2s ease",
        boxShadow: "var(--mantine-shadow-lg)",
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
            onClick={onToggleExpanded}
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
          <Group gap="xs">
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
            <ActionIcon
              variant="subtle"
              onClick={handleDeleteCollection}
              size="lg"
              color="red"
              style={{
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
              }}
            >
              <IconTrash size={20} />
            </ActionIcon>
          </Group>
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
                  iconId={bookmark.websiteIcon?.id}
                  size={size}
                  editMode={editMode}
                  onEdit={() => onEditBookmark(bookmark)}
                  onDelete={() => onDeleteBookmark(bookmark)}
                />
              </SortableItem>
            ))}
          </SortableContext>
        </SimpleGrid>
      )}
    </Box>
  );
}

