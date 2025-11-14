import { Box } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import EditCollectionForm, { EditCollectionFormValues } from '../form/EditCollectionForm';
import { Prisma } from '@/generated/prisma';
import { useUpdateCollectionMutation } from '../hook';

const EditCollectionModal = ({ context, id, innerProps }: ContextModalProps<{ collectionId: string; initialValues: EditCollectionFormValues }>) => {
  const { mutateAsync: updateCollection } = useUpdateCollectionMutation();

  const handleSubmit = async (values: EditCollectionFormValues) => {
    try {
      const data: Partial<Prisma.CollectionUpdateInput> = {
        name: values.name,
        description: values.description || undefined,
      };
      await updateCollection({ id: innerProps.collectionId, data });
      context.closeModal(id);
    } catch (error) {
      console.error('Error updating collection:', error);
      notifications.show({
        title: 'Cannot update collection',
        message: 'An error occurred while updating the collection. Please try again.',
        color: 'red',
        icon: <IconAlertSquareRounded />,
      });
    }
  };

  return (
    <Box pos="relative">
      <EditCollectionForm
        onSubmit={handleSubmit}
        initialValues={innerProps.initialValues}
      />
    </Box>
  );
};

export default EditCollectionModal;