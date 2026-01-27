"use client";

import { useMemo } from "react";
import { IconEdit, IconTrash, IconExternalLink, IconCopy, IconWindow, IconPencil } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useTranslations } from "next-intl";
import { ContextMenuItem, useContextMenu } from "@/lib/context-menu";

export interface BookmarkContextMenuOptions {
  /**
   * The bookmark ID
   */
  id: string;
  
  /**
   * The bookmark title
   */
  title: string;
  
  /**
   * The bookmark URL
   */
  url: string;
  
  /**
   * Optional callback when edit is clicked
   */
  onEdit?: () => void;
  
  /**
   * Optional callback when delete is clicked
   */
  onDelete?: () => void;
  
  /**
   * Optional callback when enter edit mode is clicked
   */
  onEnterEditMode?: () => void;
  
  /**
   * Optional callback when exit edit mode is clicked
   */
  onExitEditMode?: () => void;
  
  /**
   * Whether currently in edit mode (to show/hide enter edit mode option)
   */
  editMode?: boolean;
  
  /**
   * Customize which actions to show
   */
  actions?: {
    openInNewTab?: boolean;
    openInNewWindow?: boolean;
    copyLink?: boolean;
    edit?: boolean;
    delete?: boolean;
    enterEditMode?: boolean;
    exitEditMode?: boolean;
  };
}

/**
 * Reusable hook for bookmark context menu across different layouts
 * 
 * @example
 * ```tsx
 * const { getTriggerProps } = useBookmarkContextMenu({
 *   id: bookmark.id,
 *   title: bookmark.title,
 *   url: bookmark.url,
 *   onEdit: () => openEditModal(bookmark),
 *   onDelete: () => deleteBookmark(bookmark.id),
 * });
 * 
 * return <div {...getTriggerProps()}>Bookmark</div>;
 * ```
 */
export function useBookmarkContextMenu(options: BookmarkContextMenuOptions) {
  const t = useTranslations('Bookmark_ContextMenu');
  const {
    url,
    onEdit,
    onDelete,
    onEnterEditMode,
    onExitEditMode,
    editMode = false,
    actions = {
      openInNewTab: true,
      openInNewWindow: true,
      copyLink: true,
      edit: true,
      delete: true,
      enterEditMode: true,
      exitEditMode: true,
    },
  } = options;

  // Memoize handlers to prevent unnecessary re-renders
  const handlers = useMemo(() => {
    const handleOpenInNewTab = () => {
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleOpenInNewWindow = () => {
      window.open(url, '_blank', 'noopener,noreferrer,popup,width=1024,height=768');
    };

    const handleCopyLink = async () => {
      try {
        await navigator.clipboard.writeText(url);
        notifications.show({
          message: t('link_copied'),
          color: 'green',
          autoClose: 1000,
        });
      } catch (error) {
        notifications.show({
          title: t('copy_failed_title'),
          message: t('copy_failed_message'),
          color: 'red',
        });
      }
    };

    const handleEdit = () => {
      onEdit?.();
    };

    const handleDelete = () => {
      onDelete?.();
    };

    const handleEnterEditMode = () => {
      onEnterEditMode?.();
    };

    const handleExitEditMode = () => {
      onExitEditMode?.();
    };

    return {
      handleOpenInNewTab,
      handleOpenInNewWindow,
      handleCopyLink,
      handleEdit,
      handleDelete,
      handleEnterEditMode,
      handleExitEditMode,
    };
  }, [url, onEdit, onDelete, onEnterEditMode, onExitEditMode]);

  // Build menu items based on enabled actions
  const items = useMemo(() => {
    const menuItems: ContextMenuItem[] = [];

    // Edit action (first)
    if (actions.edit) {
      menuItems.push({
        label: t('edit'),
        icon: <IconEdit size={16} />,
        onClick: handlers.handleEdit,
        disabled: !onEdit,
      });
    }

    // Enter edit mode action (only show when not in edit mode)
    if (actions.enterEditMode && !editMode) {
      menuItems.push({
        label: t('enter_edit_mode'),
        icon: <IconPencil size={16} />,
        onClick: handlers.handleEnterEditMode,
        disabled: !onEnterEditMode,
      });
    }

    // Exit edit mode action (only show when in edit mode)
    if (actions.exitEditMode && editMode) {
      menuItems.push({
        label: t('exit_edit_mode'),
        icon: <IconPencil size={16} />,
        onClick: handlers.handleExitEditMode,
        disabled: !onExitEditMode,
      });
    }

    // Copy link action
    if (actions.copyLink) {
      if (menuItems.length > 0) {
        menuItems.push({ type: 'divider' });
      }
      menuItems.push({
        label: t('copy_link'),
        icon: <IconCopy size={16} />,
        onClick: handlers.handleCopyLink,
      });
    }

    // Browser actions group
    if (actions.openInNewTab) {
      if (menuItems.length > 0) {
        menuItems.push({ type: 'divider' });
      }
      menuItems.push({
        label: t('open_in_new_tab'),
        icon: <IconExternalLink size={16} />,
        onClick: handlers.handleOpenInNewTab,
      });
    }

    if (actions.openInNewWindow) {
      menuItems.push({
        label: t('open_in_new_window'),
        icon: <IconWindow size={16} />,
        onClick: handlers.handleOpenInNewWindow,
      });
    }

    // Delete action (last)
    if (actions.delete) {
      if (menuItems.length > 0) {
        menuItems.push({ type: 'divider' });
      }
      menuItems.push({
        label: t('delete'),
        color: 'red',
        icon: <IconTrash size={16} />,
        onClick: handlers.handleDelete,
        disabled: !onDelete,
      });
    }

    return menuItems;
  }, [actions, handlers, onEdit, onDelete, onEnterEditMode, onExitEditMode, editMode, t]);

  // Apply context menu to items
  const { getTriggerProps } = useContextMenu({ items });

  return {
    getTriggerProps,
    items,
    handlers,
  };
}

