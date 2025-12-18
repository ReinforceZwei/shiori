'use client';

import { useState } from 'react';
import { LoadingOverlay, Box } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import BookmarkForm, { BookmarkFormValues } from '../../features/bookmark/component/BookmarkForm';
import { useAllCollectionsQuery } from '@/features/collection/query';
import { createBookmarkAction } from '@/app/actions/bookmark';

const NewBookmarkModal = ({ context, id, innerProps }: ContextModalProps<{ initialValues?: { collectionId?: string }}>) => {
  const t = useTranslations('NewBookmarkModal');
  const { data: collections, isPending } = useAllCollectionsQuery();
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (values: BookmarkFormValues) => {
    setIsCreating(true);
    try {
      const result = await createBookmarkAction({
        title: values.title,
        url: values.url,
        description: values.description,
        collectionId: values.collectionId ?? undefined,
        websiteIcon: values.websiteIcon ? { data: values.websiteIcon } : undefined,
      });

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
      console.error('Error creating bookmark:', error);
      notifications.show({
        title: t('error_title'),
        message: t('error_message'),
        color: 'red',
        icon: <IconAlertSquareRounded />,
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <Box pos="relative">
      <LoadingOverlay visible={isPending} />
      <BookmarkForm
        onSubmit={handleSubmit}
        collections={collections || []}
        initialValues={innerProps.initialValues}
        isSubmitting={isCreating}
      />
    </Box>
  );
}

export default NewBookmarkModal;