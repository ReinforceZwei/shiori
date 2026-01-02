'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TextInput, 
  Stack, 
  Paper, 
  Title, 
  Text, 
  Group, 
  Card, 
  Loader, 
  Alert, 
  ActionIcon,
  Badge,
  Anchor,
  Box,
  Divider,
} from '@mantine/core';
import { IconAlertCircle, IconArrowLeft, IconSearch, IconExternalLink } from '@tabler/icons-react';
import { useSearchQuery } from '@/features/search/query';
import { useDebouncedValue } from '@mantine/hooks';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300);
  const router = useRouter();
  
  const { data, isLoading, error } = useSearchQuery(debouncedQuery);

  return (
    <Stack gap="lg" p="xl" maw={1200} mx="auto">
      <Group gap="md">
        <ActionIcon 
          variant="subtle" 
          size="lg" 
          onClick={() => router.push('/')}
          aria-label="Go back to home"
        >
          <IconArrowLeft size={24} />
        </ActionIcon>
        <Title order={1}>Search Bookmarks</Title>
      </Group>
      
      <Paper shadow="sm" p="lg" withBorder>
        <TextInput
          leftSection={<IconSearch size={16} />}
          label="Search Query"
          placeholder="Enter search terms (e.g., github, react, tutorial)"
          description="Search across bookmark titles, URLs, and descriptions using PostgreSQL full-text search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="md"
        />
      </Paper>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {error.message}
        </Alert>
      )}

      {isLoading && searchQuery && (
        <Paper shadow="sm" p="xl" withBorder>
          <Group justify="center">
            <Loader size="md" />
            <Text size="md">Searching...</Text>
          </Group>
        </Paper>
      )}

      {data && searchQuery && (
        <Paper shadow="sm" p="lg" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3}>Search Results</Title>
            <Badge size="lg" variant="light">
              {data.length} {data.length === 1 ? 'result' : 'results'} found
            </Badge>
          </Group>

          {data.length === 0 ? (
            <Box py="xl">
              <Text size="lg" c="dimmed" ta="center">
                No bookmarks found matching &quot;{searchQuery}&quot;
              </Text>
              <Text size="sm" c="dimmed" ta="center" mt="xs">
                Try different search terms or check your spelling
              </Text>
            </Box>
          ) : (
            <Stack gap="md">
              {data.map((bookmark, index) => (
                <Card key={bookmark.id} shadow="xs" padding="lg" withBorder>
                  <Stack gap="sm">
                    {/* Title */}
                    <Group justify="space-between" align="flex-start">
                      <Box style={{ flex: 1 }}>
                        <Text fw={600} size="lg">
                          {bookmark.title}
                        </Text>
                      </Box>
                      <Badge variant="light" color="blue">
                        #{index + 1}
                      </Badge>
                    </Group>

                    {/* URL */}
                    <Anchor 
                      href={bookmark.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      c="dimmed"
                      size="sm"
                    >
                      <Group gap="xs">
                        <Text lineClamp={1}>{bookmark.url}</Text>
                        <IconExternalLink size={14} />
                      </Group>
                    </Anchor>

                    {/* Description */}
                    {bookmark.description && (
                      <>
                        <Divider />
                        <Text size="sm" c="dimmed">
                          {bookmark.description}
                        </Text>
                      </>
                    )}

                    {/* Metadata */}
                    <Group gap="xs" mt="xs">
                      {bookmark.collectionId && (
                        <Badge size="sm" variant="dot" color="grape">
                          In Collection
                        </Badge>
                      )}
                      <Badge size="sm" variant="outline" color="gray">
                        ID: {bookmark.id.substring(0, 8)}...
                      </Badge>
                      {bookmark.createdAt && (
                        <Badge size="sm" variant="outline" color="gray">
                          Created: {new Date(bookmark.createdAt).toLocaleDateString()}
                        </Badge>
                      )}
                    </Group>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Paper>
      )}

      {!searchQuery && (
        <Paper shadow="sm" p="xl" withBorder bg="blue.0">
          <Stack gap="md" align="center">
            <IconSearch size={48} stroke={1.5} />
            <Title order={3} ta="center">
              Start Searching
            </Title>
            <Text size="md" c="dimmed" ta="center" maw={600}>
              Enter a search query above to find bookmarks. The search uses PostgreSQL 
              full-text search to look through bookmark titles, URLs, and descriptions.
            </Text>
            <Box>
              <Text size="sm" fw={600} mb="xs">Features:</Text>
              <Stack gap="xs">
                <Group gap="xs">
                  <Badge color="green">✓</Badge>
                  <Text size="sm">Full-text search across all bookmark fields</Text>
                </Group>
                <Group gap="xs">
                  <Badge color="green">✓</Badge>
                  <Text size="sm">Ranked results by relevance</Text>
                </Group>
                <Group gap="xs">
                  <Badge color="green">✓</Badge>
                  <Text size="sm">Returns up to 10 most relevant results</Text>
                </Group>
                <Group gap="xs">
                  <Badge color="green">✓</Badge>
                  <Text size="sm">Debounced search (300ms delay)</Text>
                </Group>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}

