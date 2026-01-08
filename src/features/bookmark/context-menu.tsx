"use client";

import { useMemo } from "react";
import { IconEdit, IconTrash, IconExternalLink, IconCopy, IconWindow } from "@tabler/icons-react";
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
   * Customize which actions to show
   */
  actions?: {
    openInNewTab?: boolean;
    openInNewWindow?: boolean;
    copyLink?: boolean;
    edit?: boolean;
    delete?: boolean;
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
    actions = {
      openInNewTab: true,
      openInNewWindow: true,
      copyLink: true,
      edit: true,
      delete: true,
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

    return {
      handleOpenInNewTab,
      handleOpenInNewWindow,
      handleCopyLink,
      handleEdit,
      handleDelete,
    };
  }, [url, onEdit, onDelete]);

  // Build menu items based on enabled actions
  const items = useMemo(() => {
    const menuItems: ContextMenuItem[] = [];

    // Browser actions group
    const browserActions: ContextMenuItem[] = [];
    
    if (actions.openInNewTab) {
      browserActions.push({
        label: t('open_in_new_tab'),
        icon: <IconExternalLink size={16} />,
        onClick: handlers.handleOpenInNewTab,
      });
    }

    if (actions.openInNewWindow) {
      browserActions.push({
        label: t('open_in_new_window'),
        icon: <IconWindow size={16} />,
        onClick: handlers.handleOpenInNewWindow,
      });
    }

    if (browserActions.length > 0) {
      menuItems.push(...browserActions);
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

    // Edit/Delete actions group
    const editActions: ContextMenuItem[] = [];

    if (actions.edit) {
      editActions.push({
        label: t('edit'),
        icon: <IconEdit size={16} />,
        onClick: handlers.handleEdit,
        disabled: !onEdit,
      });
    }

    if (actions.delete) {
      editActions.push({
        label: t('delete'),
        color: 'red',
        icon: <IconTrash size={16} />,
        onClick: handlers.handleDelete,
        disabled: !onDelete,
      });
    }

    if (editActions.length > 0) {
      if (menuItems.length > 0) {
        menuItems.push({ type: 'divider' });
      }
      menuItems.push(...editActions);
    }

    return menuItems;
  }, [actions, handlers, onEdit, onDelete, t]);

  // Apply context menu to items
  const { getTriggerProps } = useContextMenu({ items });

  return {
    getTriggerProps,
    items,
    handlers,
  };
}

