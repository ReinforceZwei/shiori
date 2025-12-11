'use client';

import { useState } from 'react';
import { Button, Container, Stack, Title, Text, Paper, Group } from '@mantine/core';
import { WallpaperFade } from '@/component/layout/WallpaperFade';

const WALLPAPER_URLS = [
  '/api/wallpaper/31297632-778d-400b-8de7-53e8a7d044bc',
  '/api/wallpaper/95a33ebc-533e-487d-aeff-15d612f0ecb6',
  '/api/wallpaper/a1817cc8-611f-44ac-8c1c-e38effdbee42',
];

export default function WallpaperDemoPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const toggleWallpaper = () => {
    setCurrentIndex((prev) => (prev + 1) % WALLPAPER_URLS.length);
  };

  const currentUrl = WALLPAPER_URLS[currentIndex];

  return (
    <>
      <WallpaperFade imageUrl={currentUrl} transitionDuration={250} />
      
      <Container size="md" style={{ position: 'relative', zIndex: 1 }} mt="xl">
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack gap="lg">
            <Title order={1}>Wallpaper Transition Demo</Title>
            
            <Text size="sm" c="dimmed">
              This demo showcases the smooth fading transition between wallpapers.
              Click the button below to cycle through different wallpapers.
            </Text>

            <Group>
              <Button 
                onClick={toggleWallpaper}
                size="lg"
                variant="filled"
              >
                Change Wallpaper
              </Button>
            </Group>

            <Paper p="md" bg="gray.0" radius="sm">
              <Text size="sm" fw={500} mb="xs">Current Wallpaper:</Text>
              <Text size="xs" c="dimmed" style={{ wordBreak: 'break-all' }}>
                {currentUrl}
              </Text>
              <Text size="xs" c="dimmed" mt="xs">
                Index: {currentIndex + 1} / {WALLPAPER_URLS.length}
              </Text>
            </Paper>

            <Stack gap="xs">
              <Text size="sm" fw={500}>Transition Settings:</Text>
              <Text size="xs" c="dimmed">• Duration: 1000ms</Text>
              <Text size="xs" c="dimmed">• Effect: Fade (ease-in-out)</Text>
              <Text size="xs" c="dimmed">• Display: Cover</Text>
              <Text size="xs" c="dimmed">• Position: Center</Text>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </>
  );
}

