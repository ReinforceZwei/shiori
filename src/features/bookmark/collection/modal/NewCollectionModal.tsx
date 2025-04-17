import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import NewCollectionForm from '../form/NewCollectionForm';
import { createCollection } from '../api';

const NewCollectionModal = ({ context, id, innerProps }: ContextModalProps) => {
  const handleSubmit = async (values: any) => {
    try {
      await createCollection(values);
    } catch (error) {
      console.error('Error creating collection:', error);
      notifications.show({
        title: 'Cannot create collection',
        message: 'An error occurred while creating the collection. Please try again.',
        color: 'red',
        icon: <IconAlertSquareRounded />,
      });
    }
    context.closeModal(id);
  };

  return (
    <NewCollectionForm
      onSubmit={handleSubmit}
    />
  );
};

export default NewCollectionModal;