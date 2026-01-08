import { 
  Paper, 
  Stack, 
  Group, 
  Text,
  Title,
  Image,
  Button
} from '@mantine/core';
import { IconBrandGithub } from '@tabler/icons-react';
import { AppContainer } from '@/component/layout/AppContainer';
import { getTranslations } from 'next-intl/server';
import { BUILD_INFO } from '@/lib/build-info';

export default async function AboutPage() {
  const t = await getTranslations('metadata');
  
  const formatDate = (isoString: string) => {
    if (isoString === 'unknown') return 'unknown';
    try {
      return new Date(isoString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <AppContainer py="xl">
      <Stack gap="md" maw={600} mx="auto">
        {/* App Icon and Name */}
        <Group justify="center">
          <Image
            src="/icon.png"
            alt="App Icon"
            w={120}
            h={120}
            style={{ borderRadius: 24 }}
          />
        </Group>
        
        <Stack gap="xs" align="center">
          <Title order={1}>{t('title')}</Title>
          <Text c="dimmed" size="sm">
            {t('description')}
          </Text>
        </Stack>

        {/* GitHub Link */}
        <Group justify="center" mt="md">
          <Button
            component="a"
            href="https://github.com/ReinforceZwei/shiori"
            target="_blank"
            rel="noopener noreferrer"
            leftSection={<IconBrandGithub size={18} />}
            variant="default"
          >
            View on GitHub
          </Button>
        </Group>

        {/* Version Information */}
        <Paper withBorder p="lg" radius="md" mt="md">
          <Stack gap="md">
            <Group justify="space-between" wrap="nowrap">
              <Text size="sm" c="dimmed">
                Version:
              </Text>
              <Text size="sm" fw={500} ff="monospace">
                {BUILD_INFO.version}
              </Text>
            </Group>

            <Group justify="space-between" wrap="nowrap">
              <Text size="sm" c="dimmed">
                Build Time:
              </Text>
              <Text size="sm" fw={500} ff="monospace">
                {formatDate(BUILD_INFO.buildTime)}
              </Text>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </AppContainer>
  );
}

