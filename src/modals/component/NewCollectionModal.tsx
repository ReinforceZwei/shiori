'use client';
import { useState } from 'react';
import { LoadingOverlay, Box } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import CollectionForm, { CollectionFormValues } from '../../features/collection/component/CollectionForm';
import { createCollectionAction } from '@/app/actions/collection';

const NewCollectionModal = ({ context, id, innerProps }: ContextModalProps) => {
  const t = useTranslations('NewCollectionModal');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (values: CollectionFormValues) => {
    setIsCreating(true);
    try {
      const result = await createCollectionAction({
        name: values.name,
        description: values.description || undefined,
        color: values.color || undefined,
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
      console.error('Error creating collection:', error);
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
      <LoadingOverlay visible={isCreating} />
      <CollectionForm
        onSubmit={handleSubmit}
        submitLabel={t('submit_label')}
        isSubmitting={isCreating}
      />
    </Box>
  );
};

export default NewCollectionModal;