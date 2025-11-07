import { LoadingOverlay, Box } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import NewBookmarkForm, { NewBookmarkFormValues } from './NewBookmarkForm';
import { useAllCollectionsQuery } from '@/features/collection/hook';
import { useCreateBookmarkMutation, CreateBookmarkInput } from '../query';

const NewBookmarkModal = ({ context, id, innerProps }: ContextModalProps<{ initialValues?: { collectionId?: string }}>) => {
  const { data: collections, isPending } = useAllCollectionsQuery();
  const { mutateAsync: createBookmark, isPending: isCreating } = useCreateBookmarkMutation();

  const handleSubmit = async (values: NewBookmarkFormValues) => {
    try {
      const data: CreateBookmarkInput = {
        title: values.title,
        url: values.url,
      };

      // Add collection if selected
      if (values.collectionId) {
        data.collectionId = values.collectionId;
      }

      // Add website icon if provided (backend will validate and detect MIME type)
      if (values.websiteIcon) {
        data.websiteIcon = {
          data: values.websiteIcon,
        };
      }

      // Add description if provided
      if (values.description) {
        data.description = values.description;
      }

      await createBookmark(data);
      context.closeModal(id);
      notifications.show({
        title: 'Bookmark created',
        message: 'Your bookmark has been created successfully.',
        color: 'green',
      });
    } catch (error) {
      console.error('Error creating bookmark:', error);
      notifications.show({
        title: 'Cannot create bookmark',
        message: 'An error occurred while creating the bookmark. Please try again.',
        color: 'red',
        icon: <IconAlertSquareRounded />,
      });
    }
  };
  
  return (
    <Box pos="relative">
      <LoadingOverlay visible={isPending} />
      <NewBookmarkForm
        onSubmit={handleSubmit}
        collections={collections || []}
        initialValues={innerProps.initialValues}
        isSubmitting={isCreating}
      />
    </Box>
  );
}

export default NewBookmarkModal;