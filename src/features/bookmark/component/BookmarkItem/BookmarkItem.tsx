"use client";
import styles from "./BookmarkItem.module.css";
import { Prisma } from "@/generated/prisma";
import { Skeleton, Group, ActionIcon, Menu } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { DEFAULT_ICON } from '../../constant';
import { useEffect, useState } from 'react';
import { useDeleteBookmarkMutation } from '../../hook';

interface BookmarkItemProps {
  bookmark: Prisma.BookmarkGetPayload<{}>;
}

export default function BookmarkItem({ bookmark }: BookmarkItemProps) {
  const [iconData, setIconData] = useState<string | null>(null);
  const deleteBookmark = useDeleteBookmarkMutation();

  useEffect(() => {
    // Fetch website icon
    fetch(`/api/bookmark/${bookmark.id}/websiteicon`)
      .then(async (res) => {
        if (res.status === 204) return null; // No icon available
        if (!res.ok) throw new Error('Failed to fetch icon');
        const data = await res.json();
        return data.data;
      })
      .then(data => setIconData(data))
      .catch(error => {
        console.error('Error fetching website icon:', error);
        setIconData(null);
      });
  }, [bookmark.id]);

  const handleEdit = () => {
    modals.openContextModal({
      modal: 'editBookmark',
      title: 'Edit Bookmark',
      innerProps: {
        bookmarkId: bookmark.id,
        initialValues: {
          title: bookmark.title,
          url: bookmark.url,
          collectionId: bookmark.collectionId || undefined,
          websiteIcon: iconData || undefined,
        },
      },
    });
  };

  const handleDelete = () => {
    modals.openConfirmModal({
      title: 'Delete bookmark',
      centered: true,
      children: (
        <span>
          Are you sure you want to delete "{bookmark.title}"? This action cannot be undone.
        </span>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteBookmark.mutateAsync(bookmark.id);
          notifications.show({
            title: 'Bookmark deleted',
            message: 'The bookmark has been deleted successfully.',
            color: 'green',
          });
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to delete the bookmark.',
            color: 'red',
          });
        }
      },
    });
  };

  return (
    <li className={styles.listItem}>
      <Group justify="space-between" gap="sm">
        <Group gap="sm">
          <div className={styles.iconWrapper}>
            <img
              src={iconData ? `data:image/png;base64,${iconData}` : DEFAULT_ICON}
              alt=""
              className={styles.icon}
              width={16}
              height={16}
            />
          </div>
          <span>{bookmark.title}</span>
        </Group>
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" aria-label="More options">
              <IconDots style={{ width: '70%', height: '70%' }} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconEdit size={14} />} onClick={handleEdit}>
              Edit
            </Menu.Item>
            <Menu.Item 
              leftSection={<IconTrash size={14} />} 
              onClick={handleDelete}
              color="red"
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </li>
  );
}

export function BookmarkItemLoading() {
  return (
    <li className={styles.listItem}>
      <Skeleton height={20} width="60%" />
    </li>
  );
}