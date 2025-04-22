'use client';
import { LoadingOverlay, Box } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import NewCollectionForm, { NewCollectionFormValues } from '../form/NewCollectionForm';
import { createCollection, getCollections } from '../api';
import { Prisma } from '@/generated/prisma';

type CollectionWithParent = Prisma.CollectionGetPayload<{ include: { parent: true }}>

const NewCollectionModal = ({ context, id, innerProps }: ContextModalProps) => {
  const { data: collections, refetch, isPending } = useQuery({
    queryKey: ['collections'],
    queryFn: () => getCollections({ parent: true }) as unknown as CollectionWithParent[],
  });
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