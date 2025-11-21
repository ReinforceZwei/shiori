'use client';

import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { SimpleGrid, Stack, Text } from "@mantine/core";
import { SortableItem } from "./SortableItem";
import { Item } from "./Item";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface BookmarkContainerProps {
  id: string;
  name: string;
  items: { id: string, title: string }[];
}
export function BookmarkContainer({ id, name,items }: BookmarkContainerProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    transform,
    transition,
  } = useSortable({
    id,
    data: { type: "container", id },
  });
  return (
    <Stack
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        border: "1px solid #ddd",
        margin: "10px",
        padding: "10px",
        backgroundColor: "#f0f0f0",
        opacity: isDragging ? 0.7 : 1,
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      <h2>{name}</h2>
      <SimpleGrid cols={3}>
        <SortableContext
          items={items.map(item => item.id)}
          strategy={rectSortingStrategy}
        >
          {items.map(item => (
            <SortableItem key={item.id} id={item.id}>
              <Item id={item.id} title={item.title} />
            </SortableItem>
          ))}
        </SortableContext>
      </SimpleGrid>
    </Stack>
  );
}