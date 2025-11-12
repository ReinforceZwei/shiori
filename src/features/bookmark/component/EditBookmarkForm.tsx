'use client';

import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
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

// Helper functions
function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function isValidUrl(url: string): boolean {
  try {
    const normalized = normalizeUrl(url);
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}

// Zod schema for form validation
const editBookmarkFormSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .refine(
      (value) => {
        try {
          const normalized = normalizeUrl(value);
          new URL(normalized);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Please enter a valid URL' }
    ),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  websiteIcon: z.string().optional(),
  websiteIconMimeType: z.string().optional(),
  collectionId: z.string().optional(),
});

export type EditBookmarkFormValues = z.infer<typeof editBookmarkFormSchema>;

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
  const form = useForm<EditBookmarkFormValues>({
    initialValues: initialValues,
    validate: zodResolver(editBookmarkFormSchema),
  });

  const {
    mutate: fetchMetadata,
    isPending: isFetchingMetadata,
    error: metadataError,
  } = useFetchBookmarkMetadataMutation();

  const handleRefreshMetadata = () => {
    if (form.values.url && isValidUrl(form.values.url)) {
      const normalizedUrl = normalizeUrl(form.values.url);
      fetchMetadata(normalizedUrl, {
        onSuccess: (data) => {
          // Auto-populate with best options
          if (data.title) {
            form.setFieldValue('title', data.title);
          }
          
          const bestIcon = selectBestIcon(data.icons);
          if (bestIcon) {
            form.setFieldValue('websiteIcon', bestIcon.base64);
            form.setFieldValue('websiteIconMimeType', bestIcon.mimeType);
          }

          if (data.descriptions && data.descriptions.length > 0) {
            form.setFieldValue('description', data.descriptions[0].value);
          }
        },
      });
    }
  };

  return (
    <Box maw={600} mx="auto">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          {/* URL Input */}
          <TextInput
            label="URL"
            placeholder="https://example.com"
            required
            {...form.getInputProps('url')}
            rightSection={
              isFetchingMetadata ? (
                <Loader size="xs" />
              ) : (
                <ActionIcon
                  variant="subtle"
                  onClick={handleRefreshMetadata}
                  disabled={!form.values.url || !isValidUrl(form.values.url)}
                  title="Refresh metadata from URL"
                >
                  <IconRefresh size={16} />
                </ActionIcon>
              )
            }
          />

          {/* Metadata Error */}
          {metadataError && (
            <Alert icon={<IconAlertCircle size={16} />} color="yellow" title="Metadata refresh failed">
              Could not fetch updated metadata from URL.
            </Alert>
          )}

          {/* Title Input */}
          <TextInput
            label="Title"
            placeholder="Enter bookmark title"
            required
            {...form.getInputProps('title')}
            leftSection={
              form.values.websiteIcon ? (
                <Image
                  src={createIconDataUrl({
                    base64: form.values.websiteIcon,
                    mimeType: form.values.websiteIconMimeType || 'image/png',
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

          {/* Description Input */}
          <TextInput
            label="Description"
            placeholder="Enter bookmark description (optional)"
            {...form.getInputProps('description')}
          />

          {/* Collection Selection */}
          <CollectionSelect
            label="Collection"
            placeholder="Select a collection (optional)"
            data={collections}
            {...form.getInputProps('collectionId')}
          />

          {/* Submit Button */}
          <Group justify="space-between" mt="md">
            <Button
              variant="light"
              onClick={handleRefreshMetadata}
              loading={isFetchingMetadata}
              disabled={!form.values.url || !isValidUrl(form.values.url)}
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
