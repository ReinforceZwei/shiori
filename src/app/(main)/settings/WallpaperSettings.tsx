"use client";

import { useEffect, useState } from 'react';
import {
  Paper,
  Stack,
  Group,
  Title,
  Text,
  Button,
  Badge,
  Alert,
  Loader,
  FileButton,
  Divider,
} from '@mantine/core';
import {
  IconPhoto,
  IconUpload,
  IconAlertCircle,
} from '@tabler/icons-react';
import { 
  useBackgroundImagesQuery,
  useCreateBackgroundImageMutation,
  useUpdateBackgroundImageMutation,
  type BackgroundImageMetadata,
} from '@/features/wallpaper/query';
import {
  deleteBackgroundImageAction,
} from '@/app/actions/wallpaper';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import WallpaperGrid from './wallpaper/WallpaperGrid';
import { fileToBase64 } from '@/lib/utils/image';

const MAX_WALLPAPERS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface WallpaperSettingsProps {
  initialWallpapers: BackgroundImageMetadata[];
}

export default function WallpaperSettings({ initialWallpapers }: WallpaperSettingsProps) {
  const queryClient = useQueryClient();
  const { data: wallpapers, isLoading } = useBackgroundImagesQuery({ 
    initialData: initialWallpapers 
  });
  const { mutate: createWallpaper, isPending: isUploading } = useCreateBackgroundImageMutation();
  const { mutate: updateWallpaper } = useUpdateBackgroundImageMutation();
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);

  useEffect(() => {
    queryClient.setQueryData(["wallpapers", "all"], initialWallpapers);
  }, [initialWallpapers]);

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      notifications.show({
        title: 'File too large',
        message: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        color: 'red',
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      notifications.show({
        title: 'Invalid file type',
        message: 'Please upload an image file',
        color: 'red',
      });
      return;
    }

    setUploadingFile(file);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);

      // Use mutation hook to upload via API
      createWallpaper(
        {
          data: base64,
          filename: file.name,
          deviceType: 'all',
          isActive: false,
        },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Success',
              message: 'Wallpaper uploaded successfully',
              color: 'green',
            });
            setUploadingFile(null);
          },
          onError: (error) => {
            notifications.show({
              title: 'Error',
              message: error.message || 'Failed to upload wallpaper',
              color: 'red',
            });
            setUploadingFile(null);
          },
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to upload wallpaper',
        color: 'red',
      });
      setUploadingFile(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteBackgroundImageAction(id);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Wallpaper deleted successfully',
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to delete wallpaper',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete wallpaper',
        color: 'red',
      });
    }
  };

  const handleUpdateProperty = (
    id: string,
    updates: Record<string, any>
  ) => {
    updateWallpaper(
      { id, data: updates },
      {
        onError: (error) => {
          // Show error notification (rollback is handled by the mutation hook)
          notifications.show({
            title: 'Error',
            message: error.message || 'Failed to update wallpaper',
            color: 'red',
          });
        },
      }
    );
  };

  const wallpaperCount = wallpapers?.length || 0;
  const canUpload = wallpaperCount < MAX_WALLPAPERS;

  return (
    <Paper shadow="xs" p="xl" radius="md" withBorder>
      <Stack gap="md">
        <Group gap="sm" justify="space-between" wrap="wrap">
          <Group gap="sm">
            <IconPhoto size={24} />
            <Title order={3}>Wallpapers</Title>
          </Group>
          <Badge variant="light" size="lg">
            {wallpaperCount} / {MAX_WALLPAPERS}
          </Badge>
        </Group>

        <Text size="sm" c="dimmed">
          Upload background images for your home page. You can have up to{' '}
          {MAX_WALLPAPERS} wallpapers and customize display settings for each.
        </Text>

        <Divider my="xs" />

        {/* Upload Button */}
        <Group>
          <FileButton
            onChange={handleFileUpload}
            accept="image/png,image/jpeg,image/webp,image/gif"
            disabled={!canUpload || isUploading}
          >
            {(props) => (
              <Button
                {...props}
                leftSection={isUploading ? <Loader size="xs" /> : <IconUpload size={18} />}
                disabled={!canUpload || isUploading}
                variant="light"
              >
                {isUploading ? 'Uploading...' : 'Upload Wallpaper'}
              </Button>
            )}
          </FileButton>
          {!canUpload && (
            <Text size="xs" c="dimmed">
              Maximum limit reached. Delete a wallpaper to upload a new one.
            </Text>
          )}
        </Group>

        {/* Loading State */}
        {isLoading && (
          <Group justify="center" py="xl">
            <Loader size="md" />
          </Group>
        )}

        {/* Empty State */}
        {!isLoading && wallpaperCount === 0 && (
          <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
            No wallpapers uploaded yet. Upload your first wallpaper to get started!
          </Alert>
        )}

        {/* Wallpaper Grid */}
        {!isLoading && wallpaperCount > 0 && wallpapers && (
          <WallpaperGrid
            wallpapers={wallpapers}
            onDelete={handleDelete}
            onUpdateProperty={handleUpdateProperty}
          />
        )}
      </Stack>
    </Paper>
  );
}

