'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import {
  TextInput,
  Button,
  Stack,
  Group,
  Text,
  Loader,
  Radio,
  Box,
  Paper,
  Image,
  ActionIcon,
  Alert,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconRefresh, IconAlertCircle } from '@tabler/icons-react';
import { Prisma } from '@/generated/prisma';
import { useFetchBookmarkMetadataMutation } from '@/features/bookmark/query';
import { BookmarkIcon, createIconDataUrl } from '@/app/api/bookmark/metadata/types';
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
const newBookmarkFormSchema = z.object({
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

export type NewBookmarkFormValues = z.infer<typeof newBookmarkFormSchema>;

interface NewBookmarkFormProps {
  collections: Prisma.CollectionGetPayload<{}>[];
  initialValues?: Partial<NewBookmarkFormValues>;
  onSubmit: (values: NewBookmarkFormValues) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export default function NewBookmarkForm({
  collections,
  initialValues,
  onSubmit,
  submitLabel = 'Create Bookmark',
  isSubmitting = false,
}: NewBookmarkFormProps) {
  const form = useForm<NewBookmarkFormValues>({
    initialValues: {
      url: '',
      title: '',
      description: '',
      websiteIcon: '',
      websiteIconMimeType: '',
      collectionId: '',
      ...initialValues,
    },
    validate: zodResolver(newBookmarkFormSchema),
  });

  const [debouncedUrl] = useDebouncedValue(form.values.url, 700);

  const {
    mutate: fetchMetadata,
    data: metadata,
    isPending: isFetchingMetadata,
    error: metadataError,
  } = useFetchBookmarkMetadataMutation();

  // Auto-fetch metadata when URL changes
  useEffect(() => {
    if (debouncedUrl && isValidUrl(debouncedUrl)) {
      const normalizedUrl = normalizeUrl(debouncedUrl);
      fetchMetadata(normalizedUrl);
    }
  }, [debouncedUrl, fetchMetadata]);

  // Get unique options for titles, descriptions, and icons
  const uniqueTitles = useMemo(() => {
    if (!metadata?.titles) return [];
    const seen = new Set<string>();
    return metadata.titles.filter((t) => {
      if (seen.has(t.value)) return false;
      seen.add(t.value);
      return true;
    });
  }, [metadata]);

  const uniqueDescriptions = useMemo(() => {
    if (!metadata?.descriptions) return [];
    const seen = new Set<string>();
    return metadata.descriptions.filter((d) => {
      if (seen.has(d.value)) return false;
      seen.add(d.value);
      return true;
    });
  }, [metadata]);

  const uniqueIcons = useMemo(() => {
    if (!metadata?.icons) return [];
    // Remove duplicate icons based on base64 content
    const seen = new Set<string>();
    return metadata.icons.filter((icon) => {
      if (seen.has(icon.base64)) return false;
      seen.add(icon.base64);
      return true;
    });
  }, [metadata]);

  // Auto-select first options when metadata is fetched
  useEffect(() => {
    if (metadata) {
      if (uniqueTitles.length > 0 && !form.values.title) {
        form.setFieldValue('title', uniqueTitles[0].value);
      }
      if (uniqueDescriptions.length > 0 && !form.values.description) {
        form.setFieldValue('description', uniqueDescriptions[0].value);
      }
      if (uniqueIcons.length > 0 && !form.values.websiteIcon) {
        form.setFieldValue('websiteIcon', uniqueIcons[0].base64);
        form.setFieldValue('websiteIconMimeType', uniqueIcons[0].mimeType);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata, uniqueTitles, uniqueDescriptions, uniqueIcons]);

  const handleRefreshMetadata = () => {
    if (form.values.url && isValidUrl(form.values.url)) {
      const normalizedUrl = normalizeUrl(form.values.url);
      fetchMetadata(normalizedUrl);
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
                >
                  <IconRefresh size={16} />
                </ActionIcon>
              )
            }
          />

          {/* Metadata Error */}
          {metadataError && (
            <Alert icon={<IconAlertCircle size={16} />} color="yellow" title="Metadata fetch failed">
              Could not fetch metadata from URL. You can still enter details manually.
            </Alert>
          )}

          {/* Title Selection */}
          {uniqueTitles.length > 0 && (
            <Box>
              <Text size="sm" fw={500} mb="xs">
                Title <span style={{ color: 'var(--mantine-color-error)' }}>*</span>
              </Text>
              <Radio.Group {...form.getInputProps('title')}>
                <Stack gap="xs">
                  {uniqueTitles.map((title, index) => (
                    <Paper key={index} p="xs" withBorder radius="sm">
                      <Radio
                        value={title.value}
                        label={
                          <Box>
                            <Text size="sm">{title.value}</Text>
                            <Text size="xs" c="dimmed">
                              Source: {title.source} ({title.property})
                            </Text>
                          </Box>
                        }
                      />
                    </Paper>
                  ))}
                </Stack>
              </Radio.Group>
            </Box>
          )}

          {/* Manual Title Input (when no metadata or as fallback) */}
          {uniqueTitles.length === 0 && (
            <TextInput
              label="Title"
              placeholder="Enter bookmark title"
              required
              {...form.getInputProps('title')}
            />
          )}

          {/* Icon Selection */}
          {uniqueIcons.length > 0 && (
            <Box>
              <Text size="sm" fw={500} mb="xs">
                Icon
              </Text>
              <Group gap="xs">
                {uniqueIcons.map((icon, index) => (
                  <IconOption
                    key={index}
                    icon={icon}
                    selected={form.values.websiteIcon === icon.base64}
                    onClick={() => {
                      form.setFieldValue('websiteIcon', icon.base64);
                      form.setFieldValue('websiteIconMimeType', icon.mimeType);
                    }}
                  />
                ))}
              </Group>
            </Box>
          )}

          {/* Description Selection */}
          {uniqueDescriptions.length > 0 && (
            <Box>
              <Text size="sm" fw={500} mb="xs">
                Description (optional)
              </Text>
              <Radio.Group {...form.getInputProps('description')}>
                <Stack gap="xs">
                  {uniqueDescriptions.map((desc, index) => (
                    <Paper key={index} p="xs" withBorder radius="sm">
                      <Radio
                        value={desc.value}
                        label={
                          <Box>
                            <Text size="sm" lineClamp={2}>
                              {desc.value}
                            </Text>
                            <Text size="xs" c="dimmed">
                              Source: {desc.source} ({desc.property})
                            </Text>
                          </Box>
                        }
                      />
                    </Paper>
                  ))}
                  <Paper p="xs" withBorder radius="sm">
                    <Radio value="" label="None" />
                  </Paper>
                </Stack>
              </Radio.Group>
            </Box>
          )}

          {/* Collection Selection */}
          <CollectionSelect
            label="Collection"
            placeholder="Select a collection (optional)"
            data={collections}
            {...form.getInputProps('collectionId')}
          />

          {/* Submit Button */}
          <Button type="submit" fullWidth loading={isSubmitting} mt="md">
            {submitLabel}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}

// Helper component for icon selection
interface IconOptionProps {
  icon: BookmarkIcon;
  selected: boolean;
  onClick: () => void;
}

function IconOption({ icon, selected, onClick }: IconOptionProps) {
  return (
    <Paper
      p="xs"
      withBorder
      radius="sm"
      style={{
        cursor: 'pointer',
        borderColor: selected ? 'var(--mantine-color-blue-6)' : undefined,
        borderWidth: selected ? 2 : 1,
      }}
      onClick={onClick}
    >
      <Image
        src={createIconDataUrl(icon)}
        alt="Website icon"
        w={48}
        h={48}
        fit="contain"
      />
      <Text size="xs" c="dimmed" ta="center" mt={4}>
        {icon.metadata.width}×{icon.metadata.height}
      </Text>
    </Paper>
  );
}
