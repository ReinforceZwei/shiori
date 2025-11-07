import { LoadingOverlay, Box } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import { EditBookmarkFormValues } from './EditBookmarkForm';
import { useUpdateBookmarkMutation, UpdateBookmarkInput } from '../query';
import { useAllCollectionsQuery } from '@/features/collection/hook';
import EditBookmarkForm from './EditBookmarkForm';

interface EditBookmarkModalProps extends ContextModalProps<{
  bookmarkId: string;
  initialValues: EditBookmarkFormValues;
}> {}

const EditBookmarkModal = ({ context, id, innerProps }: EditBookmarkModalProps) => {
  const { bookmarkId, initialValues } = innerProps;
  const { data: collections, isPending } = useAllCollectionsQuery();
  const { mutateAsync: updateBookmark, isPending: isUpdating } = useUpdateBookmarkMutation();

  const handleSubmit = async (values: EditBookmarkFormValues) => {
    try {
      const data: UpdateBookmarkInput = {
        title: values.title,
        url: values.url,
      };

      // Update collection if selected, or null to remove
      if (values.collectionId) {
        data.collectionId = values.collectionId;
      } else if (values.collectionId === '') {
        data.collectionId = null;
      }

      // Update website icon if provided (backend will validate and detect MIME type)
      if (values.websiteIcon) {
        data.websiteIcon = {
          data: values.websiteIcon,
        };
      }

      // Update description if provided
      if (values.description !== undefined) {
        data.description = values.description || null;
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
        isSubmitting={isUpdating}
      />
    </Box>
  );
}

export default EditBookmarkModal;