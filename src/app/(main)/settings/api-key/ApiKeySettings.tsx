'use client';

import { useState } from 'react';
import { ApiKey } from "better-auth/plugins";
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import {
  Paper,
  Stack,
  Group,
  Title,
  Text,
  Button,
  Table,
  ActionIcon,
  Collapse,
  TextInput,
  Select,
  Divider,
  Alert,
  CopyButton,
  Tooltip,
  Box,
} from '@mantine/core';
import {
  IconKey,
  IconTrash,
  IconPlus,
  IconCheck,
  IconCopy,
  IconAlertCircle,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { createApiKeyAction, deleteApiKeyAction } from '@/app/actions/apiKey';
import { useLocale } from 'next-intl';

interface ApiKeySettingsProps {
  apiKeys: Omit<ApiKey, "key">[]; // BetterAuth document says key is returned, but typescript says it's not
}

// Convert seconds to readable format
// use string type because Select dont accept number as value
const EXPIRATION_OPTIONS = [
  { value: (30 * 24 * 60 * 60).toString(), label: '1 month' }, // 30 days
  { value: (90 * 24 * 60 * 60).toString(), label: '3 months' }, // 90 days
  { value: (180 * 24 * 60 * 60).toString(), label: '6 months' }, // 180 days
  { value: (365 * 24 * 60 * 60).toString(), label: '1 year' }, // 365 days
  { value: (3 * 365 * 24 * 60 * 60).toString(), label: '3 years' }, // 1095 days
  { value: (5 * 365 * 24 * 60 * 60).toString(), label: '5 years' }, // 1825 days
  { value: (3650 * 24 * 60 * 60).toString(), label: '10 years (you sure?)' }, // 3650 days
];

const formatDate = (date: Date, locale: string = 'en-US') => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Zod schema for form validation
const apiKeyFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  expirationSeconds: z.string().min(1, 'Expiration time is required'),
});

type ApiKeyFormValues = z.infer<typeof apiKeyFormSchema>;

export default function ApiKeySettings({ apiKeys: initialApiKeys }: ApiKeySettingsProps) {
  const locale = useLocale();
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const form = useForm<ApiKeyFormValues>({
    initialValues: {
      name: '',
      expirationSeconds: EXPIRATION_OPTIONS[3].value, // 1 year
    },
    validate: zodResolver(apiKeyFormSchema),
  });

  const handleCreateKey = async (values: ApiKeyFormValues) => {
    setIsCreating(true);

    try {
      const result = await createApiKeyAction({
        name: values.name.trim(),
        expiresInSeconds: parseInt(values.expirationSeconds),
      });

      if (result.success && result.data) {
        // Show the created key
        setCreatedKey(result.data.key || '');

        // Add the new key to the list (without the actual key value)
        const { key, ...keyWithoutSecret } = result.data;
        setApiKeys([...apiKeys, keyWithoutSecret]);

        // Reset form (but keep it open to show the key)
        form.reset();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to create API key',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred',
        color: 'red',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      const result = await deleteApiKeyAction(keyId);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'API key deleted successfully',
          color: 'green',
        });

        // Remove the key from the list
        setApiKeys(apiKeys.filter((key) => key.id !== keyId));
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to delete API key',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred',
        color: 'red',
      });
    }
  };

  const handleCloseKeyDisplay = () => {
    setCreatedKey(null);
    setShowForm(false);
  };

  return (
    <Paper shadow="xs" p="xl" radius="md" withBorder>
      <Stack gap="md">
        <Group gap="sm" justify="space-between" wrap="wrap">
          <Group gap="sm">
            <IconKey size={24} />
            <Title order={3}>API Keys</Title>
          </Group>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => setShowForm(!showForm)}
            variant="light"
            disabled={!!createdKey}
          >
            New API Key
          </Button>
        </Group>

        <Text size="sm" c="dimmed">
          API keys allow you to authenticate and access Shiori from API and browser extensions.
          Keep your keys secure and never share them publicly.
        </Text>

        <Divider my="xs" />

        {/* Created Key Display */}
        {createdKey && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Your new API key"
            color="blue"
            variant="light"
            withCloseButton
            onClose={handleCloseKeyDisplay}
          >
            <Stack gap="sm">
              <Text size="sm">
                Make sure to copy your API key now. You won't be able to see it again!
              </Text>
              <Group gap="xs">
                <TextInput
                  value={createdKey}
                  readOnly
                  styles={{ input: { fontFamily: 'monospace' } }}
                  style={{ flex: 1 }}
                />
                <CopyButton value={createdKey}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Copied!' : 'Copy'} withArrow>
                      <ActionIcon
                        color={copied ? 'teal' : 'blue'}
                        variant="filled"
                        onClick={copy}
                        size="lg"
                      >
                        {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
            </Stack>
          </Alert>
        )}

        {/* New Key Form */}
        <Collapse in={showForm && !createdKey}>
          <Paper p="md" withBorder>
            <form onSubmit={form.onSubmit(handleCreateKey)}>
              <Stack gap="md">
                <TextInput
                  label="Name"
                  placeholder="My API Key"
                  description="A descriptive name for this API key"
                  {...form.getInputProps('name')}
                  required
                />

                <Select
                  label="Expiration"
                  placeholder="Select expiration time"
                  description="How long until this key expires"
                  data={EXPIRATION_OPTIONS}
                  {...form.getInputProps('expirationSeconds')}
                  required
                />

                <Group justify="flex-end">
                  <Button
                    variant="default"
                    onClick={() => {
                      setShowForm(false);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isCreating}
                  >
                    Create API Key
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        </Collapse>

        {/* API Keys Table */}
        {apiKeys.length === 0 ? (
          <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
            No API keys yet. Create one to get started!
          </Alert>
        ) : (
          <Box style={{ overflowX: 'auto' }}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Expires</Table.Th>
                  <Table.Th>Last Used</Table.Th>
                  <Table.Th style={{ width: 80 }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {apiKeys.map((key) => (
                  <Table.Tr key={key.id}>
                    <Table.Td>
                      <Text fw={500}>{key.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {formatDate(key.createdAt, locale)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {key.expiresAt ? formatDate(key.expiresAt, locale) : 'Never'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {key.lastRequest ? formatDate(key.lastRequest, locale) : 'Never'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Tooltip label="Delete" withArrow>
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => handleDeleteKey(key.id)}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}