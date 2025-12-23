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
          alt={wallpaper.filename || 'Wallpaper'}
          fit="cover"
        />
      </Card.Section>

      <Stack gap="xs" mt="md">
        {/* Active Status & Device Type */}
        <Group justify="space-between" wrap="nowrap">
          <Switch
            label="Active"
            size="sm"
            checked={form.values.isActive}
            onChange={(event) => handleActiveToggle(event.currentTarget.checked)}
          />
          <Group gap={4}>
            {getDeviceIcon(form.values.deviceType)}
            <Badge size="sm" variant="light">
              {form.values.deviceType}
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
          {isExpanded ? 'Hide' : 'Show'} Options
        </Button>

        {/* Expanded Options */}
        <Collapse in={isExpanded}>
          <Stack gap="sm" mt="xs">
            <Divider />

            {/* Device Type */}
            <Select
              label="Device Type"
              size="xs"
              data={[
                { value: 'all', label: 'All Devices' },
                { value: 'desktop', label: 'Desktop Only' },
                { value: 'mobile', label: 'Mobile Only' },
              ]}
              {...form.getInputProps('deviceType')}
            />

            {/* Display Size */}
            <Select
              label="Display Size"
              size="xs"
              data={[
                { value: 'cover', label: 'Cover' },
                { value: 'contain', label: 'Contain' },
                { value: 'auto', label: 'Auto' },
                { value: '100% 100%', label: 'Stretch' },
              ]}
              {...form.getInputProps('displaySize')}
            />

            {/* Display Position */}
            <Select
              label="Position"
              size="xs"
              data={[
                { value: 'center', label: 'Center' },
                { value: 'top', label: 'Top' },
                { value: 'bottom', label: 'Bottom' },
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' },
              ]}
              {...form.getInputProps('displayPosition')}
            />

            {/* Opacity */}
            <Box>
              <Text size="xs" fw={500} mb={4}>
                Opacity: {Math.round(form.values.displayOpacity * 100)}%
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
                Blur: {form.values.displayBlur}px
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
                  Save Changes
                </Button>
                <Button
                  variant="light"
                  size="xs"
                  flex={1}
                  leftSection={<IconRestore size={14} />}
                  onClick={handleReset}
                >
                  Reset
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
          Delete
        </Button>
      </Stack>
    </Card>
  );
}

