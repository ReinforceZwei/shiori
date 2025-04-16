import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import NewBookmarkForm from '../form/NewBookmarkForm';
import { createBookmark } from '../../api';

const NewBookmarkModal = ({ context, id, innerProps }: ContextModalProps) => {
  const handleSubmit = async (values: any) => {
    try {
      await createBookmark(values);
    } catch (error) {
      console.error('Error creating bookmark:', error);
      notifications.show({
        title: 'Cannot create bookmark',
        message: 'An error occurred while creating the bookmark. Please try again.',
        color: 'red',
        icon: <IconAlertSquareRounded />,
      });
    }
    context.closeModal(id);
  }
  return (
    <NewBookmarkForm
      onSubmit={handleSubmit}
    />
  )
}

export default NewBookmarkModal;