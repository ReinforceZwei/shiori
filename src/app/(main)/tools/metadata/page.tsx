'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextInput, Button, Stack, Paper, Title, Text, Group, Image, Badge, Card, Grid, Loader, Alert, ActionIcon } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconArrowLeft } from '@tabler/icons-react';
import { useFetchBookmarkMetadataMutation } from '@/features/bookmark/query';
import { createIconDataUrl } from '@/app/api/bookmark/metadata/types';

export default function MetadataPage() {
  const [url, setUrl] = useState('');
  const router = useRouter();
  const { mutate, data, isPending, error } = useFetchBookmarkMetadataMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      mutate(url);
    }
  };

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
        <Title order={1}>Bookmark Metadata Tool</Title>
      </Group>
      
      <Paper shadow="sm" p="lg" withBorder>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Website URL"
              placeholder="https://github.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              size="md"
              required
            />
            <Button type="submit" loading={isPending} size="md">
              Fetch Metadata
            </Button>
          </Stack>
        </form>
      </Paper>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {error.message}
        </Alert>
      )}

      {data && (
        <Stack gap="lg">
          {/* Title Section */}
          <Paper shadow="sm" p="lg" withBorder>
            <Group gap="xs" mb="sm">
              <IconCheck size={20} color="green" />
              <Text fw={600} size="lg">Metadata Fetched</Text>
            </Group>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">URL:</Text>
              <Text size="md" fw={500}>{data.url}</Text>
              <Text size="sm" c="dimmed" mt="md">Primary Title:</Text>
              <Text size="lg" fw={600}>{data.title}</Text>
              
              {data.titles && data.titles.length > 0 && (
                <>
                  <Text size="sm" c="dimmed" mt="md">All Titles ({data.titles.length}):</Text>
                  <Stack gap="xs">
                    {data.titles.map((titleObj, index) => (
                      <Card key={index} padding="sm" withBorder>
                        <Text size="md" fw={500}>{titleObj.value}</Text>
                        <Group gap="xs" mt="xs">
                          <Badge size="xs" variant="light" color="blue">
                            {titleObj.source}
                          </Badge>
                          <Text size="xs" c="dimmed">{titleObj.property}</Text>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                </>
              )}
              
              {data.descriptions && data.descriptions.length > 0 && (
                <>
                  <Text size="sm" c="dimmed" mt="md">All Descriptions ({data.descriptions.length}):</Text>
                  <Stack gap="xs">
                    {data.descriptions.map((descObj, index) => (
                      <Card key={index} padding="sm" withBorder>
                        <Text size="sm">{descObj.value}</Text>
                        <Group gap="xs" mt="xs">
                          <Badge size="xs" variant="light" color="green">
                            {descObj.source}
                          </Badge>
                          <Text size="xs" c="dimmed">{descObj.property}</Text>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                </>
              )}
            </Stack>
          </Paper>

          {/* Icons Section */}
          <Paper shadow="sm" p="lg" withBorder>
            <Title order={3} mb="md">Found {data.icons.length} Icon{data.icons.length !== 1 ? 's' : ''}</Title>
            <Grid>
              {data.icons.map((icon, index) => (
                <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card shadow="xs" padding="lg" withBorder>
                    <Card.Section withBorder inheritPadding py="xs">
                      <Group justify="space-between">
                        <Text fw={500} size="sm">Icon #{index + 1}</Text>
                        <Badge color="blue" variant="light" size="sm">
                          {icon.source}
                        </Badge>
                      </Group>
                    </Card.Section>

                    <Stack gap="sm" mt="md">
                      {/* Icon Preview */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        minHeight: '120px',
                        backgroundColor: 'var(--mantine-color-gray-0)',
                        borderRadius: 'var(--mantine-radius-sm)',
                        padding: '1rem'
                      }}>
                        <Image
                          src={createIconDataUrl(icon)}
                          alt={`Icon ${index + 1}`}
                          fit="contain"
                          h={100}
                          w={100}
                        />
                      </div>

                      {/* Icon Details */}
                      <Stack gap={4}>
                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">Type:</Text>
                          <Text size="xs" fw={500}>{icon.type}</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">Sizes:</Text>
                          <Text size="xs" fw={500}>{icon.sizes || 'N/A'}</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">MIME Type:</Text>
                          <Text size="xs" fw={500}>{icon.mimeType}</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">Dimensions:</Text>
                          <Text size="xs" fw={500}>
                            {icon.metadata.width} × {icon.metadata.height}
                          </Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">Format:</Text>
                          <Text size="xs" fw={500}>{icon.metadata.format}</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">Size:</Text>
                          <Text size="xs" fw={500}>
                            {(icon.metadata.size / 1024).toFixed(2)} KB
                          </Text>
                        </Group>
                      </Stack>

                      {/* Original URL */}
                      <Text 
                        size="xs" 
                        c="dimmed" 
                        lineClamp={2}
                        style={{ wordBreak: 'break-all' }}
                      >
                        {icon.url}
                      </Text>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Paper>

          {/* Raw JSON Response */}
          <Paper shadow="sm" p="lg" withBorder>
            <Title order={4} mb="md">Raw JSON Response</Title>
            <pre style={{ 
              backgroundColor: 'var(--mantine-color-gray-0)',
              padding: '1rem',
              borderRadius: 'var(--mantine-radius-sm)',
              overflow: 'auto',
              fontSize: '0.875rem'
            }}>
              {JSON.stringify({
                url: data.url,
                title: data.title,
                titles: data.titles,
                descriptions: data.descriptions,
                icons: data.icons.map(icon => ({
                  ...icon,
                  base64: `${icon.base64.substring(0, 50)}... (truncated)`
                }))
              }, null, 2)}
            </pre>
          </Paper>
        </Stack>
      )}

      {isPending && (
        <Paper shadow="sm" p="xl" withBorder>
          <Group justify="center">
            <Loader size="lg" />
            <Text size="lg">Fetching metadata...</Text>
          </Group>
        </Paper>
      )}
    </Stack>
  );
}