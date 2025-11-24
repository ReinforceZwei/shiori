'use client';

import { SortableContext, SortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { ReactNode } from 'react';
import { SortableItem, SortableItemProps } from './SortableItem';

export interface SortableContainerProps<T extends { id: string }> {
  /** Items to render */
  items: T[];
  
  /** Render function for each item */
  renderItem: (item: T) => ReactNode;
  
  /** Sorting strategy (default: rectSortingStrategy) */
  strategy?: SortingStrategy;
  
  /** Props to pass to each SortableItem wrapper */
  itemProps?: Partial<Omit<SortableItemProps, 'id' | 'children'>>;
}

/**
 * A container that manages sortable items with a custom render function
 */
export function SortableContainer<T extends { id: string }>({
  items,
  renderItem,
  strategy = rectSortingStrategy,
  itemProps = {},
}: SortableContainerProps<T>) {
  return (
    <SortableContext
      items={items.map(item => item.id)}
      strategy={strategy}
    >
      {items.map(item => (
        <SortableItem 
          key={item.id} 
          id={item.id}
          {...itemProps}
        >
          {renderItem(item)}
        </SortableItem>
      ))}
    </SortableContext>
  );
}

