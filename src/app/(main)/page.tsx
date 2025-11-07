import { getBookmarks } from "@/features/bookmark/service";
import { requireUser } from "@/lib/auth";
import { SimpleGrid, Text, Box, Container } from "@mantine/core";
import { BookmarkLauncherItem } from "./BookmarkLauncherItem";

export default async function IndexPage() {
  const user = await requireUser();
  const bookmarks = await getBookmarks({ userId: user.id });

  return (
    <Container size="xl" py="xl">
      <SimpleGrid
        cols={{ base: 3, xs: 4, sm: 5, md: 6, lg: 8, xl: 10 }}
        spacing={{ base: "xl", sm: "xl", md: "xl" }}
        verticalSpacing={{ base: "xl", sm: "xl", md: "xl" }}
      >
        {bookmarks.map((bookmark) => (
          <BookmarkLauncherItem
            key={bookmark.id}
            id={bookmark.id}
            title={bookmark.title}
            url={bookmark.url}
          />
        ))}
      </SimpleGrid>

      {bookmarks.length === 0 && (
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
          }}
        >
          <Text size="lg" c="dimmed">
            No bookmarks yet. Start adding some!
          </Text>
        </Box>
      )}
    </Container>
  );
}