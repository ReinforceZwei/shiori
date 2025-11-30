"use client";

import { useState } from 'react';
import { Grid } from '@mantine/core';
import type { BackgroundImageMetadata } from '@/features/wallpaper/query';
import WallpaperCard from './WallpaperCard';

interface WallpaperGridProps {
  wallpapers: BackgroundImageMetadata[];
  onDelete: (id: string) => Promise<void>;
  onUpdateProperty: (id: string, updates: Record<string, any>) => void;
}

export default function WallpaperGrid({
  wallpapers,
  onDelete,
  onUpdateProperty,
}: WallpaperGridProps) {
  const [expandedWallpaper, setExpandedWallpaper] = useState<string | null>(null);

  return (
    <Grid gutter="md">
      {wallpapers.map((wallpaper) => (
        <Grid.Col key={wallpaper.id} span={{ base: 12, sm: 6, md: 4 }}>
          <WallpaperCard
            wallpaper={wallpaper}
            isExpanded={expandedWallpaper === wallpaper.id}
            onToggleExpand={() =>
              setExpandedWallpaper(
                expandedWallpaper === wallpaper.id ? null : wallpaper.id
              )
            }
            onDelete={onDelete}
            onUpdateProperty={onUpdateProperty}
          />
        </Grid.Col>
      ))}
    </Grid>
  );
}

