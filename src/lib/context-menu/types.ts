import { ReactNode } from 'react';

/**
 * Base context menu item types
 */
export type ContextMenuItemBase = {
  type?: 'item';
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color?: string;
  shortcut?: string;
};

export type ContextMenuDivider = {
  type: 'divider';
};

export type ContextMenuLabel = {
  type: 'label';
  label: string;
};

export type ContextMenuItem =
  | ContextMenuItemBase
  | ContextMenuDivider
  | ContextMenuLabel;

/**
 * Context menu configuration
 */
export type ContextMenuConfig<T = void> = {
  /**
   * Menu items - can be static array or function that receives data
   */
  items: T extends void 
    ? ContextMenuItem[] | (() => ContextMenuItem[])
    : ContextMenuItem[] | ((data: T) => ContextMenuItem[]);
  
  /**
   * Optional positioning strategy
   */
  position?: 'cursor' | 'center';
};

/**
 * Internal context menu state
 */
export type ContextMenuState<T = unknown> = {
  position: { x: number; y: number };
  items: ContextMenuItem[];
  data: T;
} | null;

/**
 * Context menu context value
 */
export type ContextMenuContextValue = {
  show: <T>(
    event: React.MouseEvent,
    items: ContextMenuItem[] | ((data: T) => ContextMenuItem[]),
    data: T
  ) => void;
  hide: () => void;
};

