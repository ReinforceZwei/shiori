import React, { useState } from 'react';
import {
  Card,
  Stack,
  Group,
  Text,
  Badge,
  SegmentedControl,
  TextInput,
  Checkbox,
  ScrollArea,
  Divider,
  Box,
  Button,
  Alert,
  Avatar,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import {
  IconFolder,
  IconFolderPlus,
  IconWorld,
} from '@tabler/icons-react';
import type { Collection } from '@/generated/prisma/browser';
import CollectionSelect from '@/features/collection/component/CollectionSelect';
import { useTranslations } from 'next-intl';

export interface FlattenedBookmark {
  id: string;
  title: string;
  url: string;
  path: string[];
  addDate?: number;
  icon?: string;
}

export interface FlattenedCollection {
  id: string;
  name: string;
  path: string[];
  bookmarks: FlattenedBookmark[];
}

export interface CollectionMapping {
  mode: 'create' | 'existing' | 'uncollected';
  newName: string;
  existingId: string | null;
  skip: boolean;
}

type FormCollectionItem = {
  id: string;
  name: string;
  path: string[];
  bookmarks: FlattenedBookmark[];
  mapping: CollectionMapping;
  selectedBookmarkIds: string[];
};

type FormValues = {
  collections: FormCollectionItem[];
  fetchMetadata: boolean;
};

interface CollectionImportCardProps {
  form: UseFormReturnType<FormValues>;
  collectionIndex: number;
  collection: FormCollectionItem;
  existingCollections: Collection[];
  isLoadingCollections: boolean;
}

function getPathString(path: string[]): string {
  return path.length > 0 ? path.join(' > ') : 'Root';
}

function CollectionImportCardComponent({
  form,
  collectionIndex,
  collection,
  existingCollections,
  isLoadingCollections,
}: CollectionImportCardProps) {
  const t = useTranslations("Import");
  // Subscribe to this specific collection's changes to trigger re-renders
  const [skip, setSkip] = useState(collection.mapping.skip);
  form.watch(`collections.${collectionIndex}`, ({ value }) => {
    setSkip(value.mapping.skip);
  });

  // Get current values from form
  const formCollection = form.getValues().collections[collectionIndex];
  const mapping = formCollection.mapping;
  const selectedBookmarkIdsSet = new Set(formCollection.selectedBookmarkIds);

  const selectedCount = formCollection.selectedBookmarkIds.length;
  const allSelected = selectedCount === collection.bookmarks.length;

  const toggleAll = () => {
    const shouldSelect = !allSelected;
    const newSelectedIds = shouldSelect
      ? collection.bookmarks.map(b => b.id)
      : [];
    form.setFieldValue(`collections.${collectionIndex}.selectedBookmarkIds`, newSelectedIds);
  };

  const handleBookmarkToggle = (bookmarkId: string, checked: boolean) => {
    const currentIds = formCollection.selectedBookmarkIds;
    const newIds = checked
      ? [...currentIds, bookmarkId]
      : currentIds.filter(id => id !== bookmarkId);
    form.setFieldValue(`collections.${collectionIndex}.selectedBookmarkIds`, newIds);
  };

  return (
    <Card 
      padding="md" 
      withBorder
      style={{ opacity: mapping.skip ? 0.6 : 1 }}
    >
      <Stack gap="md">
        {/* Collection Header with Skip Checkbox */}
        <Group justify="space-between">
          <div style={{ flex: 1 }}>
            <Group gap="xs">
              <IconFolder size={18} />
              <Text fw={500}>{collection.name}</Text>
              <Badge size="sm" variant="light" color="blue">
                {t("card_bookmarks_count", { count: collection.bookmarks.length })}
              </Badge>
              {!mapping.skip && (
                <Badge size="sm" variant="light" color="green">
                  {t("card_selected_count", { count: selectedCount })}
                </Badge>
              )}
            </Group>
            {collection.path.length > 0 && (
              <Text size="xs" c="dimmed" mt={4}>
                {t("card_path_label", { path: getPathString(collection.path) })}
              </Text>
            )}
          </div>
          <Checkbox
            label={t("card_skip_label")}
            {...form.getInputProps(`collections.${collectionIndex}.mapping.skip`, { type: 'checkbox' })}
          />
        </Group>

        <Divider />

        {/* Mode Selection - hide when skipped */}
        {!skip && (
          <SegmentedControl
            {...form.getInputProps(`collections.${collectionIndex}.mapping.mode`)}
            onChange={(value) => {
              form.setFieldValue(`collections.${collectionIndex}.mapping.mode`, value as 'create' | 'existing' | 'uncollected');
              // Clear existingId when switching to create or uncollected mode
              if (value === 'create' || value === 'uncollected') {
                form.setFieldValue(`collections.${collectionIndex}.mapping.existingId`, null);
              }
            }}
            data={[
              { 
                label: t("card_mode_create"), 
                value: 'create',
              },
              { 
                label: t("card_mode_existing"), 
                value: 'existing',
              },
              { 
                label: t("card_mode_uncollected"), 
                value: 'uncollected',
              },
            ]}
            fullWidth
          />
        )}

        {/* Conditional Inputs */}
        {!skip && (
          <>
            {mapping.mode === 'create' && (
              <TextInput
                label={t("card_collection_name_label")}
                placeholder={t("card_collection_name_placeholder")}
                {...form.getInputProps(`collections.${collectionIndex}.mapping.newName`)}
                leftSection={<IconFolderPlus size={16} />}
                required
              />
            )}

            {mapping.mode === 'existing' && (
              <CollectionSelect
                label={t("card_existing_collection_label")}
                placeholder={t("card_existing_collection_placeholder")}
                data={existingCollections || []}
                {...form.getInputProps(`collections.${collectionIndex}.mapping.existingId`)}
                required
              />
            )}

            {mapping.mode === 'uncollected' && (
              <Alert color="orange" variant="light">
                <Text size="sm">
                  {t("card_uncollected_alert")}
                </Text>
              </Alert>
            )}

            <Divider />
          </>
        )}

        {/* Bookmarks Section - only show if not skipped */}
        {!skip && (
          <div>
            <Group justify="space-between" mb="sm">
              <Text size="sm" fw={500}>{t("card_bookmarks_label")}</Text>
              <Button 
                variant="subtle" 
                size="xs"
                onClick={toggleAll}
              >
                {allSelected ? t("card_deselect_all") : t("card_select_all")}
              </Button>
            </Group>

            <ScrollArea h={250} type="auto">
              <Stack gap="xs">
                {collection.bookmarks.map((bookmark) => (
                  <Box key={bookmark.id}>
                    <Group gap="sm" wrap="nowrap">
                      <Checkbox
                        checked={selectedBookmarkIdsSet.has(bookmark.id)}
                        onChange={(e) => 
                          handleBookmarkToggle(bookmark.id, e.currentTarget.checked)
                        }
                      />
                      <Avatar size={32} radius="sm">
                        {bookmark.icon ? (
                          <img 
                            src={bookmark.icon} 
                            alt="" 
                            style={{ 
                              width: '100%', 
                              height: '100%',
                              objectFit: 'contain'
                            }} 
                          />
                        ) : (
                          <Box
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "100%",
                              height: "100%",
                            }}
                          >
                            <IconWorld size={20} opacity={0.3} />
                          </Box>
                        )}
                      </Avatar>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text size="sm" lineClamp={1}>
                          {bookmark.title}
                        </Text>
                        <Text 
                          size="xs" 
                          c="dimmed" 
                          lineClamp={1}
                          style={{ wordBreak: 'break-all' }}
                        >
                          {bookmark.url}
                        </Text>
                      </div>
                    </Group>
                  </Box>
                ))}
              </Stack>
            </ScrollArea>
          </div>
        )}

        {/* Show skip message */}
        {skip && (
          <Alert color="gray" variant="light">
            <Text size="sm" c="dimmed">
              {t("card_skip_message", { count: collection.bookmarks.length })}
            </Text>
          </Alert>
        )}
      </Stack>
    </Card>
  );
}

// Memoize component to prevent unnecessary re-renders
export const CollectionImportCard = React.memo(CollectionImportCardComponent);
