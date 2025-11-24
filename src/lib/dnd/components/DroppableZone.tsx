'use client';

import { useDroppable } from '@dnd-kit/core';
import { CSSProperties, ReactNode } from 'react';

export interface DroppableZoneProps {
  /** Unique identifier for the droppable zone */
  id: string;
  
  /** Additional data to attach to the droppable zone */
  data?: Record<string, any>;
  
  /** Content to render */
  children: ReactNode;
  
  /** Disable dropping */
  disabled?: boolean;
  
  /** Custom styles to apply */
  style?: CSSProperties;
  
  /** Custom styles to apply when something is being dragged over */
  activeStyle?: CSSProperties;
  
  /** Custom class name */
  className?: string;
  
  /** Custom class name when active */
  activeClassName?: string;
}

/**
 * A droppable zone that can accept dragged items
 */
export function DroppableZone({
  id,
  data = {},
  children,
  disabled = false,
  style: customStyle = {},
  activeStyle = {},
  className = '',
  activeClassName = '',
}: DroppableZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data,
    disabled,
  });

  const style: CSSProperties = {
    ...customStyle,
    ...(isOver ? activeStyle : {}),
  };

  const combinedClassName = `${className} ${isOver ? activeClassName : ''}`.trim();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={combinedClassName || undefined}
    >
      {children}
    </div>
  );
}

