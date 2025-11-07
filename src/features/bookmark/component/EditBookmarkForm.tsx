'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TextInput,
  Button,
  Stack,
  Box,
  ActionIcon,
  Loader,
  Alert,
  Group,
  Image,
} from '@mantine/core';
import { IconRefresh, IconAlertCircle, IconWorld } from '@tabler/icons-react';
import { Prisma } from '@/generated/prisma';
import { useFetchBookmarkMetadataMutation } from '@/features/bookmark/query';
import { selectBestIcon, createIconDataUrl } from '@/app/api/bookmark/metadata/types';
import CollectionSelect from '@/features/collection/component/CollectionSelect/CollectionSelect';

export interface EditBookmarkFormValues {
  url: string;
  title: string;
  description?: string;
  websiteIcon?: string;
  websiteIconMimeType?: string;
  collectionId?: string;
}

interface EditBookmarkFormProps {
  collections: Prisma.CollectionGetPayload<{}>[];
  initialValues: EditBookmarkFormValues;
  onSubmit: (values: EditBookmarkFormValues) => void;
  isSubmitting?: boolean;
}

export default function EditBookmarkForm({
  collections,
  initialValues,
  onSubmit,
  isSubmitting = false,
}: EditBookmarkFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditBookmarkFormValues>({
    defaultValues: initialValues,
  });

  const urlValue = watch('url');
  const currentIcon = watch('websiteIcon');
  const currentIconMimeType = watch('websiteIconMimeType');

  const {
    mutate: fetchMetadata,
    isPending: isFetchingMetadata,
    error: metadataError,
  } = useFetchBookmarkMetadataMutation();

  const handleRefreshMetadata = () => {
    if (urlValue && isValidUrl(urlValue)) {
      const normalizedUrl = normalizeUrl(urlValue);
      fetchMetadata(normalizedUrl, {
        onSuccess: (data) => {
          // Auto-populate with best options
          if (data.title) {
            setValue('title', data.title);
          }
          
          const bestIcon = selectBestIcon(data.icons);
          if (bestIcon) {
            setValue('websiteIcon', bestIcon.base64);
            setValue('websiteIconMimeType', bestIcon.mimeType);
          }

          if (data.descriptions && data.descriptions.length > 0) {
            setValue('description', data.descriptions[0].value);
          }
        },
      });
    }
  };

  return (
    <Box maw={600} mx="auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          {/* URL Input */}
          <Controller
            name="url"
            control={control}
            rules={{
              required: 'URL is required',
              validate: (value) => isValidUrl(value) || 'Please enter a valid URL',
            }}
            render={({ field }) => (
              <TextInput
                {...field}
                label="URL"
                placeholder="https://example.com"
                error={errors.url?.message}
                required
                rightSection={
                  isFetchingMetadata ? (
                    <Loader size="xs" />
                  ) : (
                    <ActionIcon
                      variant="subtle"
                      onClick={handleRefreshMetadata}
                      disabled={!urlValue || !isValidUrl(urlValue)}
                      title="Refresh metadata from URL"
                    >
                      <IconRefresh size={16} />
                    </ActionIcon>
                  )
                }
              />
            )}
          />

          {/* Metadata Error */}
          {metadataError && (
            <Alert icon={<IconAlertCircle size={16} />} color="yellow" title="Metadata refresh failed">
              Could not fetch updated metadata from URL.
            </Alert>
          )}

          {/* Title Input */}
          <Controller
            name="title"
            control={control}
            rules={{ required: 'Title is required' }}
            render={({ field }) => (
              <TextInput
                {...field}
                label="Title"
                placeholder="Enter bookmark title"
                error={errors.title?.message}
                required
                leftSection={
                  currentIcon ? (
                    <Image
                      src={createIconDataUrl({
                        base64: currentIcon,
                        mimeType: currentIconMimeType || 'image/png',
                      } as any)}
                      alt="Website icon"
                      w={16}
                      h={16}
                      fit="contain"
                    />
                  ) : (
                    <IconWorld size={16} />
                  )
                }
              />
            )}
          />

          {/* Description Input */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                label="Description"
                placeholder="Enter bookmark description (optional)"
              />
            )}
          />

          {/* Collection Selection */}
          <Controller
            name="collectionId"
            control={control}
            render={({ field }) => (
              <CollectionSelect
                {...field}
                label="Collection"
                placeholder="Select a collection (optional)"
                data={collections}
              />
            )}
          />

          {/* Submit Button */}
          <Group justify="space-between" mt="md">
            <Button
              variant="light"
              onClick={handleRefreshMetadata}
              loading={isFetchingMetadata}
              disabled={!urlValue || !isValidUrl(urlValue)}
            >
              Refresh Metadata
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}

// Validation helper
function isValidUrl(url: string): boolean {
  try {
    const normalized = normalizeUrl(url);
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}

// URL normalization helper
function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}
