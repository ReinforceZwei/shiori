import { useState } from 'react';
import { LoadingOverlay, Box } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import { EditBookmarkFormValues } from './EditBookmarkForm';
import { useAllCollectionsQuery } from '@/features/collection/hook';
import EditBookmarkForm from './EditBookmarkForm';
import { updateBookmarkAction } from '@/app/actions/bookmark';

interface EditBookmarkModalProps extends ContextModalProps<{
  bookmarkId: string;
  initialValues: EditBookmarkFormValues;
}> {}

const EditBookmarkModal = ({ context, id, innerProps }: EditBookmarkModalProps) => {
  const { bookmarkId, initialValues } = innerProps;
  const { data: collections, isPending } = useAllCollectionsQuery();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (values: EditBookmarkFormValues) => {
    setIsUpdating(true);
    try {
      const formData: {
        title?: string;
        url?: string;
        description?: string;
        collectionId?: string | null;
        websiteIcon?: { data: string };
      } = {
        title: values.title,
        url: values.url,
      };

      // Update collection if selected, or null to remove
      if (values.collectionId) {
        formData.collectionId = values.collectionId;
      } else if (values.collectionId === '') {
        formData.collectionId = null;
      }

      // Update website icon if provided (backend will validate and detect MIME type)
      if (values.websiteIcon) {
        formData.websiteIcon = {
          data: values.websiteIcon,
        };
      }

      // Update description if provided
      if (values.description !== undefined) {
        formData.description = values.description;
      }

      const result = await updateBookmarkAction(bookmarkId, formData);

      if (result.success) {
        context.closeModal(id);
        notifications.show({
          title: 'Bookmark updated',
          message: 'Your bookmark has been updated successfully.',
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'Cannot update bookmark',
          message: result.error || 'An error occurred while updating the bookmark. Please try again.',
          color: 'red',
          icon: <IconAlertSquareRounded />,
        });
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
      notifications.show({
        title: 'Cannot update bookmark',
        message: 'An error occurred while updating the bookmark. Please try again.',
        color: 'red',
        icon: <IconAlertSquareRounded />,
      });
    } finally {
      setIsUpdating(false);
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