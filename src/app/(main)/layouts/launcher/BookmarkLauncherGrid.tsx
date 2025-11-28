"use client";

import {
  SimpleGrid,
  Box,
  Text,
  Switch,
  Group,
  Container,
  Stack,
  useMantineTheme,
  alpha,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { BookmarkLauncherItem } from "./BookmarkLauncherItem";
import { AddBookmarkLauncherItem } from "./AddBookmarkLauncherItem";
import { CollectionLauncherSection } from "./CollectionLauncherSection";
import { useState, useMemo } from "react";
import { modals } from "@mantine/modals";
import {
  DndContainer,
  restrictToVertical,
  SortableItem,
  useMultiContainerDnd,
} from "@/lib/dnd";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { BookmarkDragOverlay } from "./BookmarkDragOverlay";
import { CollectionDragOverlay } from "./CollectionDragOverlay";
import { moveBookmarkAction } from "@/app/actions/bookmark";
import {
  saveBookmarkOrderAction,
  saveCollectionOrderAction,
} from "@/app/actions/order";
import { BookmarkLayoutProps, BookmarkWithIcon, CollectionWithBookmarks } from "../types";

export type DensityMode = "default" | "compact";

interface BookmarkLauncherGridProps extends BookmarkLayoutProps {}

const DENSITY_CONFIG = {
  default: {
    size: "medium" as const,
    spacing: "xl" as const,
    cols: { base: 4, xs: 5, sm: 6, md: 7, lg: 9, xl: 11 },
  },
  compact: {
    size: "small" as const,
    spacing: "md" as const,
    cols: { base: 5, xs: 6, sm: 8, md: 10, lg: 12, xl: 15 },
  },
};

export function BookmarkLauncherGrid({
  uncollectedBookmarks,
  collections: collectionsProps,
}: BookmarkLauncherGridProps) {
  const [density, setDensity] = useState<DensityMode>("default");
  const [editMode, setEditMode] = useState(false);
  const config = DENSITY_CONFIG[density];
  const theme = useMantineTheme();

  // Store expanded state for all collections in localStorage
  const [expandedStates, setExpandedStates] = useLocalStorage<Record<string, boolean>>({
    key: "launcher-collection-expanded-states",
    defaultValue: {},
  });

  // Helper to toggle a specific collection's expanded state
  const toggleCollectionExpanded = (collectionId: string) => {
    setExpandedStates((prev) => ({
      ...prev,
      [collectionId]: prev[collectionId] === undefined ? false : !prev[collectionId],
    }));
  };

  const collectionMap = useMemo(
    () =>
      collectionsProps.reduce((acc, collection) => {
        acc[collection.id] = collection;
        return acc;
      }, {} as Record<string, CollectionWithBookmarks>),
    [collectionsProps]
  );
  const launcherState = useMemo<DndContainer<BookmarkWithIcon>[]>(() => {
    return [
      {
        id: "uncollected",
        items: uncollectedBookmarks,
      },
      ...collectionsProps.map((collection) => ({
        id: collection.id,
        items: collection.bookmark,
      })),
    ];
  }, [uncollectedBookmarks, collectionsProps]);
  const {
    dndContextProps,
    containers,
    activeId,
    activeType,
    activeItem,
    itemSourceContainerId,
    activeContainerId,
    containerIds,
  } = useMultiContainerDnd<BookmarkWithIcon>(launcherState, {
    onItemReorder: async (containerId, oldIndex, newIndex, items) => {
      // Item reordered within the same collection
      const collectionId = containerId === "uncollected" ? null : containerId;
      const order = items.map((item) => item.id);

      const result = await saveBookmarkOrderAction({
        collectionId,
        order,
      });

      if (!result.success) {
        console.error("Failed to save bookmark order:", result.error);
      }
    },
    onItemMove: async (itemId, fromContainerId, toContainerId, toIndex, items) => {
      // Item moved to a different collection
      const targetCollectionId =
        toContainerId === "uncollected" ? null : toContainerId;
      const targetOrder = items.map((item) => item.id);

      const result = await moveBookmarkAction(
        itemId,
        targetCollectionId,
        targetOrder
      );

      if (!result.success) {
        console.error("Failed to move bookmark:", result.error);
      }
    },
    onContainerReorder: async (oldIndex, newIndex, containers) => {
      // Collections reordered - exclude "uncollected" container
      const order = containers
        .filter((container) => container.id !== "uncollected")
        .map((container) => container.id);

      const result = await saveCollectionOrderAction({ order });

      if (!result.success) {
        console.error("Failed to save collection order:", result.error);
      }
    },
  });

  const uncollected = useMemo(
    () => containers.find((container) => container.id === "uncollected"),
    [containers]
  );
  const collections = useMemo(
    () => containers.filter((container) => container.id !== "uncollected"),
    [containers]
  );

  // Get the active container for overlay
  const activeContainer = useMemo(() => {
    if (!activeId || activeType !== "container") return null;
    return containers.find((c) => c.id === activeId);
  }, [activeId, activeType, containers]);

  const handleEditBookmark = (bookmark: BookmarkWithIcon) => {
    modals.openContextModal({
      modal: "editBookmark",
      title: "Edit Bookmark",
      innerProps: {
        bookmarkId: bookmark.id,
      },
    });
  };

  const handleEditCollection = (collection: CollectionWithBookmarks) => {
    modals.openContextModal({
      modal: "editCollection",
      title: "Edit Collection",
      innerProps: {
        collectionId: collection.id,
        initialValues: {
          name: collection.name,
          description: collection.description || undefined,
          color: collection.color || undefined,
        },
      },
    });
  };

  const hasNoContent =
    uncollectedBookmarks.length === 0 && collections.length === 0;

  if (hasNoContent) {
    return (
      <Container size="xl" py="xl">
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            gap: "32px",
          }}
        >
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <Text size="xl" fw={600} c="dimmed" ta="center">
              No bookmarks yet
            </Text>
            <Text size="md" c="dimmed" ta="center">
              Start by adding your first bookmark
            </Text>
          </Box>
          <AddBookmarkLauncherItem size={config.size} />
        </Box>
      </Container>
    );
  }

  return (
    <DndContext {...dndContextProps}>
      <Container fluid py="xl">
        <Group justify="flex-end" mb="lg" gap="md">
          <Switch
            label="Edit mode"
            checked={editMode}
            onChange={(event) => setEditMode(event.currentTarget.checked)}
          />
          <Switch
            label="Compact mode"
            checked={density === "compact"}
            onChange={(event) =>
              setDensity(event.currentTarget.checked ? "compact" : "default")
            }
          />
        </Group>

        <SortableContext
          items={["uncollected", ...collections.map((c) => c.id)]}
          strategy={verticalListSortingStrategy}
        >
          {/* Uncollected Bookmarks Section */}
          {uncollected?.items && uncollected.items.length > 0 && (
            <SortableItem
              key={"uncollected"}
              id={"uncollected"}
              data={{ type: "container", containerId: "uncollected" }}
              restrictDirection="vertical"
              disabled={activeType === "container"} // Disable sorting for uncollected
            >
              <SortableContext
                items={uncollected.items.map((item) => item.id)}
                strategy={rectSortingStrategy}
              >
                <SimpleGrid
                  cols={config.cols}
                  spacing={config.spacing}
                  verticalSpacing={config.spacing}
                  mb={collections.length > 0 ? "xl" : undefined}
                  py={8}
                  style={{
                    border: `2px solid ${
                      activeContainerId === "uncollected" &&
                      itemSourceContainerId !== "uncollected"
                        ? theme.colors.green[6]
                        : "transparent"
                    }`,
                    borderRadius: "16px",
                    backgroundColor:
                      activeContainerId === "uncollected" &&
                      itemSourceContainerId !== "uncollected"
                        ? alpha(theme.colors.green[0], 0.5)
                        : "transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  <AddBookmarkLauncherItem size={config.size} />

                  {uncollected.items.map((bookmark) => (
                    <SortableItem
                      key={bookmark.id}
                      id={bookmark.id}
                      disabled={!editMode}
                    >
                      <BookmarkLauncherItem
                        id={bookmark.id}
                        title={bookmark.title}
                        url={bookmark.url}
                        hasIcon={bookmark.websiteIcon !== null}
                        size={config.size}
                        editMode={editMode}
                        onEdit={() => handleEditBookmark(bookmark)}
                      />
                    </SortableItem>
                  ))}
                </SimpleGrid>
              </SortableContext>
            </SortableItem>
          )}

          {/* Collections Section */}
          {collections.length > 0 &&
            collections.map((collection) => (
              <SortableItem
                key={collection.id}
                id={collection.id}
                data={{ type: "container", containerId: collection.id }}
                restrictDirection="vertical"
                disabled={!editMode}
              >
                {(dragHandleProps) => (
                  <CollectionLauncherSection
                    collection={{
                      ...collectionMap[collection.id],
                      bookmark: collection.items,
                    }}
                    size={config.size}
                    spacing={config.spacing}
                    cols={config.cols}
                    editMode={editMode}
                    onEditBookmark={handleEditBookmark}
                    onEditCollection={handleEditCollection}
                    isDropTarget={
                      activeContainerId === collection.id &&
                      itemSourceContainerId !== collection.id
                    }
                    dragHandleProps={dragHandleProps}
                    isExpanded={expandedStates[collection.id] ?? true}
                    onToggleExpanded={() => toggleCollectionExpanded(collection.id)}
                  />
                )}
              </SortableItem>
            ))}
        </SortableContext>
      </Container>
      <DragOverlay
        modifiers={
          activeType === "container" ? [restrictToVertical] : undefined
        }
      >
        {activeType === "item" && activeItem ? (
          <BookmarkDragOverlay
            id={activeItem.id}
            title={activeItem.title}
            hasIcon={activeItem.websiteIcon !== null}
            size={config.size}
          />
        ) : activeType === "container" && activeContainer ? (
          <CollectionDragOverlay
            collection={collectionMap[activeContainer.id]}
            spacing={config.spacing}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
