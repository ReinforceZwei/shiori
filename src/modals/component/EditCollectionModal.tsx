'use client';
import { useState } from 'react';
import { LoadingOverlay, Box } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import CollectionForm, { CollectionFormValues } from '../../features/collection/component/CollectionForm';
import { updateCollectionAction } from '@/app/actions/collection';

const EditCollectionModal = ({ context, id, innerProps }: ContextModalProps<{ collectionId: string; initialValues: CollectionFormValues }>) => {
  const t = useTranslations('EditCollectionModal');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (values: CollectionFormValues) => {
    setIsUpdating(true);
    try {
      const result = await updateCollectionAction(innerProps.collectionId, {
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
      console.error('Error updating collection:', error);
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
    <Box pos="relative">
      <LoadingOverlay visible={isUpdating} />
      <CollectionForm
        onSubmit={handleSubmit}
        initialValues={innerProps.initialValues}
        submitLabel={t('submit_label')}
        isSubmitting={isUpdating}
      />
    </Box>
  );
};

export default EditCollectionModal;