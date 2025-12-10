"use client";

import { useMemo, useState } from "react";
import {
  Container,
  Paper,
  Stack,
  Group,
  Title,
  Text,
  Button,
  FileButton,
  Badge,
  Alert,
  Divider,
  ActionIcon,
  Box,
  LoadingOverlay,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconUpload,
  IconFileImport,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { modals } from "@mantine/modals";
import { parse } from "bookmark-json-converter";
import type {
  BookmarkFile,
  Bookmark as ParsedBookmark,
  Folder,
} from "bookmark-json-converter";
import { useAllCollectionsQuery } from "@/features/collection/query";
import {
  CollectionImportCard,
  type FlattenedBookmark,
  type FlattenedCollection,
  type CollectionMapping,
} from "./CollectionImportCard";
import { ImportFloatingPanel } from "./ImportFloatingPanel";
import { bulkImportBookmarksAction } from "@/app/actions/bulkImport";
import { extractBase64 } from "@/lib/utils/image";

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function flattenBookmarks(bookmarkFile: BookmarkFile): {
  bookmarks: FlattenedBookmark[];
  collections: FlattenedCollection[];
  uncollectedBookmarks: FlattenedBookmark[];
} {
  const bookmarks: FlattenedBookmark[] = [];
  const collections: FlattenedCollection[] = [];
  const uncollectedBookmarks: FlattenedBookmark[] = [];

  function traverse(items: (ParsedBookmark | Folder)[], path: string[] = []) {
    for (const item of items) {
      if ("href" in item) {
        // It's a bookmark at root level
        const bookmark: FlattenedBookmark = {
          id: generateId(),
          title: item.name,
          url: item.href,
          path: [...path],
          addDate: item.addDate,
          icon: item.icon,
        };
        bookmarks.push(bookmark);

        // Track uncollected (root-level) bookmarks
        if (path.length === 0) {
          uncollectedBookmarks.push(bookmark);
        }
      } else {
        // It's a folder/collection
        const currentPath = [...path, item.name];

        // Extract bookmarks directly in this folder
        const folderBookmarks: FlattenedBookmark[] = [];
        const subFolders: Folder[] = [];

        for (const subItem of item.items) {
          if ("href" in subItem) {
            const bookmark: FlattenedBookmark = {
              id: generateId(),
              title: subItem.name,
              url: subItem.href,
              path: currentPath,
              addDate: subItem.addDate,
              icon: subItem.icon,
            };
            folderBookmarks.push(bookmark);
            bookmarks.push(bookmark);
          } else {
            subFolders.push(subItem);
          }
        }

        // Add collection if it has bookmarks
        if (folderBookmarks.length > 0) {
          collections.push({
            id: generateId(),
            name: item.name,
            path: [...path],
            bookmarks: folderBookmarks,
          });
        }

        // Recursively process subfolders
        traverse(subFolders, currentPath);
      }
    }
  }

  traverse(bookmarkFile.items);

  return { bookmarks, collections, uncollectedBookmarks };
}

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<{
    bookmarks: FlattenedBookmark[];
    collections: FlattenedCollection[];
    uncollectedBookmarks: FlattenedBookmark[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookmarks, setSelectedBookmarks] = useState<Set<string>>(
    new Set()
  );
  const [collectionMappings, setCollectionMappings] = useState<
    Record<string, CollectionMapping>
  >({});
  const [isImporting, setIsImporting] = useState(false);

  const selectedCount = useMemo(() => {
    return {
      bookmarks: selectedBookmarks.size,
      collections: Object.values(collectionMappings).filter((m) => !m.skip)
        .length,
    };
  }, [selectedBookmarks, collectionMappings]);

  // Fetch existing collections
  const { data: existingCollections, isLoading: isLoadingCollections } =
    useAllCollectionsQuery();

  const handleFileSelect = async (selectedFile: File | null) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setParsedData(null);

    try {
      const content = await selectedFile.text();
      const parsed: BookmarkFile = parse(content);
      const flattened = flattenBookmarks(parsed);

      setParsedData(flattened);
      // Select all bookmarks by default
      setSelectedBookmarks(new Set(flattened.bookmarks.map((b) => b.id)));

      // Initialize collection mappings
      const initialMappings: Record<string, CollectionMapping> = {};

      // Add root bookmarks as a collection if any exist
      // Default to 'uncollected' mode since they don't have a folder
      if (flattened.uncollectedBookmarks.length > 0) {
        initialMappings["__uncollected__"] = {
          mode: "uncollected",
          newName: "Root Bookmarks",
          existingId: null,
          skip: false,
        };
      }

      // Add regular collections - default to creating new collections
      flattened.collections.forEach((collection) => {
        initialMappings[collection.id] = {
          mode: "create",
          newName: collection.name,
          existingId: null,
          skip: false,
        };
      });

      setCollectionMappings(initialMappings);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to parse bookmark file"
      );
      console.error("Error parsing bookmark file:", err);
    }
  };

  const handleBookmarkSelectionChange = (
    bookmarkId: string,
    selected: boolean
  ) => {
    const newSelected = new Set(selectedBookmarks);
    if (selected) {
      newSelected.add(bookmarkId);
    } else {
      newSelected.delete(bookmarkId);
    }
    setSelectedBookmarks(newSelected);
  };

  const updateCollectionMapping = (
    collectionId: string,
    updates: Partial<CollectionMapping>
  ) => {
    setCollectionMappings((prev) => ({
      ...prev,
      [collectionId]: {
        ...prev[collectionId],
        ...updates,
      },
    }));
  };

  const validateImport = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (selectedBookmarks.size === 0) {
      errors.push("No bookmarks selected");
    }

    if (parsedData) {
      // Validate all collections (including root bookmarks)
      const allCollections = [
        ...(parsedData.uncollectedBookmarks.length > 0
          ? [{ id: "__uncollected__", name: "Root Bookmarks" }]
          : []),
        ...parsedData.collections.map((c) => ({ id: c.id, name: c.name })),
      ];

      for (const collection of allCollections) {
        const mapping = collectionMappings[collection.id];
        if (!mapping) continue;

        // Skip validation for skipped collections
        if (mapping.skip) continue;

        // Skip validation for uncollected mode
        if (mapping.mode === "uncollected") continue;

        if (mapping.mode === "create" && !mapping.newName.trim()) {
          errors.push(`Collection "${collection.name}": Name is required`);
        }

        if (mapping.mode === "existing" && !mapping.existingId) {
          errors.push(
            `Collection "${collection.name}": Please select an existing collection`
          );
        }
      }
    }

    return { valid: errors.length === 0, errors };
  };

  const handleImport = async () => {
    const validation = validateImport();

    if (!validation.valid) {
      modals.openConfirmModal({
        title: "Something is missing",
        children: (
          <Text size="sm">
            Please fix the following errors:
            <ul style={{ marginTop: 8, marginBottom: 0 }}>
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Text>
        ),
        labels: { confirm: "OK", cancel: "" },
        confirmProps: { color: "red" },
        cancelProps: { style: { display: "none" } },
        centered: true,
        onConfirm: () => {},
      });
      return;
    }

    if (!parsedData) return;

    setIsImporting(true);

    try {
      // Build the payload for bulk import
      const collections: Array<{
        mode: 'create' | 'existing' | 'uncollected';
        newName?: string;
        existingId?: string;
        bookmarks: Array<{
          title: string;
          url: string;
          description?: string;
          websiteIcon?: {
            data: string;
            mimeType: string;
          };
        }>;
      }> = [];

      // Helper function to extract MIME type from data URI
      const extractMimeType = (dataUri: string): string => {
        const match = dataUri.match(/^data:([^;]+);base64,/);
        return match ? match[1] : 'image/png'; // Default to image/png if no match
      };

      // Process root bookmarks if they exist and aren't skipped
      if (parsedData.uncollectedBookmarks.length > 0) {
        const rootMapping = collectionMappings["__uncollected__"];
        if (rootMapping && !rootMapping.skip) {
          const selectedRootBookmarks = parsedData.uncollectedBookmarks
            .filter((b) => selectedBookmarks.has(b.id))
            .map((b) => ({
              title: b.title,
              url: b.url,
              description: undefined,
              websiteIcon: b.icon ? {
                data: extractBase64(b.icon),
                mimeType: extractMimeType(b.icon),
              } : undefined,
            }));

          if (selectedRootBookmarks.length > 0) {
            collections.push({
              mode: rootMapping.mode,
              newName: rootMapping.mode === 'create' ? rootMapping.newName : undefined,
              existingId: rootMapping.mode === 'existing' ? rootMapping.existingId ?? undefined : undefined,
              bookmarks: selectedRootBookmarks,
            });
          }
        }
      }

      // Process regular collections
      for (const collection of parsedData.collections) {
        const mapping = collectionMappings[collection.id];
        
        // Skip if collection is marked as skipped
        if (!mapping || mapping.skip) continue;

        const selectedCollectionBookmarks = collection.bookmarks
          .filter((b) => selectedBookmarks.has(b.id))
          .map((b) => ({
            title: b.title,
            url: b.url,
            description: undefined,
            websiteIcon: b.icon ? {
              data: extractBase64(b.icon),
              mimeType: extractMimeType(b.icon),
            } : undefined,
          }));

        if (selectedCollectionBookmarks.length > 0) {
          collections.push({
            mode: mapping.mode,
            newName: mapping.mode === 'create' ? mapping.newName : undefined,
            existingId: mapping.mode === 'existing' ? mapping.existingId ?? undefined : undefined,
            bookmarks: selectedCollectionBookmarks,
          });
        }
      }

      // Call the server action
      const result = await bulkImportBookmarksAction({ collections });

      if (result.success) {
        // Navigate back to home on success
        router.push('/');
      } else {
        // Show error modal on failure
        modals.openConfirmModal({
          title: "Import Failed",
          children: (
            <Text size="sm">
              {result.error || 'An unexpected error occurred during import'}
            </Text>
          ),
          labels: { confirm: "OK", cancel: "" },
          confirmProps: { color: "red" },
          cancelProps: { style: { display: "none" } },
          centered: true,
          onConfirm: () => {},
        });
      }
    } catch (error) {
      console.error('Error during import:', error);
      
      // Show error modal
      modals.openConfirmModal({
        title: "Import Failed",
        children: (
          <Text size="sm">
            {error instanceof Error ? error.message : 'An unexpected error occurred during import'}
          </Text>
        ),
        labels: { confirm: "OK", cancel: "" },
        confirmProps: { color: "red" },
        cancelProps: { style: { display: "none" } },
        centered: true,
        onConfirm: () => {},
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Container size="xl" p={0} pos="relative">
      <LoadingOverlay visible={isImporting} overlayProps={{ blur: 2 }} />
      <Stack gap="lg">
        {/* Header with back button */}
        <Group gap="md">
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={() => router.push("/")}
            aria-label="Back to home"
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={1}>Import Bookmarks</Title>
        </Group>

        <Text c="dimmed" size="sm">
          Import your bookmarks from a browser export file (HTML format).
        </Text>

        <Divider my="sm" />

        {/* File Upload Section */}
        <Paper shadow="xs" p={{ base: "sm", md: "xl" }} radius="md" withBorder>
          <Stack gap="md">
            <Group gap="sm">
              <IconFileImport size={24} />
              <Title order={3}>Select Bookmark File</Title>
            </Group>

            <Text size="sm" c="dimmed">
              Choose an HTML bookmark file exported from your browser.
            </Text>

            <Group>
              <FileButton
                onChange={handleFileSelect}
                accept="text/html,text/htm"
              >
                {(props) => (
                  <Button
                    {...props}
                    leftSection={<IconUpload size={16} />}
                    variant="filled"
                  >
                    Select File
                  </Button>
                )}
              </FileButton>

              {file && (
                <Text size="sm" c="dimmed">
                  Selected: <strong>{file.name}</strong> (
                  {(file.size / 1024).toFixed(2)} KB)
                </Text>
              )}
            </Group>

            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Error"
                color="red"
              >
                {error}
              </Alert>
            )}
          </Stack>
        </Paper>

        {/* Results Section */}
        {parsedData && (
          <>
            {/* Collections Section */}
            {(parsedData.collections.length > 0 ||
              parsedData.uncollectedBookmarks.length > 0) && (
              <Paper
                shadow="xs"
                p={{ base: "sm", md: "xl" }}
                radius="md"
                withBorder
              >
                <Stack gap="md">
                  <Group justify="space-between">
                    <div>
                      <Title order={4}>Collections & Bookmarks</Title>
                      <Text size="sm" c="dimmed" mt="xs">
                        Choose how to handle each collection and select
                        bookmarks to import
                      </Text>
                    </div>
                    <Group gap="md">
                      <Badge size="lg" variant="light" color="blue">
                        {selectedCount.bookmarks} /{" "}
                        {parsedData.bookmarks.length} Bookmarks
                      </Badge>
                      <Badge size="lg" variant="light" color="grape">
                        {selectedCount.collections} Collections
                      </Badge>
                    </Group>
                  </Group>

                  <Group justify="flex-end">
                    <Button onClick={handleImport} leftSection={<IconCheck size={16} />}>Confirm Import</Button>
                  </Group>

                  <Stack gap="md">
                    {/* Root Bookmarks - Show at top if any */}
                    {parsedData.uncollectedBookmarks.length > 0 &&
                      (() => {
                        const rootMapping =
                          collectionMappings["__uncollected__"];
                        if (!rootMapping) return null;

                        const rootCollection: FlattenedCollection = {
                          id: "__uncollected__",
                          name: "Root Bookmarks",
                          path: [],
                          bookmarks: parsedData.uncollectedBookmarks,
                        };

                        return (
                          <CollectionImportCard
                            key="__uncollected__"
                            collection={rootCollection}
                            mapping={rootMapping}
                            existingCollections={existingCollections || []}
                            isLoadingCollections={isLoadingCollections}
                            selectedBookmarkIds={selectedBookmarks}
                            onMappingChange={updateCollectionMapping}
                            onBookmarkSelectionChange={
                              handleBookmarkSelectionChange
                            }
                          />
                        );
                      })()}

                    {/* Regular Collections */}
                    {parsedData.collections.map((collection) => {
                      const mapping = collectionMappings[collection.id];
                      if (!mapping) return null;

                      return (
                        <CollectionImportCard
                          key={collection.id}
                          collection={collection}
                          mapping={mapping}
                          existingCollections={existingCollections || []}
                          isLoadingCollections={isLoadingCollections}
                          selectedBookmarkIds={selectedBookmarks}
                          onMappingChange={updateCollectionMapping}
                          onBookmarkSelectionChange={
                            handleBookmarkSelectionChange
                          }
                        />
                      );
                    })}
                  </Stack>
                </Stack>
              </Paper>
            )}
          </>
        )}
        <ImportFloatingPanel
          show={Boolean(
            parsedData &&
              parsedData.collections.length > 0 &&
              parsedData.uncollectedBookmarks.length > 0
          )}
          onClick={handleImport}
        />
      </Stack>
    </Container>
  );
}
