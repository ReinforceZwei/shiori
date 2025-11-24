'use client';

import { useState, useCallback, useMemo } from 'react';
import { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type {
  DndItem,
  DndContainer,
  UseDndCallbacks,
  UseDndReturn,
} from './types';

/**
 * Hook for managing multi-container drag and drop
 * 
 * @param initialContainers - Initial state of containers with items
 * @param callbacks - Callbacks for handling DND events
 * @returns DND state and handlers
 */
export function useMultiContainerDnd<T extends DndItem = DndItem>(
  initialContainers: DndContainer<T>[],
  callbacks: UseDndCallbacks<T> = {}
): UseDndReturn<T> {
  const [containers, setContainers] = useState<DndContainer<T>[]>(initialContainers);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'item' | 'container' | null>(null);
  // Track source container where the dragged item originated from
  const [itemSourceContainerId, setItemSourceContainerId] = useState<string | null>(null);
  // Track the container currently being hovered over (drop target)
  const [activeContainerId, setActiveContainerId] = useState<string | null>(null);

  /**
   * Find which container an item belongs to
   */
  const findContainer = useCallback((itemId: string): DndContainer<T> | undefined => {
    return containers.find(container =>
      container.items.some(item => item.id === itemId)
    );
  }, [containers]);

  /**
   * Get the active item being dragged
   */
  const activeItem = useMemo(() => {
    if (!activeId || activeType !== 'item') return null;
    
    for (const container of containers) {
      const item = container.items.find(item => item.id === activeId);
      if (item) return item;
    }
    return null;
  }, [activeId, activeType, containers]);

  /**
   * Get all container IDs
   */
  const containerIds = useMemo(() => {
    return containers.map(container => container.id);
  }, [containers]);

  /**
   * Handle drag start event
   */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;
    
    setActiveId(active.id as string);

    if (activeData?.type === 'container') {
      setActiveType('container');
      setItemSourceContainerId(null);
      setActiveContainerId(null);
    } else {
      setActiveType('item');
      const container = findContainer(active.id as string);
      setItemSourceContainerId(container?.id || null);
      setActiveContainerId(container?.id || null); // Initially hovering over source container
    }
  }, [findContainer]);

  /**
   * Handle drag over event (for cross-container moves)
   */
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) {
      // No longer hovering over anything
      setActiveContainerId(null);
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    // Skip if dragging a container
    if (activeData?.type === 'container') return;

    const activeContainer = findContainer(active.id as string);
    
    // Determine the over container
    let overContainer: DndContainer<T> | undefined;
    if (overData?.type === 'container') {
      // Hovering over a container directly
      overContainer = containers.find(c => c.id === over.id);
    } else {
      // Hovering over an item
      overContainer = findContainer(over.id as string);
    }

    // Update the active container ID for visual feedback
    setActiveContainerId(overContainer?.id || null);

    if (!activeContainer || !overContainer) return;
    if (activeContainer.id === overContainer.id) return;

    // Optimistically move item to new container
    setContainers(prev => {
      const activeContainerData = prev.find(c => c.id === activeContainer.id);
      const overContainerData = prev.find(c => c.id === overContainer.id);
      
      if (!activeContainerData || !overContainerData) return prev;

      const activeItems = activeContainerData.items;
      const overItems = overContainerData.items;
      const activeItem = activeItems.find(item => item.id === active.id);
      
      if (!activeItem) return prev;

      // Find insertion index
      let overIndex: number;
      if (overData?.type === 'container') {
        // Drop on container - add to end
        overIndex = overItems.length;
      } else {
        // Drop on item - insert before it
        overIndex = overItems.findIndex(item => item.id === over.id);
        if (overIndex === -1) overIndex = overItems.length;
      }

      return prev.map(container => {
        if (container.id === activeContainer.id) {
          return {
            ...container,
            items: activeItems.filter(item => item.id !== active.id)
          };
        }
        if (container.id === overContainer.id) {
          const newItems = [...overItems];
          newItems.splice(overIndex, 0, activeItem);
          return {
            ...container,
            items: newItems
          };
        }
        return container;
      });
    });
  }, [containers, findContainer]);

  /**
   * Handle drag end event
   */
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setActiveType(null);
      setItemSourceContainerId(null);
      setActiveContainerId(null);
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    // Case 1: Container reordering
    if (activeData?.type === 'container' && overData?.type === 'container') {
      const oldIndex = containers.findIndex(c => c.id === active.id);
      const newIndex = containers.findIndex(c => c.id === over.id);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return;
      }

      const newOrder = arrayMove(containers, oldIndex, newIndex);
      setContainers(newOrder);

      // Fire callback using containers state value
      callbacks.onContainerReorder?.(oldIndex, newIndex, newOrder);
    }
    // Case 2: Item reordering/moving
    else {
      // Use activeContainerId (tracked at drag start) instead of findContainer
      // This ensures we get the ORIGINAL container, not the optimistically updated one
      const activeContainer = containers.find(c => c.id === itemSourceContainerId);
      
      // Determine the over container
      let overContainer: DndContainer<T> | undefined;
      if (overData?.type === 'container') {
        overContainer = containers.find(c => c.id === over.id);
      } else {
        overContainer = findContainer(over.id as string);
      }

      if (!activeContainer || !overContainer) {
        setActiveId(null);
        setActiveType(null);
        setItemSourceContainerId(null);
        setActiveContainerId(null);
        return;
      }

      // Same container - reorder
      if (activeContainer.id === overContainer.id) {
        const items = activeContainer.items;
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
          setActiveId(null);
          setActiveType(null);
          setItemSourceContainerId(null);
          setActiveContainerId(null);
          return;
        }

        if (oldIndex !== newIndex) {
          const newItems = arrayMove(items, oldIndex, newIndex);
          
          setContainers(prev => prev.map(container =>
            container.id === activeContainer.id
              ? { ...container, items: newItems }
              : container
          ));

          // Call business logic callback
          await callbacks.onItemReorder?.(
            activeContainer.id,
            oldIndex,
            newIndex,
            newItems
          );
        }
      }
      // Different container - move
      else {
        const overItems = overContainer.items;
        let toIndex: number;
        
        if (overData?.type === 'container') {
          // Dropped on container - add to end
          toIndex = overItems.length;
        } else {
          // Dropped on item - insert before it
          toIndex = overItems.findIndex(item => item.id === over.id);
          if (toIndex === -1) toIndex = overItems.length;
        }

        // Find the active item in current containers (it may have moved during dragOver)
        const activeItem = containers.flatMap(c => c.items).find(item => item.id === active.id);
        
        if (activeItem) {
          const newItems = [...(overItems.filter(item => item.id !== active.id))];
          newItems.splice(toIndex, 0, activeItem);

          setContainers(prev => prev.map(container =>
            container.id === overContainer.id
              ? { ...container, items: newItems }
              : container
          ));

          // Call business logic callback
          await callbacks.onItemMove?.(
            active.id as string,
            activeContainer.id,
            overContainer.id,
            toIndex,
            newItems
          );
        }
      }
    }

    setActiveId(null);
    setActiveType(null);
    setItemSourceContainerId(null);
    setActiveContainerId(null);
  }, [containers, itemSourceContainerId, findContainer, callbacks]);

  return {
    dndContextProps: {
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDragEnd: handleDragEnd,
    },
    containers,
    activeId,
    activeType,
    itemSourceContainerId,
    activeContainerId,
    activeItem,
    setContainers,
    findContainer,
    containerIds,
  };
}

