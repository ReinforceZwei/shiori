'use client';

import { useState } from 'react';
import { LoadingOverlay, Box } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import BookmarkForm, { BookmarkFormValues } from '@/features/bookmark/component/BookmarkForm';
import { useAllCollectionsQuery } from '@/features/collection/query';
import { useBookmarkQuery } from '@/features/bookmark/query';
import { updateBookmarkAction } from '@/app/actions/bookmark';

interface EditBookmarkModalProps extends ContextModalProps<{
  bookmarkId: string;
}> {}

const EditBookmarkModal = ({ context, id, innerProps }: EditBookmarkModalProps) => {
  const t = useTranslations('EditBookmarkModal');
  const { bookmarkId } = innerProps;
  const { data: collections, isPending: isLoadingCollections } = useAllCollectionsQuery();
  const { data: bookmark, isPending: isLoadingBookmark } = useBookmarkQuery({ id: bookmarkId });
  const [isUpdating, setIsUpdating] = useState(false);
  
  const isLoading = isLoadingCollections || isLoadingBookmark;

  const handleSubmit = async (values: BookmarkFormValues) => {
    setIsUpdating(true);
    try {
      const formData: {
        title?: string;
        url?: string;
        description?: string;
        collectionId?: string | null;
        websiteIcon?: { data: string };
      } = {
        title: values.title,
        url: values.url,
      };

      // Update collection if selected, or null to remove
      if (values.collectionId) {
        formData.collectionId = values.collectionId;
      } else {
        formData.collectionId = null;
      }

      // Update website icon if provided (backend will validate and detect MIME type)
      if (values.websiteIcon) {
        formData.websiteIcon = {
          data: values.websiteIcon,
        };
      }

      // Update description if provided
      if (values.description !== undefined) {
        formData.description = values.description;
      }

      const result = await updateBookmarkAction(bookmarkId, formData);

      if (result.success) {
        context.closeModal(id);
        notifications.show({
          title: t('success_title'),
          message: t('success_message'),
          color: 'green',
        });
      } else {
        notifications.show({
          title: t('error_title'),
          message: result.error || t('error_message'),
          color: 'red',
          icon: <IconAlertSquareRounded />,
        });
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
      notifications.show({
        title: t('error_title'),
        message: t('error_message'),
        color: 'red',
        icon: <IconAlertSquareRounded />,
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Box pos="relative" mih={400}>
      <LoadingOverlay visible={isLoading} />
        {bookmark && (
          <BookmarkForm
            onSubmit={handleSubmit}
            collections={collections || []}
            initialValues={{
              url: bookmark.url,
              title: bookmark.title,
              description: bookmark.description || '',
              websiteIcon: bookmark.websiteIcon || '',
              websiteIconMimeType: bookmark.websiteIconMimeType || '',
              collectionId: bookmark.collectionId || '',
            }}
            submitLabel={t('submit_label')}
            isSubmitting={isUpdating}
          />
        )}
    </Box>
  );
}

export default EditBookmarkModal;