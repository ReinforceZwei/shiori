'use client';

import { useContext, useCallback } from 'react';
import { ContextMenuContext } from './provider';
import type { ContextMenuConfig } from './types';

/**
 * Hook to create a context menu
 * 
 * @example
 * With data passing:
 * ```tsx
 * const { getTriggerProps } = useContextMenu({
 *   items: (bookmark) => [
 *     {
 *       label: `Open ${bookmark.title}`,
 *       icon: <IconExternalLink size={16} />,
 *       onClick: () => window.open(bookmark.url, '_blank'),
 *     },
 *     { type: 'divider' },
 *     {
 *       label: 'Delete',
 *       icon: <IconTrash size={16} />,
 *       onClick: () => handleDelete(bookmark.id),
 *       color: 'red',
 *     },
 *   ],
 * });
 * 
 * <div {...getTriggerProps(bookmark)}>
 *   {bookmark.title}
 * </div>
 * ```
 * 
 * @example
 * Without data:
 * ```tsx
 * const { getTriggerProps } = useContextMenu({
 *   items: [
 *     { label: 'Copy', onClick: () => {} },
 *     { label: 'Paste', onClick: () => {} },
 *   ],
 * });
 * 
 * <div {...getTriggerProps()}>
 *   Right click me
 * </div>
 * ```
 */
export function useContextMenu<T = void>(config: ContextMenuConfig<T>) {
  const context = useContext(ContextMenuContext);

  if (!context) {
    throw new Error('useContextMenu must be used within ContextMenuProvider');
  }

  const { show } = context;

  /**
   * Get props to spread on the trigger element
   * Accepts optional data that will be passed to the items function
   * 
   * Hold Shift key to show browser's default context menu instead
   */
  const getTriggerProps = useCallback(
    (data?: T) => ({
      onContextMenu: (event: React.MouseEvent) => {
        // Allow browser default menu when Shift is held
        if (event.shiftKey) {
          return;
        }
        show(event, config.items, data as T);
      },
    }),
    [show, config.items]
  );

  return {
    getTriggerProps,
  };
}

/**
 * Hook to manually control context menu
 * Useful for programmatic menu opening
 * 
 * @example
 * ```tsx
 * const { showContextMenu, hideContextMenu } = useContextMenuControl();
 * 
 * const handleCustomTrigger = (event: React.MouseEvent, bookmark: Bookmark) => {
 *   showContextMenu(event, [
 *     { label: 'Open', onClick: () => {} },
 *   ], bookmark);
 * };
 * ```
 */
export function useContextMenuControl() {
  const context = useContext(ContextMenuContext);

  if (!context) {
    throw new Error('useContextMenuControl must be used within ContextMenuProvider');
  }

  return {
    showContextMenu: context.show,
    hideContextMenu: context.hide,
  };
}

