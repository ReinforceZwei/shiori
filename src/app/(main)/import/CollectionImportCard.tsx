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
} from '@mantine/core';
import {
  IconFolder,
  IconFolderPlus,
} from '@tabler/icons-react';
import type { Collection } from '@/generated/prisma/browser';
import CollectionSelect from '@/features/collection/component/CollectionSelect';

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

interface CollectionImportCardProps {
  collection: FlattenedCollection;
  mapping: CollectionMapping;
  existingCollections: Collection[];
  isLoadingCollections: boolean;
  selectedBookmarkIds: Set<string>;
  onMappingChange: (collectionId: string, updates: Partial<CollectionMapping>) => void;
  onBookmarkSelectionChange: (bookmarkId: string, selected: boolean) => void;
}

function getPathString(path: string[]): string {
  return path.length > 0 ? path.join(' > ') : 'Root';
}

export function CollectionImportCard({
  collection,
  mapping,
  existingCollections,
  isLoadingCollections,
  selectedBookmarkIds,
  onMappingChange,
  onBookmarkSelectionChange,
}: CollectionImportCardProps) {
  const selectedCount = collection.bookmarks.filter(b => 
    selectedBookmarkIds.has(b.id)
  ).length;

  const allSelected = selectedCount === collection.bookmarks.length;

  const toggleAll = () => {
    const shouldSelect = !allSelected;
    collection.bookmarks.forEach(bookmark => {
      if (shouldSelect && !selectedBookmarkIds.has(bookmark.id)) {
        onBookmarkSelectionChange(bookmark.id, true);
      } else if (!shouldSelect && selectedBookmarkIds.has(bookmark.id)) {
        onBookmarkSelectionChange(bookmark.id, false);
      }
    });
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
                {collection.bookmarks.length} bookmarks
              </Badge>
              {!mapping.skip && (
                <Badge size="sm" variant="light" color="green">
                  {selectedCount} selected
                </Badge>
              )}
            </Group>
            {collection.path.length > 0 && (
              <Text size="xs" c="dimmed" mt={4}>
                Path: {getPathString(collection.path)}
              </Text>
            )}
          </div>
          <Checkbox
            label="Skip"
            checked={mapping.skip}
            onChange={(e) => 
              onMappingChange(collection.id, { skip: e.currentTarget.checked })
            }
          />
        </Group>

        <Divider />

        {/* Mode Selection - hide when skipped */}
        {!mapping.skip && (
          <SegmentedControl
            value={mapping.mode}
            onChange={(value) => 
              onMappingChange(collection.id, { 
                mode: value as 'create' | 'existing' | 'uncollected',
                existingId: value === 'create' || value === 'uncollected' ? null : mapping.existingId,
              })
            }
            data={[
              { 
                label: 'Create New', 
                value: 'create',
              },
              { 
                label: 'Use Existing', 
                value: 'existing',
              },
              { 
                label: 'Uncollected', 
                value: 'uncollected',
              },
            ]}
            fullWidth
          />
        )}

        {/* Conditional Inputs */}
        {!mapping.skip && (
          <>
            {mapping.mode === 'create' && (
              <TextInput
                label="Collection Name"
                placeholder="Enter collection name"
                value={mapping.newName}
                onChange={(e) => 
                  onMappingChange(collection.id, { 
                    newName: e.target.value 
                  })
                }
                leftSection={<IconFolderPlus size={16} />}
                required
              />
            )}

            {mapping.mode === 'existing' && (
              <CollectionSelect
                label="Select Existing Collection"
                placeholder="Choose a collection"
                data={existingCollections || []}
                value={mapping.existingId || undefined}
                onChange={(value) => 
                  onMappingChange(collection.id, { 
                    existingId: value 
                  })
                }
                required
              />
            )}

            {mapping.mode === 'uncollected' && (
              <Alert color="orange" variant="light">
                <Text size="sm">
                  These bookmarks will be imported without a collection
                </Text>
              </Alert>
            )}

            <Divider />
          </>
        )}

        {/* Bookmarks Section - only show if not skipped */}
        {!mapping.skip && (
          <div>
            <Group justify="space-between" mb="sm">
              <Text size="sm" fw={500}>Bookmarks</Text>
              <Button 
                variant="subtle" 
                size="xs"
                onClick={toggleAll}
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </Button>
            </Group>

            <ScrollArea h={250} type="auto">
              <Stack gap="xs">
                {collection.bookmarks.map((bookmark) => (
                  <Box key={bookmark.id}>
                    <Group gap="sm" wrap="nowrap">
                      <Checkbox
                        checked={selectedBookmarkIds.has(bookmark.id)}
                        onChange={(e) => 
                          onBookmarkSelectionChange(bookmark.id, e.currentTarget.checked)
                        }
                      />
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
        {mapping.skip && (
          <Alert color="gray" variant="light">
            <Text size="sm" c="dimmed">
              This collection and its {collection.bookmarks.length} bookmark{collection.bookmarks.length !== 1 ? 's' : ''} will be skipped
            </Text>
          </Alert>
        )}
      </Stack>
    </Card>
  );
}

