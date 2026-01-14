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
import { useLocale, useTranslations } from 'next-intl';

interface ApiKeySettingsProps {
  apiKeys: Omit<ApiKey, "key">[]; // BetterAuth document says key is returned, but typescript says it's not
}

// Convert seconds to readable format
// use string type because Select dont accept number as value
const EXPIRATION_OPTIONS_VALUES = [
  (30 * 24 * 60 * 60).toString(), // 30 days
  (90 * 24 * 60 * 60).toString(), // 90 days
  (180 * 24 * 60 * 60).toString(), // 180 days
  (365 * 24 * 60 * 60).toString(), // 365 days
  (3 * 365 * 24 * 60 * 60).toString(), // 1095 days
  (5 * 365 * 24 * 60 * 60).toString(), // 1825 days
  (3650 * 24 * 60 * 60).toString(), // 3650 days
];

const getExpirationOptions = (t: (key: string) => string) => [
  { value: EXPIRATION_OPTIONS_VALUES[0], label: t('expiration_1_month') },
  { value: EXPIRATION_OPTIONS_VALUES[1], label: t('expiration_3_months') },
  { value: EXPIRATION_OPTIONS_VALUES[2], label: t('expiration_6_months') },
  { value: EXPIRATION_OPTIONS_VALUES[3], label: t('expiration_1_year') },
  { value: EXPIRATION_OPTIONS_VALUES[4], label: t('expiration_3_years') },
  { value: EXPIRATION_OPTIONS_VALUES[5], label: t('expiration_5_years') },
  { value: EXPIRATION_OPTIONS_VALUES[6], label: t('expiration_10_years') },
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
  const t = useTranslations('Settings_ApiKey');
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const expirationOptions = getExpirationOptions(t);

  const form = useForm<ApiKeyFormValues>({
    initialValues: {
      name: '',
      expirationSeconds: expirationOptions[3].value, // 1 year
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
          title: t('error_title'),
          message: result.error || t('create_error_message'),
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      notifications.show({
        title: t('error_title'),
        message: t('unexpected_error_message'),
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
          title: t('success_title'),
          message: t('delete_success_message'),
          color: 'green',
        });

        // Remove the key from the list
        setApiKeys(apiKeys.filter((key) => key.id !== keyId));
      } else {
        notifications.show({
          title: t('error_title'),
          message: result.error || t('delete_error_message'),
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      notifications.show({
        title: t('error_title'),
        message: t('unexpected_error_message'),
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
            <Title order={3}>{t('title')}</Title>
          </Group>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => setShowForm(!showForm)}
            variant="light"
            disabled={!!createdKey}
          >
            {t('new_api_key_button')}
          </Button>
        </Group>

        <Text size="sm" c="dimmed">
          {t('description')}
        </Text>

        <Divider my="xs" />

        {/* Created Key Display */}
        {createdKey && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={t('created_key_alert_title')}
            color="blue"
            variant="light"
            withCloseButton
            onClose={handleCloseKeyDisplay}
          >
            <Stack gap="sm">
              <Text size="sm">
                {t('created_key_alert_message')}
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
                    <Tooltip label={copied ? t('copy_tooltip_copied') : t('copy_tooltip')} withArrow>
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
                  label={t('form_name_label')}
                  placeholder={t('form_name_placeholder')}
                  description={t('form_name_description')}
                  {...form.getInputProps('name')}
                  required
                />

                <Select
                  label={t('form_expiration_label')}
                  placeholder={t('form_expiration_placeholder')}
                  description={t('form_expiration_description')}
                  data={expirationOptions}
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
                    {t('cancel_button')}
                  </Button>
                  <Button
                    type="submit"
                    loading={isCreating}
                  >
                    {t('create_button')}
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        </Collapse>

        {/* API Keys Table */}
        {apiKeys.length === 0 ? (
          <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
            {t('empty_state_message')}
          </Alert>
        ) : (
          <Box style={{ overflowX: 'auto' }}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('table_header_name')}</Table.Th>
                  <Table.Th>{t('table_header_created')}</Table.Th>
                  <Table.Th>{t('table_header_expires')}</Table.Th>
                  <Table.Th>{t('table_header_last_used')}</Table.Th>
                  <Table.Th style={{ width: 80 }}>{t('table_header_actions')}</Table.Th>
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
                        {key.expiresAt ? formatDate(key.expiresAt, locale) : t('never')}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {key.lastRequest ? formatDate(key.lastRequest, locale) : t('never')}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Tooltip label={t('delete_tooltip')} withArrow>
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