'use client';

import { useEffect, useMemo, useRef } from 'react';
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
  Box,
  Paper,
  Image,
  ActionIcon,
  Alert,
  Autocomplete,
  ComboboxItem,
  OptionsFilter,
  Textarea,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconRefresh, IconAlertCircle } from '@tabler/icons-react';
import type { Collection } from '@/generated/prisma';
import { useFetchBookmarkMetadataMutation } from '@/features/bookmark/query';
import { BookmarkIcon, createIconDataUrl } from '@/app/api/bookmark/metadata/types';
import CollectionSelect from '@/features/collection/component/CollectionSelect';

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
const bookmarkFormSchema = z.object({
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
  collectionId: z.string().optional().nullable(),
});

export type BookmarkFormValues = z.infer<typeof bookmarkFormSchema>;

interface BookmarkFormProps {
  collections: Collection[];
  initialValues?: Partial<BookmarkFormValues>;
  onSubmit: (values: BookmarkFormValues) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export default function BookmarkForm({
  collections,
  initialValues,
  onSubmit,
  submitLabel = 'Create Bookmark',
  isSubmitting = false,
}: BookmarkFormProps) {
  const form = useForm<BookmarkFormValues>({
    initialValues: {
      url: '',
      title: '',
      description: '',
      websiteIcon: '',
      websiteIconMimeType: '',
      collectionId: '',
      ...initialValues,
    },
    validate: zodResolver(bookmarkFormSchema),
  });

  // Track the initial URL to skip auto-fetch on first load
  const initialUrlRef = useRef(initialValues?.url || '');
  const [debouncedUrl] = useDebouncedValue(form.values.url, 700);

  const {
    mutate: fetchMetadata,
    data: metadata,
    isPending: isFetchingMetadata,
    error: metadataError,
  } = useFetchBookmarkMetadataMutation();

  // Auto-fetch metadata when URL changes (but skip initial URL to avoid unnecessary fetch on open)
  useEffect(() => {
    if (debouncedUrl && isValidUrl(debouncedUrl)) {
      const normalizedUrl = normalizeUrl(debouncedUrl);
      const normalizedInitialUrl = initialUrlRef.current ? normalizeUrl(initialUrlRef.current) : '';
      
      // Skip fetch if this is the initial URL (form just opened with existing data)
      if (normalizedUrl === normalizedInitialUrl && initialUrlRef.current) {
        return;
      }
      
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
    const icons: BookmarkIcon[] = [];
    const seen = new Set<string>();
    
    // Add initial icon first if it exists
    if (initialValues?.websiteIcon && initialValues?.websiteIconMimeType) {
      const initialIcon: BookmarkIcon = {
        base64: initialValues.websiteIcon,
        mimeType: initialValues.websiteIconMimeType,
        source: 'default',
        url: '',
        type: 'current',
        sizes: 'unknown',
        metadata: { 
          width: 0, 
          height: 0, 
          format: initialValues.websiteIconMimeType.split('/')[1] || 'unknown',
          size: 0,
        },
      };
      icons.push(initialIcon);
      seen.add(initialValues.websiteIcon);
    }
    
    // Add metadata icons (avoiding duplicates)
    if (metadata?.icons) {
      metadata.icons.forEach((icon) => {
        if (!seen.has(icon.base64)) {
          icons.push(icon);
          seen.add(icon.base64);
        }
      });
    }
    
    return icons;
  }, [metadata, initialValues?.websiteIcon, initialValues?.websiteIconMimeType]);

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

  // Prepare autocomplete data for titles
  const titleAutocompleteData = useMemo(() => {
    return uniqueTitles.map((title) => ({
      value: title.value,
      label: title.value,
      source: title.source,
      property: title.property,
    }));
  }, [uniqueTitles]);

  // Show all options without filtering (since there are typically only a few)
  const optionsFilter: OptionsFilter = ({ options }) => {
    return options;
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

          {/* Title Autocomplete */}
          <Autocomplete
            label="Title"
            placeholder="Select or enter bookmark title"
            required
            data={titleAutocompleteData}
            filter={optionsFilter}
            {...form.getInputProps('title')}
            renderOption={({ option }) => {
              const customOption = option as ComboboxItem & {
                source?: string;
                property?: string;
              };
              const label = typeof option === 'string' ? option : customOption.label;
              return (
                <Box>
                  <Text size="sm">{label}</Text>
                  {customOption.source && customOption.property && (
                    <Text size="xs" c="dimmed">
                      Source: {customOption.source} ({customOption.property})
                    </Text>
                  )}
                </Box>
              );
            }}
          />

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

          {/* Description with Suggestions */}
          <Box>
            <Text size="sm" fw={500} mb="xs">
              Description (optional)
            </Text>

            {/* Suggestion chips - only show if we have fetched descriptions */}
            {uniqueDescriptions.length > 0 && (
              <Box mb="xs">
                <Text size="xs" c="dimmed" mb={4}>
                  Suggestions (click to use):
                </Text>
                <Group gap="xs">
                  {uniqueDescriptions.map((desc, index) => (
                    <Paper
                      key={index}
                      p="xs"
                      withBorder
                      radius="sm"
                      style={{
                        cursor: 'pointer',
                        transition: 'border-color 0.2s',
                      }}
                      onClick={() => form.setFieldValue('description', desc.value)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--mantine-primary-color-6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '';
                      }}
                    >
                      <Text size="xs" lineClamp={1} maw={300}>
                        {desc.value}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {desc.source} ({desc.property})
                      </Text>
                    </Paper>
                  ))}
                </Group>
              </Box>
            )}

            {/* Textarea for custom or edited description */}
            <Textarea
              placeholder={
                uniqueDescriptions.length > 0
                  ? 'Enter description or select from suggestions above'
                  : 'Enter description'
              }
              minRows={3}
              autosize
              {...form.getInputProps('description')}
            />
          </Box>

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
  const hasMetadata = icon.metadata && icon.metadata.width > 0 && icon.metadata.height > 0;
  
  return (
    <Paper
      p="xs"
      withBorder
      radius="sm"
      style={{
        cursor: 'pointer',
        outline: selected ? '2px solid var(--mantine-primary-color-6)' : 'none',
        outlineOffset: '-1px',
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
        {hasMetadata ? `${icon.metadata.width}×${icon.metadata.height}` : 'Current'}
      </Text>
    </Paper>
  );
}
