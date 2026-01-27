import ShioriLogo from '@/assets/icon.png';
import './App.css';
import { useExtensionSettings, useShioriApi } from '../../hooks';
import { useState } from 'react';
import {
  Container,
  Paper,
  Stack,
  Group,
  Image,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Alert,
  Loader,
  Center,
  Text,
  Divider,
  List,
  ThemeIcon,
  Box,
} from '@mantine/core';
import {
  IconCheck,
  IconAlertCircle,
  IconWorld,
  IconKey,
  IconDeviceFloppy,
  IconTrash,
  IconInfoCircle,
} from '@tabler/icons-react';

function App() {
  const {
    settings,
    updateSetting,
    save,
    clear,
    loading,
    saving,
    saved,
    error,
  } = useExtensionSettings();
  
  const { testConnection } = useShioriApi();
  
  const [testError, setTestError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestError(null); // Clear any previous test errors
    
    // Test the connection before saving using the hook
    const result = await testConnection(
      settings.instanceUrl,
      settings.apiKey
    );
    
    if (!result.success) {
      setTestError(result.error || 'Connection test failed');
      return;
    }
    
    // Connection successful, now save the settings
    const saveSuccess = await save();
    if (saveSuccess) {
      setTestError(null); // Clear any errors on successful save
    }
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear all settings?')) {
      setTestError(null);
      await clear();
    }
  };
  
  const handleSettingChange = <K extends keyof typeof settings>(
    key: K,
    value: string
  ) => {
    setTestError(null); // Clear test error when user makes changes
    updateSetting(key, value);
  };

  if (loading) {
    return (
      <Container size="sm" py="xl">
        <Center style={{ minHeight: '400px' }}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Loading settings...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="center" gap="md">
          <Image src={ShioriLogo} alt="Shiori Chan Logo" w={48} h={48} />
          <Title order={1} c="blue">
            Shiori Chan Settings
          </Title>
        </Group>

        <Divider />

        {/* Main Settings Form */}
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <form onSubmit={handleSave}>
            <Stack gap="lg">
              <Title order={3} size="h4" c="dimmed">
                Connection Settings
              </Title>

              {/* Instance URL */}
              <TextInput
                label="Instance URL"
                placeholder="https://your-shiori-instance.com"
                description="The URL of your self-hosted Shiori Chan instance"
                value={settings.instanceUrl}
                onChange={(e) => handleSettingChange('instanceUrl', e.target.value)}
                leftSection={
                  <ThemeIcon size="sm" variant="light" color="blue">
                    <IconWorld size={16} />
                  </ThemeIcon>
                }
                required
                withAsterisk
                size="md"
              />

              {/* API Key */}
              <PasswordInput
                label="API Key"
                placeholder="Enter your API key"
                description="Your Shiori Chan API key for authentication"
                value={settings.apiKey}
                onChange={(e) => handleSettingChange('apiKey', e.target.value)}
                leftSection={
                  <ThemeIcon size="sm" variant="light" color="grape">
                    <IconKey size={16} />
                  </ThemeIcon>
                }
                required
                withAsterisk
                size="md"
              />

              {/* Action Buttons */}
              <Group justify="flex-start" mt="md">
                <Button
                  type="submit"
                  leftSection={<IconDeviceFloppy size={18} />}
                  loading={saving}
                  size="md"
                >
                  Save Settings
                </Button>
                <Button
                  type="button"
                  variant="light"
                  color="red"
                  leftSection={<IconTrash size={18} />}
                  onClick={handleClear}
                  disabled={saving}
                  size="md"
                >
                  Clear Settings
                </Button>
              </Group>

              {/* Success Message */}
              {saved && !testError && (
                <Alert
                  icon={<IconCheck size={16} />}
                  title="Success!"
                  color="green"
                  variant="light"
                  withCloseButton={false}
                >
                  Connection test successful! Settings saved.
                </Alert>
              )}

              {/* Error Message */}
              {(testError || error) && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Connection Test Failed"
                  color="red"
                  variant="light"
                >
                  {testError || error}
                </Alert>
              )}
            </Stack>
          </form>
        </Paper>

        {/* Instructions */}
        <Paper shadow="sm" p="lg" radius="md" withBorder bg="blue.0">
          <Stack gap="md">
            <Group gap="xs">
              <ThemeIcon size="md" variant="light" color="blue">
                <IconInfoCircle size={18} />
              </ThemeIcon>
              <Title order={4} size="h5">
                How to get your API key
              </Title>
            </Group>

            <List
              spacing="xs"
              size="sm"
              center
              icon={
                <ThemeIcon size={20} radius="xl" color="blue" variant="light">
                  <IconCheck size={12} />
                </ThemeIcon>
              }
            >
              <List.Item>Log in to your Shiori Chan instance</List.Item>
              <List.Item>Go to Settings → API Key</List.Item>
              <List.Item>Generate a new API key</List.Item>
              <List.Item>Copy and paste it here</List.Item>
            </List>
          </Stack>
        </Paper>

        {/* Footer */}
        <Box ta="center">
          <Text size="sm" c="dimmed">
            Shiori Chan Browser Extension v0.0.0
          </Text>
        </Box>
      </Stack>
    </Container>
  );
}

export default App;

