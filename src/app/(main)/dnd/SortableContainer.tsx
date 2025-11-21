'use client';

import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableItem } from "./SortableItem";

interface SortableContainerProps<T extends { id: string; }> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}
export function SortableContainer<T extends { id: string; }>({ items, renderItem }: SortableContainerProps<T>) {
  return (
    <SortableContext
      items={items.map(item => item.id)}
      strategy={rectSortingStrategy}
    >
      {items.map(item => (
        <SortableItem key={item.id} id={item.id}>
          {renderItem(item)}
        </SortableItem>
      ))}
    </SortableContext>
  );
}