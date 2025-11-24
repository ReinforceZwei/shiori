import { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';

/**
 * Generic item that can be dragged
 */
export interface DndItem {
  id: string;
  [key: string]: any;
}

/**
 * Container that holds draggable items
 */
export interface DndContainer<T extends DndItem = DndItem> {
  id: string;
  items: T[];
}

/**
 * Data attached to draggable items
 */
export interface DndItemData<T extends DndItem = DndItem> {
  type: 'item';
  containerId: string;
  item: T;
  [key: string]: any;
}

/**
 * Data attached to containers
 */
export interface DndContainerData {
  type: 'container';
  containerId: string;
  [key: string]: any;
}

/**
 * Callbacks for handling DND events
 */
export interface UseDndCallbacks<T extends DndItem = DndItem> {
  /**
   * Called when items are reordered within the same container
   */
  onItemReorder?: (
    containerId: string,
    oldIndex: number,
    newIndex: number,
    items: T[]
  ) => void | Promise<void>;

  /**
   * Called when an item is moved to a different container
   */
  onItemMove?: (
    itemId: string,
    fromContainerId: string,
    toContainerId: string,
    toIndex: number,
    items: T[]
  ) => void | Promise<void>;

  /**
   * Called when containers are reordered
   */
  onContainerReorder?: (
    oldIndex: number,
    newIndex: number,
    containers: DndContainer<T>[]
  ) => void | Promise<void>;
}

/**
 * Props to spread into DndContext
 */
export interface DndContextProps {
  /** DragStart handler */
  onDragStart: (event: DragStartEvent) => void;
  
  /** DragOver handler */
  onDragOver: (event: DragOverEvent) => void;
  
  /** DragEnd handler */
  onDragEnd: (event: DragEndEvent) => void;
}

/**
 * Return type for the DND hook
 */
export interface UseDndReturn<T extends DndItem = DndItem> {
  /** Props to spread into DndContext - use as <DndContext {...dndContextProps}> */
  dndContextProps: DndContextProps;
  
  /** Current state of containers and items */
  containers: DndContainer<T>[];
  
  /** ID of the currently active (dragging) item or container */
  activeId: string | null;
  
  /** Type of the active element */
  activeType: 'item' | 'container' | null;
  
  /** The source container ID where the dragged item originated from */
  itemSourceContainerId: string | null;
  
  /** The container ID that is currently being hovered over (drop target) */
  activeContainerId: string | null;
  
  /** The active item being dragged */
  activeItem: T | null;
  
  /** Manually update containers (e.g., after server sync) */
  setContainers: React.Dispatch<React.SetStateAction<DndContainer<T>[]>>;
  
  /** Find which container an item belongs to */
  findContainer: (itemId: string) => DndContainer<T> | undefined;
  
  /** Get all container IDs */
  containerIds: string[];
}

