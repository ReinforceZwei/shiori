import ShioriLogo from '@/assets/icon.png';
import './App.css';
import { useCurrentTab } from '../../hooks';
import {
  Stack,
  Group,
  Image,
  Text,
  Paper,
  Divider,
  Loader,
  Alert,
  Badge,
  Box,
  Center,
  ThemeIcon,
} from '@mantine/core';
import { IconAlertCircle, IconWorld, IconLink, IconPhoto } from '@tabler/icons-react';

function App() {
  const { tab, loading, error } = useCurrentTab();

  return (
    <Box p="md" style={{ minWidth: '400px', maxWidth: '500px' }}>
      <Stack gap="md">
        {/* Header */}
        <Group justify="center" gap="sm">
          <Image src={ShioriLogo} alt="Shiori Chan Logo" w={40} h={40} />
          <Text size="xl" fw={700} c="blue">
            Shiori Chan
          </Text>
        </Group>

        <Divider />

        {/* Content */}
        <Paper shadow="sm" p="md" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Text size="lg" fw={600}>
                Current Tab
              </Text>
              {!loading && !error && tab && (
                <Badge variant="light" color="green" size="sm">
                  Active
                </Badge>
              )}
            </Group>

            {loading && (
              <Center py="xl">
                <Stack align="center" gap="sm">
                  <Loader size="md" />
                  <Text size="sm" c="dimmed">
                    Loading tab information...
                  </Text>
                </Stack>
              </Center>
            )}

            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Error"
                color="red"
                variant="light"
              >
                {error.message}
              </Alert>
            )}

            {tab && !loading && !error && (
              <Stack gap="md">
                {/* Title */}
                <Box>
                  <Group gap="xs" mb={4}>
                    <ThemeIcon size="sm" variant="light" color="blue">
                      <IconWorld size={14} />
                    </ThemeIcon>
                    <Text size="sm" fw={600} c="dimmed">
                      Title
                    </Text>
                  </Group>
                  <Text size="sm" style={{ wordBreak: 'break-word' }}>
                    {tab.title || 'No title'}
                  </Text>
                </Box>

                <Divider variant="dashed" />

                {/* URL */}
                <Box>
                  <Group gap="xs" mb={4}>
                    <ThemeIcon size="sm" variant="light" color="grape">
                      <IconLink size={14} />
                    </ThemeIcon>
                    <Text size="sm" fw={600} c="dimmed">
                      URL
                    </Text>
                  </Group>
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                    }}
                  >
                    {tab.url || 'No URL'}
                  </Text>
                </Box>

                {/* Favicon */}
                {tab.favIconUrl && (
                  <>
                    <Divider variant="dashed" />
                    <Box>
                      <Group gap="xs" mb={8}>
                        <ThemeIcon size="sm" variant="light" color="teal">
                          <IconPhoto size={14} />
                        </ThemeIcon>
                        <Text size="sm" fw={600} c="dimmed">
                          Favicon
                        </Text>
                      </Group>
                      <Paper p="xs" radius="sm" withBorder bg="gray.0">
                        <Group gap="sm">
                          <Image
                            src={tab.favIconUrl}
                            alt="Page favicon"
                            w={32}
                            h={32}
                            fit="contain"
                          />
                          <Text
                            size="xs"
                            c="dimmed"
                            style={{
                              wordBreak: 'break-all',
                              flex: 1,
                              fontFamily: 'monospace',
                            }}
                          >
                            {tab.favIconUrl.startsWith('data:')
                              ? 'Base64 embedded image'
                              : tab.favIconUrl}
                          </Text>
                        </Group>
                      </Paper>
                    </Box>
                  </>
                )}
              </Stack>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default App;
