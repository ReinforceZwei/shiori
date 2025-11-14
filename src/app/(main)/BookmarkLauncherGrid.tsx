"use client";

import { SimpleGrid, Box, Text, Switch, Group, Container } from "@mantine/core";
import { BookmarkLauncherItem } from "./BookmarkLauncherItem";
import { AddBookmarkLauncherItem } from "./AddBookmarkLauncherItem";
import { useState } from "react";
import { modals } from "@mantine/modals";

export type DensityMode = "default" | "compact";

interface BookmarkLauncherGridProps {
  bookmarks: Array<{
    id: string;
    title: string;
    url: string;
    description?: string | null;
    collectionId?: string | null;
  }>;
}

const DENSITY_CONFIG = {
  default: {
    size: "medium" as const,
    spacing: "xl" as const,
    cols: { base: 4, xs: 5, sm: 6, md: 7, lg: 9, xl: 11 },
  },
  compact: {
    size: "small" as const,
    spacing: "md" as const,
    cols: { base: 5, xs: 6, sm: 8, md: 10, lg: 12, xl: 15 },
  },
};

export function BookmarkLauncherGrid({ bookmarks }: BookmarkLauncherGridProps) {
  const [density, setDensity] = useState<DensityMode>("default");
  const [editMode, setEditMode] = useState(false);
  const config = DENSITY_CONFIG[density];

  const handleEditBookmark = (bookmark: BookmarkLauncherGridProps['bookmarks'][0]) => {
    modals.openContextModal({
      modal: 'editBookmark',
      title: 'Edit Bookmark',
      innerProps: {
        bookmarkId: bookmark.id,
      },
    });
  };

  if (bookmarks.length === 0) {
    return (
      <Container size="xl" py="xl">
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            gap: "32px",
          }}
        >
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <Text size="xl" fw={600} c="dimmed" ta="center">
              No bookmarks yet
            </Text>
            <Text size="md" c="dimmed" ta="center">
              Start by adding your first bookmark
            </Text>
          </Box>
          <AddBookmarkLauncherItem size={config.size} />
        </Box>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Group justify="flex-end" mb="lg" gap="md">
        <Switch
          label="Edit mode"
          checked={editMode}
          onChange={(event) => setEditMode(event.currentTarget.checked)}
        />
        <Switch
          label="Compact mode"
          checked={density === "compact"}
          onChange={(event) =>
            setDensity(event.currentTarget.checked ? "compact" : "default")
          }
        />
      </Group>

      <SimpleGrid
        cols={config.cols}
        spacing={config.spacing}
        verticalSpacing={config.spacing}
      >
        <AddBookmarkLauncherItem size={config.size} />
        {bookmarks.map((bookmark) => (
          <BookmarkLauncherItem
            key={bookmark.id}
            id={bookmark.id}
            title={bookmark.title}
            url={bookmark.url}
            size={config.size}
            editMode={editMode}
            onEdit={() => handleEditBookmark(bookmark)}
          />
        ))}
      </SimpleGrid>
    </Container>
  );
}

