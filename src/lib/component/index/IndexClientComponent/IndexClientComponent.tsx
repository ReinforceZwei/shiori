"use client";
import { modals } from '@mantine/modals';
import BookmarkList from '@/features/bookmark/component/BookmarkList/BookmarkList';
import { Box, Title, Text, Button, Input, TextInput } from '@mantine/core';
import { authClient } from '@/lib/auth-client';
import CollectionTree from '@/features/collection/component/CollectionTree/CollectionTree';
import { useAllCollectionsQuery } from '@/features/collection/hook';
import { useState } from 'react';
import { getWebsiteIcon, getWebsiteMetadata } from '@/features/bookmarkMetadata/api';

export default function IndexClientComponent() {
  const { data: session } = authClient.useSession();
  const { data: collections, refetch, isPending } = useAllCollectionsQuery();
  const [urlInput, setUrlInput] = useState<string>('');
  const [icons, setIcons] = useState<string[]>([]);
  const [title, setTitle] = useState<string[]>([]);
  return (
    <Box maw={600} mx="auto" mt="xl">
      <Title ta="center" order={1} mb="sm">
        Welcome to Shiori, {session?.user.name}!
      </Title>
      <Text ta="center" size="md" c="dimmed">
        Your personal knowledge management tool.
      </Text>
      <TextInput value={urlInput} onChange={(e) => setUrlInput(e.currentTarget.value)} placeholder="Enter URL" label="URL" mt="xl" />
      <Button mt="xl" onClick={() => {
        getWebsiteMetadata(urlInput).then((data) => {
          setIcons(data.icons.map(i => i.href));
          setTitle(data.title);
          console.log('Icon URL:', data);
        }).catch((error) => {
          console.error('Error fetching icon:', error);
        });
      }}>Fetch</Button>
      <ul>
        {icons.map((icon, index) => (
          <li key={index}>
            <img src={icon} alt={`Icon ${index}`} style={{ width: '100px', height: '100px' }} />
          </li>
        ))}
      </ul>
      <ul>
        {title.map((t, index) => (
          <li key={index}>
            <Text>{t}</Text>
          </li>
        ))}
      </ul>
      <BookmarkList />
      { collections && collections.length > 0 && (
        <CollectionTree collections={collections} />
      )}
      <Button mt="xl" onClick={() => modals.openContextModal({ modal: 'newBookmark', innerProps: {}, title: 'Create Bookmark' })}>
        Create Bookmark
      </Button>
      <Button mt="xl" onClick={() => modals.openContextModal({ modal: 'newCollection', innerProps: {}, title: 'Create Collection' })}>
        Create Collection
      </Button>
    </Box>
  );
}