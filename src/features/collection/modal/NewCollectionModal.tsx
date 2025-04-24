'use client';
import { LoadingOverlay, Box } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import NewCollectionForm, { NewCollectionFormValues } from '../form/NewCollectionForm';
import { Prisma } from '@/generated/prisma';
import { useAllCollectionsQuery, useCreateCollectionMutation } from '../hook';

const NewCollectionModal = ({ context, id, innerProps }: ContextModalProps) => {
  const { data: collections, refetch, isPending } = useAllCollectionsQuery();
  const { mutateAsync: createCollection } = useCreateCollectionMutation();
  const handleSubmit = async (values: NewCollectionFormValues) => {
    try {
      const data: Partial<Prisma.CollectionCreateInput> = {
        name: values.name,
        description: values.description || undefined,
      };
      if (values.parentId) {
        data.parent = { connect: { id: values.parentId } };
      }
      await createCollection(data as Prisma.CollectionCreateInput);
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
      <LoadingOverlay visible={isPending} />
      <NewCollectionForm
        onSubmit={handleSubmit}
        collections={collections || []}
      />
    </Box>
  );
};

export default NewCollectionModal;