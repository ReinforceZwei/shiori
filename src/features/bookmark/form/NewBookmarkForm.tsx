import { useForm } from '@mantine/form';
import { TextInput, Button, Box, ActionIcon, FileButton, Group, Text, Loader, Select, Flex } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { getWebsiteMetadata } from '@/features/bookmarkMetadata/api';
import { DEFAULT_ICON } from '../constant';
import { IconTrash, IconWorld, IconUpload, IconRotateClockwise } from '@tabler/icons-react';
import CollectionSelect from '@/features/collection/component/CollectionSelect/CollectionSelect';
import { Prisma } from '@/generated/prisma';
import { resizeImage, svgToPng } from '@/lib/utils/image';
import { useState, useEffect, useRef } from 'react';

export interface NewBookmarkFormValues {
  title: string;
  url: string;
  collectionId?: string;
  websiteIcon?: string;
}

interface NewBookmarkFormProps {
  onSubmit: (values: NewBookmarkFormValues) => void;
  collections: Prisma.CollectionGetPayload<{}>[];
  initialValues?: Partial<NewBookmarkFormValues>;
}

export default function NewBookmarkForm({ onSubmit, collections, initialValues }: NewBookmarkFormProps) {
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
  const [imageType, setImageType] = useState('image/png');
  const [protocol, setProtocol] = useState('https://');
  const urlInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<NewBookmarkFormValues>({
    initialValues: {
      title: '',
      url: '',
      collectionId: '',
      websiteIcon: '',
      ...initialValues,
    },    validate: {
      title: (value) => (value ? null : 'Title is required'),
      url: (value) => (value ? null : 'URL is required'),
    },
  });

  useEffect(() => {
    // Focus the URL input when the component mounts
    if (urlInputRef.current) {
      urlInputRef.current.focus();
    }
    setTimeout(() => {
      if (urlInputRef.current) {
        urlInputRef.current.focus();
      }
    }, 1);
  }, []);

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    
    try {
      // Handle SVG files
      if (file.type.includes('svg')) {
        const svgText = await file.text();
        const pngBase64 = await svgToPng(svgText, 256, 256, file.type as any);
        form.setFieldValue('websiteIcon', pngBase64);
        setImageType('image/png');
        return;
      }

      // Handle other image types
      const resizedImage = await resizeImage(file, 256, 256, {
        maintainAspectRatio: true,
        format: 'image/png',
        quality: 0.9
      });

      // Extract base64 data from data URL by removing the prefix
      const base64Data = resizedImage.split(',')[1];
      form.setFieldValue('websiteIcon', base64Data);
      setImageType(file.type);
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
      if (!url.startsWith('http')) {
        url = `http://${url}`;
        form.setFieldValue('url', url);
      }
      const metadata = await getWebsiteMetadata(url);
      console.log(metadata)
      if (metadata.title.length) {
        form.setFieldValue('title', metadata.title[0]);
      }
      if (metadata.icons.length) {
        const icon = metadata.icons[0];
        try {
          // Handle SVG files
          if (icon.type?.includes('svg') && icon.base64) {
            const svgText = atob(icon.base64);
            const pngBase64 = await svgToPng(svgText, 256, 256, icon.type as any);
            form.setFieldValue('websiteIcon', pngBase64);
            setImageType('image/png');
            return;
          }

          // Handle other image types
          const resizedImage = await resizeImage(`data:${icon.type || 'image/png'};base64,${icon.base64}`, 256, 256, {
            maintainAspectRatio: true,
            format: 'image/png',
            quality: 0.9
          });

          // Extract base64 data from data URL by removing the prefix
          const base64Data = resizedImage.split(',')[1];
          form.setFieldValue('websiteIcon', base64Data);
          setImageType('image/png');
        } catch (error) {
          console.error('Error processing image:', error);
        }
        form.setFieldValue('websiteIcon', metadata.icons[0].base64 || '');
        setImageType(metadata.icons[0].type || 'image/png');
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setIsMetadataLoading(false);
    }
  }, 700);
  form.watch('url', ({ value }) => {
    if (value) {
      const urlWithoutProtocol = value.replace(/^https?:\/\//, '');
      const detectedProtocol = value.startsWith('http://') ? 'http://' : 'https://';
      setProtocol(detectedProtocol);
      form.setFieldValue('url', urlWithoutProtocol);
      setIsMetadataLoading(true);
      handleFetchMetadata(detectedProtocol + urlWithoutProtocol);
    }
  });

  return (
    <Box maw={400} mx="auto">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Flex>
          {/* TODO: Protocol select is too ugly. I want something like bootstrap input group */}
          <Select
            data={['https://', 'http://']}
            value={protocol}
            onChange={(value) => {
              if (value) {
                setProtocol(value);
                if (form.values.url) {
                  handleFetchMetadata(value + form.values.url);
                }
              }
            }}
            checkIconPosition="right"
          />
          <TextInput
            label="URL"
            placeholder="Enter bookmark URL"
            ref={urlInputRef}
            {...form.getInputProps('url')}
            required
            value={form.values.url.replace(/^https?:\/\//, '')}
            onChange={(event) => {
              const rawUrl = event.target.value.replace(/^https?:\/\//, '');
              form.setFieldValue('url', rawUrl);
              if (rawUrl) {
                setIsMetadataLoading(true);
                handleFetchMetadata(protocol + rawUrl);
              }
            }}
            rightSection={
              isMetadataLoading ? (
                <Loader size="xs" />
              ) : (
                <ActionIcon variant='transparent' onClick={() => {
                  setIsMetadataLoading(true);
                  handleFetchMetadata(protocol + form.values.url);
                }} disabled={!form.values.url}>
                  <IconRotateClockwise />
                </ActionIcon>
              )
            }
            // leftSection={(
            //   // <Select
            //   //   data={['https://', 'http://']}
            //   //   value={protocol}
            //   //   onChange={(value) => {
            //   //     if (value) {
            //   //       setProtocol(value);
            //   //       if (form.values.url) {
            //   //         handleFetchMetadata(value + form.values.url);
            //   //       }
            //   //     }
            //   //   }}
            //   //   checkIconPosition="right"
            //   // />
            //   <Button variant="filled">{protocol}</Button>
            // )}
            // // leftSectionWidth={120}
            // leftSectionPointerEvents='all'
        />
        </Flex>
        
        <TextInput
          label="Title"
          placeholder="Enter bookmark title"
          {...form.getInputProps('title')}
          required
          leftSection={(
            <ActionIcon variant='transparent' color="gray">
              {form.values.websiteIcon ? (
                <img
                  src={`data:${imageType};base64,${form.values.websiteIcon}`}
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
            <ActionIcon variant='transparent' onClick={() => {form.setFieldValue('title', '');form.setFieldValue('websiteIcon', '');setImageType('image/png')}}>
              <IconTrash />
            </ActionIcon>
          )}
        />          <Group mt="md">
          <FileButton
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/svg,application/svg,application/svg+xml"
            onChange={handleImageUpload}
          >
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