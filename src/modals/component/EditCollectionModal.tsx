'use client';
import { useState } from 'react';
import { LoadingOverlay, Box } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import CollectionForm, { CollectionFormValues } from '../../features/collection/component/CollectionForm';
import { updateCollectionAction } from '@/app/actions/collection';

const EditCollectionModal = ({ context, id, innerProps }: ContextModalProps<{ collectionId: string; initialValues: CollectionFormValues }>) => {
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
          title: 'Collection updated',
          message: 'Your collection has been updated successfully.',
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'Cannot update collection',
          message: result.error || 'An error occurred while updating the collection. Please try again.',
          color: 'red',
          icon: <IconAlertSquareRounded />,
        });
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      notifications.show({
        title: 'Cannot update collection',
        message: 'An error occurred while updating the collection. Please try again.',
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
        submitLabel="Save Changes"
        isSubmitting={isUpdating}
      />
    </Box>
  );
};

export default EditCollectionModal;