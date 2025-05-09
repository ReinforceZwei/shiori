import { useForm } from '@mantine/form';
import { TextInput, Button, Box, ActionIcon, FileButton, Group, Text, Loader } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { getWebsiteMetadata } from '@/features/bookmarkMetadata/api';
import { DEFAULT_ICON } from '../constant';
import { IconTrash, IconWorld, IconUpload, IconRotateClockwise } from '@tabler/icons-react';
import CollectionSelect from '@/features/collection/component/CollectionSelect/CollectionSelect';
import { Prisma } from '@/generated/prisma';
import { resizeImage } from '@/lib/utils/image';
import { useState } from 'react';

export interface NewBookmarkFormValues {
  title: string;
  url: string;
  collectionId?: string;
  websiteIcon?: string;
}

interface NewBookmarkFormProps {
  onSubmit: (values: NewBookmarkFormValues) => void;
  collections: Prisma.CollectionGetPayload<{}>[];
}

export default function NewBookmarkForm({ onSubmit, collections }: NewBookmarkFormProps) {
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
  const form = useForm<NewBookmarkFormValues>({
    initialValues: {
      title: '',
      url: '',
      collectionId: '',
      websiteIcon: '',
    },

    validate: {
      title: (value) => (value ? null : 'Title is required'),
      url: (value) => (/^https?:\/\/.+/.test(value) ? null : 'Invalid URL'),
    },
  });

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    
    try {
      // Resize image if needed
      const resizedImage = await resizeImage(file, 256, 256, {
        maintainAspectRatio: true,
        format: 'image/png',
        quality: 0.9
      });

      // Extract base64 data from data URL by removing the prefix
      const base64Data = resizedImage.split(',')[1];
      form.setFieldValue('websiteIcon', base64Data);
    } catch (error) {
      console.error('Error processing image:', error);
    }
  };

  const handleFetchMetadata = useDebouncedCallback(async (url: string) => {
    if (!url) {
      setIsMetadataLoading(false);
      return;
    }
    try {
      const metadata = await getWebsiteMetadata(url);
      if (metadata.title.length) {
        form.setFieldValue('title', metadata.title[0]);
      }
      if (metadata.icons.length) {
        form.setFieldValue('websiteIcon', metadata.icons[0].base64 || '');
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setIsMetadataLoading(false);
    }
  }, 700);

  form.watch('url', ({ value }) => {
    if (value) {
      setIsMetadataLoading(true);
      handleFetchMetadata(value);
    }
  });

  return (
    <Box maw={400} mx="auto">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <TextInput
          label="URL"
          placeholder="Enter bookmark URL"
          {...form.getInputProps('url')}
          required
          rightSection={
            isMetadataLoading ? (
              <Loader size="xs" />
            ) : (
              <ActionIcon variant='transparent' onClick={() => {setIsMetadataLoading(true);handleFetchMetadata(form.values.url);}} disabled={!form.values.url}>
                <IconRotateClockwise />
              </ActionIcon>
            )
          }
        />
        
        <TextInput
          label="Title"
          placeholder="Enter bookmark title"
          {...form.getInputProps('title')}
          required
          leftSection={(
            <ActionIcon variant='transparent' color="gray">
              {form.values.websiteIcon ? (
                <img
                  src={form.values.websiteIcon ? `data:image/png;base64,${form.values.websiteIcon}` : DEFAULT_ICON}
                  alt="Website Icon"
                  style={{
                    height: '100%',
                  }}
                />
              ) : (
                <IconWorld />
              )}
            </ActionIcon>
          )}
          rightSection={(
            <ActionIcon variant='transparent' onClick={() => {form.setFieldValue('title', '');form.setFieldValue('websiteIcon', '')}}>
              <IconTrash />
            </ActionIcon>
          )}
        />

        <Group mt="md">
          <FileButton onChange={handleImageUpload} accept="image/png,image/jpeg,image/webp">
            {(props) => (
              <Button leftSection={<IconUpload size={14} />} variant="light" size="xs" {...props}>
                Upload custom icon
              </Button>
            )}
          </FileButton>
          {form.values.websiteIcon && (
            <Text size="xs" c="dimmed">Icon uploaded</Text>
          )}
        </Group>

        <CollectionSelect
          label="Collection"
          placeholder="Select a collection (optional)"
          data={collections}
          {...form.getInputProps('collectionId')}
        />

        <Button type="submit" fullWidth mt="xl" loading={form.submitting}>
          Create Bookmark
        </Button>
      </form>
    </Box>
  );
}