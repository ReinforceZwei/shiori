'use client';

import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
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

export interface NewBookmarkFormValues {
  url: string;
  title: string;
  description?: string;
  websiteIcon?: string;
  websiteIconMimeType?: string;
  collectionId?: string;
}

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
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NewBookmarkFormValues>({
    defaultValues: {
      url: '',
      title: '',
      description: '',
      websiteIcon: '',
      websiteIconMimeType: '',
      collectionId: '',
      ...initialValues,
    },
  });

  const urlValue = watch('url');
  const [debouncedUrl] = useDebouncedValue(urlValue, 700);

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
      if (uniqueTitles.length > 0 && !watch('title')) {
        setValue('title', uniqueTitles[0].value);
      }
      if (uniqueDescriptions.length > 0 && !watch('description')) {
        setValue('description', uniqueDescriptions[0].value);
      }
      if (uniqueIcons.length > 0 && !watch('websiteIcon')) {
        setValue('websiteIcon', uniqueIcons[0].base64);
        setValue('websiteIconMimeType', uniqueIcons[0].mimeType);
      }
    }
  }, [metadata, uniqueTitles, uniqueDescriptions, uniqueIcons, setValue, watch]);

  const handleRefreshMetadata = () => {
    if (urlValue && isValidUrl(urlValue)) {
      const normalizedUrl = normalizeUrl(urlValue);
      fetchMetadata(normalizedUrl);
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
            <Alert icon={<IconAlertCircle size={16} />} color="yellow" title="Metadata fetch failed">
              Could not fetch metadata from URL. You can still enter details manually.
            </Alert>
          )}

          {/* Title Selection */}
          {uniqueTitles.length > 0 && (
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Title is required' }}
              render={({ field }) => (
                <Box>
                  <Text size="sm" fw={500} mb="xs">
                    Title <span style={{ color: 'var(--mantine-color-error)' }}>*</span>
                  </Text>
                  <Radio.Group {...field} error={errors.title?.message}>
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
            />
          )}

          {/* Manual Title Input (when no metadata or as fallback) */}
          {uniqueTitles.length === 0 && (
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
                />
              )}
            />
          )}

          {/* Icon Selection */}
          {uniqueIcons.length > 0 && (
            <Box>
              <Text size="sm" fw={500} mb="xs">
                Icon
              </Text>
              <Controller
                name="websiteIcon"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Group gap="xs">
                    {uniqueIcons.map((icon, index) => (
                      <IconOption
                        key={index}
                        icon={icon}
                        selected={value === icon.base64}
                        onClick={() => {
                          onChange(icon.base64);
                          setValue('websiteIconMimeType', icon.mimeType);
                        }}
                      />
                    ))}
                  </Group>
                )}
              />
            </Box>
          )}

          {/* Description Selection */}
          {uniqueDescriptions.length > 0 && (
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Box>
                  <Text size="sm" fw={500} mb="xs">
                    Description (optional)
                  </Text>
                  <Radio.Group {...field}>
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
            />
          )}

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
