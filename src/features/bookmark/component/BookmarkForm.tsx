'use client';

import { useEffect, useMemo, useRef, useCallback } from 'react';
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
  ActionIcon,
  Alert,
  Autocomplete,
  ComboboxItem,
  OptionsFilter,
  Textarea,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconRefresh, IconAlertCircle } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import type { Collection } from '@/generated/prisma/browser';
import { useFetchBookmarkMetadataMutation } from '@/features/bookmark/query';
import CollectionSelect from '@/features/collection/component/CollectionSelect';
import IconSelector from './IconSelector';
import { normalizeUrl, isValidUrl } from '../utils';

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
  submitLabel,
  isSubmitting = false,
}: BookmarkFormProps) {
  const t = useTranslations('BookmarkForm');
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
    if (!metadata?.icons) return [];
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata, uniqueTitles, uniqueDescriptions]);

  const handleRefreshMetadata = () => {
    if (form.values.url && isValidUrl(form.values.url)) {
      const normalizedUrl = normalizeUrl(form.values.url);
      fetchMetadata(normalizedUrl);
    }
  };

  // Handler for icon changes (handles both base64 and mimeType)
  const handleIconChange = useCallback((base64: string, mimeType: string) => {
    form.setFieldValue('websiteIcon', base64);
    form.setFieldValue('websiteIconMimeType', mimeType);
  }, [form]);

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
            label={t('url_label')}
            placeholder={t('url_placeholder')}
            required
            {...form.getInputProps('url')}
            data-autofocus="true"
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
            <Alert icon={<IconAlertCircle size={16} />} color="yellow" title={t('metadata_fetch_failed')}>
              {t('metadata_fetch_failed_message')}
            </Alert>
          )}

          {/* Title Autocomplete */}
          <Autocomplete
            label={t('title_label')}
            placeholder={t('title_placeholder')}
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
                      {t('title_source', { source: customOption.source, property: customOption.property })}
                    </Text>
                  )}
                </Box>
              );
            }}
          />

          {/* Icon Selection */}
          <IconSelector
            label={t('icon_label')}
            value={form.values.websiteIcon}
            onChange={handleIconChange}
            error={form.errors.websiteIcon}
            currentUrl={form.values.url}
            metadataIcons={uniqueIcons}
            initialIcon={
              initialValues?.websiteIcon && initialValues?.websiteIconMimeType
                ? {
                    base64: initialValues.websiteIcon,
                    mimeType: initialValues.websiteIconMimeType,
                  }
                : undefined
            }
          />

          {/* Description with Suggestions */}
          <Box>
            <Text size="sm" fw={500} mb="xs">
              {t('description_label')}
            </Text>

            {/* Suggestion chips - only show if we have fetched descriptions */}
            {uniqueDescriptions.length > 0 && (
              <Box mb="xs">
                <Text size="xs" c="dimmed" mb={4}>
                  {t('description_suggestions_label')}
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
                  ? t('description_placeholder_with_suggestions')
                  : t('description_placeholder')
              }
              minRows={3}
              autosize
              {...form.getInputProps('description')}
            />
          </Box>

          {/* Collection Selection */}
          <CollectionSelect
            label={t('collection_label')}
            placeholder={t('collection_placeholder')}
            data={collections}
            {...form.getInputProps('collectionId')}
          />

          {/* Submit Button */}
          <Button type="submit" fullWidth loading={isSubmitting} mt="md">
            {submitLabel || t('submit_default')}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
