import { LoadingOverlay, Box } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import { EditBookmarkFormValues } from '../form/EditBookmarkForm';
import { useUpdateBookmarkMutation } from '../hook';
import { useAllCollectionsQuery } from '@/features/collection/hook';
import EditBookmarkForm from '../form/EditBookmarkForm';

interface EditBookmarkModalProps extends ContextModalProps<{
  bookmarkId: string;
  initialValues: EditBookmarkFormValues;
}> {}

const EditBookmarkModal = ({ context, id, innerProps }: EditBookmarkModalProps) => {
  const { bookmarkId, initialValues } = innerProps;
  const { data: collections, isPending } = useAllCollectionsQuery();
  const { mutateAsync: updateBookmark } = useUpdateBookmarkMutation();

  const handleSubmit = async (values: EditBookmarkFormValues) => {
    try {
      const data: any = {
        title: values.title,
        url: values.url,
      };

      // Update collection connection if selected
      if (values.collectionId) {
        data.collection = { connect: { id: values.collectionId } };
      } else {
        data.collection = { disconnect: true };
      }

      // Update website icon if provided
      if (values.websiteIcon) {
        data.websiteIcon = {
          upsert: {
            create: {
              data: values.websiteIcon
            },
            update: {
              data: values.websiteIcon
            }
          }
        };
      }

      await updateBookmark({ id: bookmarkId, data });
      context.closeModal(id);
      notifications.show({
        title: 'Bookmark updated',
        message: 'Your bookmark has been updated successfully.',
        color: 'green',
      });
    } catch (error) {
      console.error('Error updating bookmark:', error);
      notifications.show({
        title: 'Cannot update bookmark',
        message: 'An error occurred while updating the bookmark. Please try again.',
        color: 'red',
        icon: <IconAlertSquareRounded />,
      });
    }
  };
  
  return (
    <Box pos="relative">
      <LoadingOverlay visible={isPending} />
      <EditBookmarkForm
        onSubmit={handleSubmit}
        collections={collections || []}
        initialValues={initialValues}
        bookmarkId={bookmarkId}
      />
    </Box>
  );
}

export default EditBookmarkModal;