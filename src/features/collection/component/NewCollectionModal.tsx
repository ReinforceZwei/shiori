'use client';
import { Box } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import CollectionForm, { CollectionFormValues } from './CollectionForm';
import { useCreateCollectionMutation, CreateCollectionInput } from '../query';

const NewCollectionModal = ({ context, id, innerProps }: ContextModalProps) => {
  const { mutateAsync: createCollection } = useCreateCollectionMutation();
  const handleSubmit = async (values: CollectionFormValues) => {
    try {
      const data: CreateCollectionInput = {
        name: values.name,
        description: values.description || undefined,
        color: values.color || undefined,
      };
      await createCollection(data);
      context.closeModal(id);
    } catch (error) {
      console.error('Error creating collection:', error);
      notifications.show({
        title: 'Cannot create collection',
        message: 'An error occurred while creating the collection. Please try again.',
        color: 'red',
        icon: <IconAlertSquareRounded />,
      });
    }
  };

  return (
    <Box pos="relative">
      <CollectionForm
        onSubmit={handleSubmit}
        submitLabel="Create Collection"
      />
    </Box>
  );
};

export default NewCollectionModal;