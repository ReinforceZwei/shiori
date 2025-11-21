'use client';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { BookmarkContainer } from "./BookmarkContainer";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners, pointerWithin, closestCenter, rectIntersection, DragOverEvent } from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { Item } from "./Item";
import { SortableItem } from "./SortableItem";
import { SortableContainer } from "./SortableContainer";
import { SimpleGrid } from "@mantine/core";

const initialContainers = [
  { id: "collection-1", items: [
    { id: "bookmark-1", title: "bookmark-1" }, 
    { id: "bookmark-2", title: "bookmark-2" },
    { id: "bookmark-3", title: "bookmark-3" },
    { id: "bookmark-4", title: "bookmark-4" },
    { id: "bookmark-5", title: "bookmark-5" },
    { id: "bookmark-6", title: "bookmark-6" },
    { id: "bookmark-7", title: "bookmark-7" },
    { id: "bookmark-8", title: "bookmark-8" },
  ] },
  { id: "collection-2", items: [
    { id: "bookmark-23", title: "bookmark-23" }, { id: "bookmark-24", title: "bookmark-24" },
    { id: "bookmark-25", title: "bookmark-25" }, { id: "bookmark-26", title: "bookmark-26" },
    { id: "bookmark-27", title: "bookmark-27" }, { id: "bookmark-28", title: "bookmark-28" },
  ] },
  { id: "collection-3", items: [
    { id: "bookmark-35", title: "bookmark-35" }, { id: "bookmark-36", title: "bookmark-36" },
    { id: "bookmark-37", title: "bookmark-37" }, { id: "bookmark-38", title: "bookmark-38" },
  ] },
];

function customCollisionDetectionAlgorithm(args: any) {
  // First, let's see if there are any collisions with the pointer
  const pointerCollisions = pointerWithin(args);
  
  // Collision detection algorithms return an array of collisions
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  
  // If there are no collisions with the pointer, return rectangle intersections
  return rectIntersection(args);
};

export default function DndPage() {
  const containerMap = useMemo(() => initialContainers.reduce((acc, container) => {
    acc[container.id] = container.items;
    return acc;
  }, {} as Record<string, typeof initialContainers[number]['items']>), []);
  const [items, setItems] = useState(containerMap);
  const [containerIds, setContainerIds] = useState<string[]>(useMemo(() => Object.keys(containerMap), [containerMap]));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeContainerId, setActiveContainerId] = useState<string | null>(null);
  const [isDraggingContainer, setIsDraggingContainer] = useState(false);

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const activeData = active.data.current;
    setActiveId(active.id as string);

    if (activeData?.type === "container") {
      // Dragging a whole container
      setActiveContainerId(null);
      setIsDraggingContainer(true);
    } else {
      // Dragging an item — track its original container
      setActiveContainerId(findContainer(active.id as string) || null);
      setIsDraggingContainer(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);  // ← Reset overlay
      setActiveContainerId(null);
      setIsDraggingContainer(false);
      return;
    }
    debugger

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;
    const activeData = active.data.current;
    const overData = over.data.current;

    // Case 1: Dragging a CONTAINER
    if (activeData?.type === "container") {
      if (overData?.type === "container") {
        setContainerIds((prev: string[]) => {
          const oldIndex = prev.findIndex((id) => id === activeIdStr);
          const newIndex = prev.findIndex((id) => id === overIdStr);
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
    } 
    // Case 2: Dragging an ITEM
    else {
      const activeContainerId = findContainer(activeIdStr);
      const overContainerId = findContainer(overIdStr) || overIdStr;  // For empty drops

      if (!activeContainerId) return;

      if (activeContainerId === overContainerId) {
        // Reorder in same container
        setItems((prev) => ({
          ...prev,
          [activeContainerId]: arrayMove(prev[activeContainerId], prev[activeContainerId].findIndex((item) => item.id === activeIdStr), prev[activeContainerId].findIndex((item) => item.id === overIdStr))
        }));
      } else {
        // Move to new container
        setItems((prev) => ({
          ...prev,
          [activeContainerId]: prev[activeContainerId].filter((item) => item.id !== activeIdStr),
          [overContainerId]: [...prev[overContainerId], ...prev[activeContainerId].filter((item) => item.id === activeIdStr)],
        }));
      }
    }

    setActiveId(null);  // ← Reset overlay
    setActiveContainerId(null);
    setIsDraggingContainer(false);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    console.log(event)
    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    if (activeData?.type === "container") {
      return;
    }

    const overData = over.data.current;
    if (overData?.type === "container") {
      // over on a container, so we need to move the active item to the over container
      const activeContainerId = findContainer(active.id as string);
      if (!activeContainerId) return;
      if (activeContainerId === over.id) return;
      setItems((prev) => ({
        ...prev,
        [over.id]: [...prev[over.id], ...prev[activeContainerId].filter((item) => item.id === active.id)],
        [activeContainerId]: prev[activeContainerId].filter((item) => item.id !== active.id),
      }));
      return;
    }

    const activeContainerId = findContainer(active.id as string);
    const overContainerId = findContainer(over.id as string);
    if (!activeContainerId || !overContainerId) return;
    if (activeContainerId === overContainerId) return;

    console.log({
      event,
      activeContainerId,
      overContainerId,
    })

    // over item index in it's container
    const overIndex = items[overContainerId].findIndex((item) => item.id === over.id);

    setItems((prev) => {
      return {
        ...prev,
        [activeContainerId]: prev[activeContainerId].filter((item) => item.id !== active.id),
        [overContainerId]: [
          ...prev[overContainerId].slice(0, overIndex),
          ...prev[activeContainerId].filter((item) => item.id === active.id),
          ...prev[overContainerId].slice(overIndex),
        ],
      }
    })
  }

  function findContainer(itemId: string) {
    return Object.keys(items).find((containerId) =>
      items[containerId].some((item) => item.id === itemId)
    );
  }

  // Custom modifier to restrict vertical movement
  const restrictToVertical = (args: any) => {
    const { transform } = args;
    return {
      ...transform,
      x: 0,
    };
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetection={customCollisionDetectionAlgorithm}
    >
      <h1>DnD Page</h1>
      <SortableContext
        items={containerIds}
        strategy={verticalListSortingStrategy}
      >
        {containerIds.map((containerId) => (
          <SortableItem
            key={containerId}
            id={containerId}
            data={{ type: "container", id: containerId }}
            restrictDirection="vertical"
          >
            <h2>{containerId}</h2>
            <SimpleGrid cols={3}>
              <SortableContainer
                items={items[containerId]}
                renderItem={(item) => (
                  <Item id={item.id} title={item.title} />
                )}
              />
            </SimpleGrid>
          </SortableItem>
        ))}
      </SortableContext>
      <DragOverlay modifiers={isDraggingContainer ? [restrictToVertical] : undefined}>
        {activeId ? (
          <Item id={activeId} title={activeId} />
        ) : activeContainerId ? (
          <BookmarkContainer id={activeContainerId} name={activeContainerId} items={items[activeContainerId] || []} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}