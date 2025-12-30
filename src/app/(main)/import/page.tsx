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
  Checkbox,
} from "@mantine/core";
import { useForm } from "@mantine/form";
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
  const [isImporting, setIsImporting] = useState(false);

  // Initialize form with uncontrolled mode for performance
  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    cascadeUpdates: true,
    initialValues: {
      collections: [],
      fetchMetadata: true,
    },
  });

  // Fetch existing collections
  const { data: existingCollections, isLoading: isLoadingCollections } =
    useAllCollectionsQuery();

  // Watch form to trigger re-render when needed
  form.watch('collections', () => {
    // This callback ensures component re-renders on form changes
  });

  const collections = form.getValues().collections;

  const selectedCount = useMemo(() => {
    const totalBookmarks = collections.reduce(
      (sum, col) => sum + col.selectedBookmarkIds.length,
      0
    );
    const activeCollections = collections.filter((col) => !col.mapping.skip).length;
    
    return {
      bookmarks: totalBookmarks,
      collections: activeCollections,
    };
  }, [collections]);

  // Memoize collection cards to optimize rendering
  const collectionCards = useMemo(() => {
    return collections.map((collection, index) => (
      <CollectionImportCard
        key={collection.id}
        form={form}
        collectionIndex={index}
        collection={collection}
        existingCollections={existingCollections || []}
        isLoadingCollections={isLoadingCollections}
      />
    ));
  }, [collections, form, existingCollections, isLoadingCollections]);

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

      // Build form collections array
      const formCollections: FormCollectionItem[] = [];

      // Add root bookmarks as a collection if any exist
      if (flattened.uncollectedBookmarks.length > 0) {
        formCollections.push({
          id: "__uncollected__",
          name: "Root Bookmarks",
          path: [],
          bookmarks: flattened.uncollectedBookmarks,
          mapping: {
            mode: "uncollected",
            newName: "Root Bookmarks",
            existingId: null,
            skip: false,
          },
          selectedBookmarkIds: flattened.uncollectedBookmarks.map((b) => b.id),
        });
      }

      // Add regular collections - default to creating new collections
      flattened.collections.forEach((collection) => {
        formCollections.push({
          id: collection.id,
          name: collection.name,
          path: collection.path,
          bookmarks: collection.bookmarks,
          mapping: {
            mode: "create",
            newName: collection.name,
            existingId: null,
            skip: false,
          },
          selectedBookmarkIds: collection.bookmarks.map((b) => b.id),
        });
      });

      // Set form values
      form.setValues({ collections: formCollections });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to parse bookmark file"
      );
      console.error("Error parsing bookmark file:", err);
    }
  };

  const validateImport = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const formValues = form.getValues();

    // Count total selected bookmarks
    const totalSelected = formValues.collections.reduce(
      (sum, col) => sum + col.selectedBookmarkIds.length,
      0
    );

    if (totalSelected === 0) {
      errors.push("No bookmarks selected");
    }

    // Validate all collections
    for (const collection of formValues.collections) {
      const mapping = collection.mapping;

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

    return { valid: errors.length === 0, errors };
  };

  const handleImport = async () => {
    const validation = validateImport();

    if (!validation.valid) {
      modals.openConfirmModal({
        title: "Something is missing",
        children: (
          <Text size="sm" component="div">
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

    setIsImporting(true);

    try {
      const formValues = form.getValues();

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

      // Process all collections from form
      for (const formCollection of formValues.collections) {
        // Skip if collection is marked as skipped
        if (formCollection.mapping.skip) continue;

        // Get selected bookmarks for this collection
        const selectedSet = new Set(formCollection.selectedBookmarkIds);
        const selectedCollectionBookmarks = formCollection.bookmarks
          .filter((b) => selectedSet.has(b.id))
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
            mode: formCollection.mapping.mode,
            newName: formCollection.mapping.mode === 'create' ? formCollection.mapping.newName : undefined,
            existingId: formCollection.mapping.mode === 'existing' ? formCollection.mapping.existingId ?? undefined : undefined,
            bookmarks: selectedCollectionBookmarks,
          });
        }
      }

      // Call the server action
      const result = await bulkImportBookmarksAction({ 
        collections,
        fetchMetadata: formValues.fetchMetadata,
      });

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
        confirmProps: { style: { display: "none" } },
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

            <Divider my="sm" />

            <Checkbox
              label="Fetch high quality icon and description"
              description="Visit the link to fetch high quality icon and description. Will take few minutes to process"
              key={form.key('fetchMetadata')}
              {...form.getInputProps('fetchMetadata', { type: 'checkbox' })}
            />
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
                    {collectionCards}
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
