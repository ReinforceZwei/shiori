'use client';
import { useState } from 'react';
import { LoadingOverlay, Box } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import CollectionForm, { CollectionFormValues } from '../../features/collection/component/CollectionForm';
import { createCollectionAction } from '@/app/actions/collection';

const NewCollectionModal = ({ context, id, innerProps }: ContextModalProps) => {
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
          title: 'Collection created',
          message: 'Your collection has been created successfully.',
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'Cannot create collection',
          message: result.error || 'An error occurred while creating the collection. Please try again.',
          color: 'red',
          icon: <IconAlertSquareRounded />,
        });
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      notifications.show({
        title: 'Cannot create collection',
        message: 'An error occurred while creating the collection. Please try again.',
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
        submitLabel="Create Collection"
        isSubmitting={isCreating}
      />
    </Box>
  );
};

export default NewCollectionModal;