"use client";
import { modals } from '@mantine/modals';
import BookmarkList from '@/features/bookmark/component/BookmarkList/BookmarkList';
import { ServerSession } from '@/lib/auth';
import { Box, Title, Text, Button } from '@mantine/core';
import { authClient } from '@/lib/auth-client';

export default function IndexClientComponent() {
  const { data: session } = authClient.useSession();
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
      <Button mt="xl" onClick={() => modals.openContextModal({ modal: 'newCollection', innerProps: {}, title: 'Create Collection' })}>
        Create Collection
      </Button>
    </Box>
  );
}