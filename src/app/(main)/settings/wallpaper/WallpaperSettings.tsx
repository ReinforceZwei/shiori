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
import { useTranslations } from 'next-intl';
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
import WallpaperGrid from './WallpaperGrid';
import { fileToBase64 } from '@/lib/utils/image';

const MAX_WALLPAPERS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface WallpaperSettingsProps {
  initialWallpapers: BackgroundImageMetadata[];
}

export default function WallpaperSettings({ initialWallpapers }: WallpaperSettingsProps) {
  const t = useTranslations('Settings_Wallpaper');
  const queryClient = useQueryClient();
  const { data: wallpapers, isLoading } = useBackgroundImagesQuery({ 
    initialData: initialWallpapers 
  });
  // We use API route to upload wallpaper because server action has size limit
  // can increase size limit, but i dont want to add extra complexity :P
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
        title: t('file_too_large_title'),
        message: t('file_too_large_message', { size: MAX_FILE_SIZE / (1024 * 1024) }),
        color: 'red',
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      notifications.show({
        title: t('invalid_file_type_title'),
        message: t('invalid_file_type_message'),
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
              title: t('upload_success_title'),
              message: t('upload_success_message'),
              color: 'green',
            });
            setUploadingFile(null);
          },
          onError: (error) => {
            notifications.show({
              title: t('error_title'),
              message: error.message || t('upload_error_message'),
              color: 'red',
            });
            setUploadingFile(null);
          },
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      notifications.show({
        title: t('error_title'),
        message: t('upload_error_message'),
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
          title: t('delete_success_title'),
          message: t('delete_success_message'),
          color: 'green',
        });
      } else {
        notifications.show({
          title: t('error_title'),
          message: result.error || t('delete_error_message'),
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      notifications.show({
        title: t('error_title'),
        message: t('delete_error_message'),
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
            title: t('error_title'),
            message: error.message || t('update_error_message'),
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
            <Title order={3}>{t('title')}</Title>
          </Group>
          <Badge variant="light" size="lg">
            {wallpaperCount} / {MAX_WALLPAPERS}
          </Badge>
        </Group>

        <Text size="sm" c="dimmed">
          {t('description', { max: MAX_WALLPAPERS })}
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
                {isUploading ? t('uploading') : t('upload_button')}
              </Button>
            )}
          </FileButton>
          {!canUpload && (
            <Text size="xs" c="dimmed">
              {t('max_limit_reached')}
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
            {t('empty_state_message')}
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

