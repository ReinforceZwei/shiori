"use client";
import { modals } from '@mantine/modals';
import BookmarkList from '@/features/bookmark/component/BookmarkList';
import { ServerSession } from '@/lib/auth';
import { Box, Title, Text, Button } from '@mantine/core';

export default function IndexClientComponent({ session }: { session: ServerSession }) {
  return (
    <Box maw={600} mx="auto" mt="xl">
      <Title ta="center" order={1} mb="sm">
        Welcome to Shiori, {session?.user.name}!
      </Title>
      <Text ta="center" size="md" c="dimmed">
        Your personal knowledge management tool.
      </Text>
      <BookmarkList />
      <Button mt="xl" onClick={() => modals.openContextModal({ modal: 'newBookmark', innerProps: {}, title: 'Create Bookmark' })}>
        Create Bookmark
      </Button>
    </Box>
  );
}