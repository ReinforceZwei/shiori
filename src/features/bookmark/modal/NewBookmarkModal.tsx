import { LoadingOverlay, Box } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconAlertSquareRounded } from '@tabler/icons-react';
import NewBookmarkForm, { NewBookmarkFormValues } from '../form/NewBookmarkForm';
import { Prisma } from '@/generated/prisma';
import { useAllCollectionsQuery } from '@/features/collection/hook';
import { useCreateBookmarkMutation } from '../hook';

const NewBookmarkModal = ({ context, id, innerProps }: ContextModalProps<{ initialValues?: { collectionId?: string }}>) => {
  const { data: collections, isPending } = useAllCollectionsQuery();
  const { mutateAsync: createBookmark } = useCreateBookmarkMutation();

  const handleSubmit = async (values: NewBookmarkFormValues) => {
    try {
      const data: Partial<Prisma.BookmarkCreateInput> = {
        title: values.title,
        url: values.url,
      };

      // Add collection connection if selected
      if (values.collectionId) {
        data.collection = { connect: { id: values.collectionId } };
      }

      // Add website icon if provided
      if (values.websiteIcon) {
        data.websiteIcon = {
          create: {
            data: values.websiteIcon
          }
        };
      }

      await createBookmark(data as Prisma.BookmarkCreateInput);
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
      />
    </Box>
  );
}

export default NewBookmarkModal;