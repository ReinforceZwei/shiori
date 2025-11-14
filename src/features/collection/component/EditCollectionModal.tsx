import { Box } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import CollectionForm, { CollectionFormValues } from './CollectionForm';
import { useUpdateCollectionMutation, UpdateCollectionInput } from '../query';

const EditCollectionModal = ({ context, id, innerProps }: ContextModalProps<{ collectionId: string; initialValues: CollectionFormValues }>) => {
  const { mutateAsync: updateCollection } = useUpdateCollectionMutation();

  const handleSubmit = async (values: CollectionFormValues) => {
    try {
      const data: UpdateCollectionInput = {
        name: values.name,
        description: values.description || undefined,
        color: values.color || undefined,
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
      <CollectionForm
        onSubmit={handleSubmit}
        initialValues={innerProps.initialValues}
        submitLabel="Save Changes"
      />
    </Box>
  );
};

export default EditCollectionModal;