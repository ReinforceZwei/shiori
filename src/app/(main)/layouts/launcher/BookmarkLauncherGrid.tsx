"use client";

import {
  SimpleGrid,
  Box,
  Text,
  useMantineTheme,
  alpha,
  Anchor,
  ActionIcon,
  Button,
  Transition,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import Link from "next/link";
import { IconEdit, IconX } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
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
import {
  moveBookmarkAction,
  deleteBookmarkAction,
} from "@/app/actions/bookmark";
import {
  saveBookmarkOrderAction,
  saveCollectionOrderAction,
} from "@/app/actions/order";
import {
  BookmarkLayoutProps,
} from "../types";
import { BookmarkWithIcon, CollectionWithBookmarks } from "@/features/bookmark/types";
import { LauncherLayoutConfig } from "@/features/settings/layout-config";
import { AppContainer } from "@/component/layout/AppContainer";

export type DensityMode = "comfortable" | "compact";

interface BookmarkLauncherGridProps extends BookmarkLayoutProps {
  config: LauncherLayoutConfig;
}

const DENSITY_CONFIG = {
  comfortable: {
    size: "medium" as const,
    spacing: "xl" as const,
    cols: {
      base: 4,
      xs: 5,
      sm: 6,
      md: 7,
      lg: 9,
      xl: 11,
      // Additional breakpoints for wider screens
      xxl: 13, // 1600px - Wide desktop
      fhd: 15, // 1920px - Full HD
      qhd: 18, // 2400px - QHD ultrawide
      uhd: 21, // 2880px - 4K ultrawide
      uw: 25, // 3440px - 21:9 ultrawide
    },
  },
  compact: {
    size: "small" as const,
    spacing: "md" as const,
    cols: {
      base: 5,
      xs: 6,
      sm: 8,
      md: 10,
      lg: 12,
      xl: 15,
      // Additional breakpoints for wider screens
      xxl: 18, // 1600px - Wide desktop
      fhd: 21, // 1920px - Full HD
      qhd: 25, // 2400px - QHD ultrawide
      uhd: 30, // 2880px - 4K ultrawide
      uw: 35, // 3440px - 21:9 ultrawide
    },
  },
};

export function BookmarkLauncherGrid({
  uncollectedBookmarks,
  collections: collectionsProps,
  config: launcherConfig,
}: BookmarkLauncherGridProps) {
  const t = useTranslations("Layout_Launcher");
  const [editMode, setEditMode] = useState(false);
  const density: DensityMode = launcherConfig.density;
  const config = DENSITY_CONFIG[density];
  const theme = useMantineTheme();

  // Store expanded state for all collections in localStorage
  const [expandedStates, setExpandedStates] = useLocalStorage<
    Record<string, boolean>
  >({
    key: "launcher-collection-expanded-states",
    defaultValue: {},
  });

  // Helper to toggle a specific collection's expanded state
  const toggleCollectionExpanded = (collectionId: string) => {
    setExpandedStates((prev) => ({
      ...prev,
      [collectionId]:
        prev[collectionId] === undefined ? false : !prev[collectionId],
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
    onItemMove: async (
      itemId,
      fromContainerId,
      toContainerId,
      toIndex,
      items
    ) => {
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
      title: t("edit_bookmark_title"),
      innerProps: {
        bookmarkId: bookmark.id,
      },
    });
  };

  const handleEditCollection = (collection: CollectionWithBookmarks) => {
    modals.openContextModal({
      modal: "editCollection",
      title: t("edit_collection_title"),
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

  const handleDeleteBookmark = (bookmark: BookmarkWithIcon) => {
    modals.openConfirmModal({
      title: t("delete_bookmark_title"),
      children: (
        <Text size="sm">
          {t("delete_bookmark_message", { title: bookmark.title })}
        </Text>
      ),
      labels: { confirm: t("delete_confirm"), cancel: t("delete_cancel") },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        const result = await deleteBookmarkAction(bookmark.id);
        if (!result.success) {
          console.error("Failed to delete bookmark:", result.error);
        }
      },
    });
  };

  const hasNoContent =
    uncollectedBookmarks.length === 0 && collections.length === 0;

  if (hasNoContent) {
    return (
      <AppContainer py="xl">
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
              {t("empty_title")}
            </Text>
            <Text size="md" c="dimmed" ta="center">
              {t("empty_subtitle")}
            </Text>
          </Box>
          <AddBookmarkLauncherItem size={config.size} />
          <Anchor 
            component={Link} 
            href="/import" 
            c="blue" 
            size="sm" 
            ta="center"
            style={{ display: "block" }}
          >
            {t("empty_import_alternative")}
          </Anchor>
        </Box>
      </AppContainer>
    );
  }

  return (
    <DndContext {...dndContextProps}>
      <AppContainer fluid py="xl">
        <SortableContext
          items={["uncollected", ...collections.map((c) => c.id)]}
          strategy={verticalListSortingStrategy}
        >
          {/* Uncollected Bookmarks Section */}
          {((uncollected?.items && uncollected.items.length > 0) ||
            itemSourceContainerId === "uncollected" ||
            launcherConfig.showEmptyUncollected) && (
            <SortableItem
              key={"uncollected"}
              id={"uncollected"}
              data={{ type: "container", containerId: "uncollected" }}
              restrictDirection="vertical"
              disabled={!editMode || activeType === "container"} // Disable sorting for uncollected
            >
              <SortableContext
                items={
                  uncollected?.items
                    ? uncollected.items.map((item) => item.id)
                    : []
                }
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
                  {uncollected?.items &&
                    uncollected.items.length > 0 &&
                    uncollected.items.map((bookmark) => (
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
                          size={config.size}
                          editMode={editMode}
                          onEdit={() => handleEditBookmark(bookmark)}
                          onDelete={() => handleDeleteBookmark(bookmark)}
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
                    opacity={launcherConfig.collectionOpacity}
                    blur={launcherConfig.collectionBlur}
                    editMode={editMode}
                    onEditBookmark={handleEditBookmark}
                    onDeleteBookmark={handleDeleteBookmark}
                    onEditCollection={handleEditCollection}
                    isDropTarget={
                      activeContainerId === collection.id &&
                      itemSourceContainerId !== collection.id
                    }
                    dragHandleProps={dragHandleProps}
                    isExpanded={expandedStates[collection.id] ?? true}
                    onToggleExpanded={() =>
                      toggleCollectionExpanded(collection.id)
                    }
                  />
                )}
              </SortableItem>
            ))}
        </SortableContext>
      </AppContainer>
      <DragOverlay
        modifiers={
          activeType === "container" ? [restrictToVertical] : undefined
        }
      >
        {activeType === "item" && activeItem ? (
          <BookmarkDragOverlay
            id={activeItem.id}
            title={activeItem.title}
            iconId={activeItem.websiteIcon?.id}
            size={config.size}
          />
        ) : activeType === "container" && activeContainer ? (
          <CollectionDragOverlay
            collection={collectionMap[activeContainer.id]}
            spacing={config.spacing}
          />
        ) : null}
      </DragOverlay>

      {/* Floating Edit Mode Button */}
      <Box
        style={{
          position: "fixed",
          bottom: "1rem",
          right: "1rem",
          zIndex: 1000,
        }}
      >
        <Transition
          mounted={!editMode}
          transition="fade-up"
          duration={150}
          enterDelay={150}
          timingFunction="ease"
        >
          {(styles) => (
            <ActionIcon
              size="xl"
              radius="xl"
              variant="filled"
              color="roseRed"
              onClick={() => setEditMode(true)}
              style={{
                ...styles,
                boxShadow: theme.shadows.lg,
              }}
            >
              <IconEdit size={24} />
            </ActionIcon>
          )}
        </Transition>
        <Transition
          mounted={editMode}
          transition="fade-up"
          duration={150}
          enterDelay={150}
          timingFunction="ease"
        >
          {(styles) => (
            <Button
              leftSection={<IconX size={20} />}
              // size="md"
              radius="xl"
              variant="filled"
              onClick={() => setEditMode(false)}
              style={{
                ...styles,
                boxShadow: theme.shadows.lg,
              }}
            >
              {t("exit_edit_mode")}
            </Button>
          )}
        </Transition>
      </Box>
    </DndContext>
  );
}
