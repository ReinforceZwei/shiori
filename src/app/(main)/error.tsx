'use client';

import { 
  Paper, 
  Stack, 
  Title, 
  Text, 
  Button, 
  Group,
  Code,
  Divider,
  Center
} from '@mantine/core';
import { 
  IconAlertTriangle, 
  IconRefresh, 
  IconHome,
  IconBug
} from '@tabler/icons-react';
import { AppContainer } from '@/component/layout/AppContainer';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('Error');
  const router = useRouter();

  return (
    <AppContainer py="xl">
      <Center>
        <Paper 
          withBorder 
          p="xl" 
          radius="lg" 
          maw={600} 
          w="100%"
          shadow="sm"
        >
          <Stack gap="lg">
            {/* Error Icon */}
            <Center>
              <IconAlertTriangle 
                size={80} 
                stroke={1.5}
                style={{ color: 'var(--mantine-color-red-6)' }}
              />
            </Center>

            {/* Title and Description */}
            <Stack gap="xs" align="center">
              <Title order={2} ta="center">
                {t('title')}
              </Title>
              <Text c="dimmed" ta="center" size="sm">
                {t('description')}
              </Text>
            </Stack>

            <Divider />

            {/* Error Details */}
            <Stack gap="sm">
              <Group gap="xs">
                <IconBug size={18} />
                <Text size="sm" fw={500}>
                  {t('error_details')}
                </Text>
              </Group>
              
              <Code 
                block 
                style={{ 
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}
              >
                {error?.message || t('unknown_error')}
              </Code>

              {error?.digest && (
                <Text size="xs" c="dimmed">
                  {t('error_id')}: {error.digest}
                </Text>
              )}
            </Stack>

            <Divider />

            {/* Action Buttons */}
            <Stack gap="sm">
              <Button 
                onClick={() => reset()} 
                leftSection={<IconRefresh size={18} />}
                fullWidth
                size="md"
              >
                {t('try_again')}
              </Button>
              
              <Button 
                onClick={() => router.push('/')} 
                leftSection={<IconHome size={18} />}
                variant="default"
                fullWidth
                size="md"
              >
                {t('back_to_home')}
              </Button>
            </Stack>

            {/* Help Text */}
            <Text size="xs" c="dimmed" ta="center">
              {t('help_text')}
            </Text>
          </Stack>
        </Paper>
      </Center>
    </AppContainer>
  );
}
