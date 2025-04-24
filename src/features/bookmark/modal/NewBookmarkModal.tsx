import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import NewBookmarkForm, { NewBookmarkFormValues } from '../form/NewBookmarkForm';
import { createBookmark } from '../api';
import { Prisma } from '@/generated/prisma';

const NewBookmarkModal = ({ context, id, innerProps }: ContextModalProps) => {
  const handleSubmit = async (values: NewBookmarkFormValues) => {
    try {
      const data: Partial<Prisma.BookmarkCreateInput> = {
        title: values.title,
        url: values.url,
      };
      if (values.collectionId) {
        data.collection = { connect: { id: values.collectionId } };
      }
      await createBookmark(data as Prisma.BookmarkCreateInput);
      context.closeModal(id);
    } catch (error) {
      console.error('Error creating bookmark:', error);
      notifications.show({
        title: 'Cannot create bookmark',
        message: 'An error occurred while creating the bookmark. Please try again.',
        color: 'red',
        icon: <IconAlertSquareRounded />,
      });
    }
  }
  return (
    <NewBookmarkForm
      onSubmit={handleSubmit}
    />
  )
}

export default NewBookmarkModal;