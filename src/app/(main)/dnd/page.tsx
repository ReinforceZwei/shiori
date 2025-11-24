'use client';

import { SimpleGrid, Stack, Text, Switch, Group } from "@mantine/core";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";

// Import our new DND abstraction
import {
  useMultiContainerDnd,
  SortableItem,
  SortableContainer,
  customCollisionDetection,
  restrictToVertical,
  type DndContainer,
} from "@/lib/dnd";

// Import local components
import { Item } from "./Item";

// Define the shape of our bookmark items
interface BookmarkItem {
  id: string;
  title: string;
}

// Initial data - Uncollected (static) container
const uncollectedContainer: DndContainer<BookmarkItem> = {
  id: "uncollected",
  items: [
    { id: "bookmark-u1", title: "Uncollected 1" },
    { id: "bookmark-u2", title: "Uncollected 2" },
    { id: "bookmark-u3", title: "Uncollected 3" },
    { id: "bookmark-u4", title: "Uncollected 4" },
    { id: "bookmark-u5", title: "Uncollected 5" },
  ],
};

// Sortable collections
const sortableCollections: DndContainer<BookmarkItem>[] = [
  {
    id: "collection-1",
    items: [
      { id: "bookmark-1", title: "bookmark-1" },
      { id: "bookmark-2", title: "bookmark-2" },
      { id: "bookmark-3", title: "bookmark-3" },
      { id: "bookmark-4", title: "bookmark-4" },
    ],
  },
  {
    id: "collection-2",
    items: [
      { id: "bookmark-23", title: "bookmark-23" },
      { id: "bookmark-24", title: "bookmark-24" },
      { id: "bookmark-25", title: "bookmark-25" },
    ],
  },
  {
    id: "collection-3",
    items: [
      { id: "bookmark-35", title: "bookmark-35" },
      { id: "bookmark-36", title: "bookmark-36" },
    ],
  },
];

// Combine for the hook (uncollected first, then collections)
const initialContainers: DndContainer<BookmarkItem>[] = [
  uncollectedContainer,
  ...sortableCollections,
];

export default function DndPage() {
  // Edit mode toggle
  const [editMode, setEditMode] = useState(false);

  // Use our custom DND hook with callbacks
  const {
    dndContextProps,
    containers,
    activeId,
    activeType,
    activeItem,
    itemSourceContainerId,
    activeContainerId,
    containerIds,
  } = useMultiContainerDnd<BookmarkItem>(initialContainers, {
    onItemReorder: (containerId, oldIndex, newIndex, items) => {
      console.log('Item reordered:', {
        containerId,
        oldIndex,
        newIndex,
        items: items.map(i => i.id),
      });
    },
    onItemMove: (itemId, fromContainerId, toContainerId, toIndex, items) => {
      console.log('Item moved:', {
        itemId,
        from: fromContainerId,
        to: toContainerId,
        toIndex,
        newOrder: items.map(i => i.id),
      });
    },
    onContainerReorder: (oldIndex, newIndex, containers) => {
      console.log('Container reordered:', {
        oldIndex,
        newIndex,
        containers: containers.map(c => c.id),
      });
    },
  });

  // Get the active container for overlay
  const activeContainer = useMemo(() => {
    if (!activeId || activeType !== 'container') return null;
    return containers.find(c => c.id === activeId);
  }, [activeId, activeType, containers]);

  // Separate uncollected container from sortable collections
  const uncollected = containers.find(c => c.id === 'uncollected');
  const collections = containers.filter(c => c.id !== 'uncollected');

  return (
    <DndContext
      {...dndContextProps}
      collisionDetection={customCollisionDetection}
    >
      <Stack p="xl" gap="xl">
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs">
            <Text size="xl" fw={700}>
              DnD Playground - Using Abstracted Logic
            </Text>
            <Text size="sm" c="dimmed">
              This playground demonstrates the abstracted DND logic from @/lib/dnd
            </Text>
            <Text size="xs" c="dimmed" fs="italic">
              • Static "Uncollected" container stays at top (cannot be reordered)
            </Text>
            <Text size="xs" c="dimmed" fs="italic">
              • Collection containers can be reordered
            </Text>
            <Text size="xs" c="dimmed" fs="italic">
              • Items can be dragged between any container
            </Text>
          </Stack>

          <Switch
            label="Edit Mode"
            description="Enable to drag items"
            checked={editMode}
            onChange={(event) => setEditMode(event.currentTarget.checked)}
            size="md"
          />
        </Group>

        {/* Static Uncollected Container */}
        {uncollected && (
          <Stack
            style={{
              border: `3px solid ${
                activeContainerId === 'uncollected' && itemSourceContainerId !== 'uncollected'
                  ? '#40c057' // Green when drop target
                  : '#228be6' // Blue default
              }`,
              borderRadius: "8px",
              padding: "16px",
              backgroundColor: 
                activeContainerId === 'uncollected' && itemSourceContainerId !== 'uncollected'
                  ? '#d3f9d8' // Light green when drop target
                  : '#e7f5ff', // Light blue default
              transition: 'all 0.2s ease',
            }}
          >
            <Text size="lg" fw={600} c="blue">
              📌 {uncollected.id.toUpperCase()} (Static Container)
            </Text>

            <SimpleGrid cols={3}>
              <SortableContainer
                items={uncollected.items}
                renderItem={(item) => (
                  <Item id={item.id} title={item.title} isDraggable={editMode} />
                )}
                itemProps={{ disabled: !editMode }}
              />
            </SimpleGrid>
          </Stack>
        )}

        {/* Sortable Collections */}
        <SortableContext
          items={collections.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {collections.map((collection) => (
            <SortableItem
              key={collection.id}
              id={collection.id}
              data={{ type: "container", containerId: collection.id }}
              restrictDirection="vertical"
              disabled={!editMode}
              >
                <Stack
                  style={{
                    border: `2px solid ${
                      activeContainerId === collection.id && itemSourceContainerId !== collection.id
                        ? '#40c057' // Green when drop target
                        : '#ddd' // Gray default
                    }`,
                    borderRadius: "8px",
                    padding: "16px",
                    backgroundColor: 
                      activeContainerId === collection.id && itemSourceContainerId !== collection.id
                        ? '#d3f9d8' // Light green when drop target
                        : '#f9f9f9', // Gray default
                    cursor: editMode ? "grab" : "default",
                    opacity: editMode ? 1 : 0.7,
                    transition: 'all 0.2s ease',
                  }}
                >
                <Text size="lg" fw={600}>
                  ↕️ {collection.id}
                </Text>

                <SimpleGrid cols={3}>
                  <SortableContainer
                    items={collection.items}
                    renderItem={(item) => (
                      <Item id={item.id} title={item.title} isDraggable={editMode} />
                    )}
                    itemProps={{ disabled: !editMode }}
                  />
                </SimpleGrid>
              </Stack>
            </SortableItem>
          ))}
        </SortableContext>
      </Stack>

      {/* Drag Overlay */}
      <DragOverlay
        modifiers={activeType === 'container' ? [restrictToVertical] : undefined}
      >
        {activeType === 'item' && activeItem ? (
          <div style={{ opacity: 0.8 }}>
            <Item id={activeItem.id} title={activeItem.title} />
          </div>
        ) : activeType === 'container' && activeContainer ? (
          <Stack
            style={{
              border: "2px solid #228be6",
              borderRadius: "8px",
              padding: "16px",
              backgroundColor: "#e7f5ff",
              opacity: 0.9,
            }}
          >
            <Text size="lg" fw={600}>
              {activeContainer.id}
            </Text>
            <SimpleGrid cols={3}>
              {activeContainer.items.map((item) => (
                <Item key={item.id} id={item.id} title={item.title} />
              ))}
            </SimpleGrid>
          </Stack>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
