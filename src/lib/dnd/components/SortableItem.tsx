'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Transform } from '@dnd-kit/utilities';
import { CSSProperties, ReactNode } from 'react';

export interface DragHandleProps {
  ref: (node: HTMLElement | null) => void;
  [key: string]: any;
}

export interface SortableItemProps {
  /** Unique identifier for the item */
  id: string;
  
  /** Additional data to attach to the sortable item */
  data?: Record<string, any>;
  
  /** 
   * Content to render:
   * - ReactNode: entire container becomes draggable
   * - Function: receives drag handle props for custom drag handle implementation
   */
  children: ReactNode | ((dragHandleProps: DragHandleProps) => ReactNode);
  
  /** Restrict movement to a specific direction */
  restrictDirection?: 'vertical' | 'horizontal';
  
  /** Disable dragging */
  disabled?: boolean;
  
  /** Custom styles to apply */
  style?: CSSProperties;
  
  /** Custom opacity when dragging (default: 0.5) */
  dragOpacity?: number;
}

/**
 * A sortable item wrapper that can be dragged and reordered.
 * 
 * Pass a function as children to implement a custom drag handle,
 * or pass JSX to make the entire container draggable.
 */
export function SortableItem({
  id,
  data = {},
  children,
  restrictDirection,
  disabled = false,
  style: customStyle = {},
  dragOpacity = 0.5,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
  } = useSortable({ id, data, disabled });

  // Apply directional restriction to the transform
  let restrictedTransform: Transform | null = transform;

  if (transform && restrictDirection) {
    if (restrictDirection === 'vertical') {
      // Only allow vertical movement (y-axis)
      restrictedTransform = {
        ...transform,
        x: 0,
        scaleX: 1,
        scaleY: 1,
      };
    } else if (restrictDirection === 'horizontal') {
      // Only allow horizontal movement (x-axis)
      restrictedTransform = {
        ...transform,
        y: 0,
        scaleX: 1,
        scaleY: 1,
      };
    }
  }

  const style: CSSProperties = {
    transform: CSS.Transform.toString(restrictedTransform),
    transition,
    opacity: isDragging ? dragOpacity : 1,
    ...customStyle,
  };

  // If children is a function, pass drag handle props for custom handle implementation
  if (typeof children === 'function') {
    const dragHandleProps: DragHandleProps = {
      ref: setActivatorNodeRef,
      ...listeners,
    };
    
    return (
      <div ref={disabled ? null : setNodeRef} style={style} {...attributes}>
        {children(dragHandleProps)}
      </div>
    );
  }

  // Otherwise render children with drag listeners on entire container
  return (
    <div 
      ref={disabled ? null : setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
    >
      {children as ReactNode}
    </div>
  );
}

