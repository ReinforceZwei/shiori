"use client";

import { useEffect } from 'react';
import {
  Card,
  Image,
  Badge,
  Select,
  Switch,
  Slider,
  Button,
  Box,
  Divider,
  Collapse,
  Stack,
  Group,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconTrash,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDevices,
  IconChevronDown,
  IconChevronUp,
  IconDeviceFloppy,
  IconRestore,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import type { BackgroundImageMetadata } from '@/features/wallpaper/query';

interface WallpaperCardProps {
  wallpaper: BackgroundImageMetadata;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: (id: string) => Promise<void>;
  onUpdateProperty: (id: string, updates: Record<string, any>) => void;
}

interface WallpaperFormValues {
  isActive: boolean;
  deviceType: 'desktop' | 'mobile' | 'all';
  displaySize: string;
  displayPosition: string;
  displayOpacity: number;
  displayBlur: number;
}

export default function WallpaperCard({
  wallpaper,
  isExpanded,
  onToggleExpand,
  onDelete,
  onUpdateProperty,
}: WallpaperCardProps) {
  const t = useTranslations('Settings_Wallpaper');
  const form = useForm<WallpaperFormValues>({
    initialValues: {
      isActive: wallpaper.isActive,
      deviceType: wallpaper.deviceType,
      displaySize: wallpaper.displaySize,
      displayPosition: wallpaper.displayPosition,
      displayOpacity: wallpaper.displayOpacity,
      displayBlur: wallpaper.displayBlur,
    },
  });

  // Update form when wallpaper data changes (from optimistic updates)
  useEffect(() => {
    form.setValues({
      isActive: wallpaper.isActive,
      deviceType: wallpaper.deviceType,
      displaySize: wallpaper.displaySize,
      displayPosition: wallpaper.displayPosition,
      displayOpacity: wallpaper.displayOpacity,
      displayBlur: wallpaper.displayBlur,
    });
  }, [wallpaper]);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop':
        return <IconDeviceDesktop size={16} />;
      case 'mobile':
        return <IconDeviceMobile size={16} />;
      default:
        return <IconDevices size={16} />;
    }
  };

  const handleActiveToggle = (checked: boolean) => {
    // Update form value
    form.setFieldValue('isActive', checked);
    form.setInitialValues({ ...form.values, isActive: checked });
    // Immediately save the active status
    onUpdateProperty(wallpaper.id, { isActive: checked });
  };

  const handleSave = () => {
    const dirtyFields = form.getDirty();
    const updates: Record<string, any> = {};
    
    // Only send changed fields, excluding isActive (auto-saved)
    Object.keys(dirtyFields).forEach((key) => {
      if (key !== 'isActive' && dirtyFields[key as keyof WallpaperFormValues]) {
        updates[key] = form.values[key as keyof WallpaperFormValues];
      }
    });

    if (Object.keys(updates).length > 0) {
      onUpdateProperty(wallpaper.id, updates);
      form.resetDirty();
    }
  };

  const handleReset = () => {
    form.reset();
  };

  // Check if there are changes excluding isActive
  const hasChanges = Object.entries(form.getDirty()).some(
    ([key, isDirty]) => key !== 'isActive' && isDirty
  );

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image
          src={`/api/wallpaper/${wallpaper.id}`}
          h={160}
          alt={wallpaper.filename || t('wallpaper_alt')}
          fit="cover"
        />
      </Card.Section>

      <Stack gap="xs" mt="md">
        {/* Active Status & Device Type */}
        <Group justify="space-between" wrap="nowrap">
          <Switch
            label={t('active_label')}
            size="sm"
            checked={form.values.isActive}
            onChange={(event) => handleActiveToggle(event.currentTarget.checked)}
          />
          <Group gap={4}>
            {getDeviceIcon(form.values.deviceType)}
            <Badge size="sm" variant="light">
              {t(`device_type_${form.values.deviceType}_badge`)}
            </Badge>
          </Group>
        </Group>

        {/* Filename */}
        {wallpaper.filename && (
          <Text size="xs" c="dimmed" lineClamp={1}>
            {wallpaper.filename}
          </Text>
        )}

        {/* Expand/Collapse Button */}
        <Button
          variant="subtle"
          size="xs"
          fullWidth
          onClick={onToggleExpand}
          rightSection={
            isExpanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />
          }
        >
          {isExpanded ? t('hide_options') : t('show_options')}
        </Button>

        {/* Expanded Options */}
        <Collapse in={isExpanded}>
          <Stack gap="sm" mt="xs">
            <Divider />

            {/* Device Type */}
            <Select
              label={t('device_type_label')}
              size="xs"
              data={[
                { value: 'all', label: t('device_type_all') },
                { value: 'desktop', label: t('device_type_desktop') },
                { value: 'mobile', label: t('device_type_mobile') },
              ]}
              {...form.getInputProps('deviceType')}
            />

            {/* Display Size */}
            <Select
              label={t('display_size_label')}
              size="xs"
              data={[
                { value: 'cover', label: t('display_size_cover') },
                { value: 'contain', label: t('display_size_contain') },
                { value: 'auto', label: t('display_size_auto') },
                { value: '100% 100%', label: t('display_size_stretch') },
              ]}
              {...form.getInputProps('displaySize')}
            />

            {/* Display Position */}
            <Select
              label={t('position_label')}
              size="xs"
              data={[
                { value: 'center', label: t('position_center') },
                { value: 'top', label: t('position_top') },
                { value: 'bottom', label: t('position_bottom') },
                { value: 'left', label: t('position_left') },
                { value: 'right', label: t('position_right') },
              ]}
              {...form.getInputProps('displayPosition')}
            />

            {/* Opacity */}
            <Box>
              <Text size="xs" fw={500} mb={4}>
                {t('opacity_label', { value: Math.round(form.values.displayOpacity * 100) })}
              </Text>
              <Slider
                min={0}
                max={1}
                step={0.1}
                size="xs"
                {...form.getInputProps('displayOpacity')}
              />
            </Box>

            {/* Blur */}
            <Box>
              <Text size="xs" fw={500} mb={4}>
                {t('blur_label', { value: form.values.displayBlur })}
              </Text>
              <Slider
                min={0}
                max={20}
                step={1}
                size="xs"
                {...form.getInputProps('displayBlur')}
              />
            </Box>

            {/* Save/Reset Buttons */}
            {hasChanges && (
              <Group gap="xs" mt="xs">
                <Button
                  variant="filled"
                  size="xs"
                  flex={1}
                  leftSection={<IconDeviceFloppy size={14} />}
                  onClick={handleSave}
                >
                  {t('save_changes')}
                </Button>
                <Button
                  variant="light"
                  size="xs"
                  flex={1}
                  leftSection={<IconRestore size={14} />}
                  onClick={handleReset}
                >
                  {t('reset')}
                </Button>
              </Group>
            )}
          </Stack>
        </Collapse>

        {/* Delete Button */}
        <Button
          variant="light"
          color="red"
          size="xs"
          fullWidth
          leftSection={<IconTrash size={14} />}
          onClick={() => onDelete(wallpaper.id)}
          mt="xs"
        >
          {t('delete')}
        </Button>
      </Stack>
    </Card>
  );
}

