'use client';

import { Box, Paper, Image, Text, ActionIcon, Loader } from '@mantine/core';
import { IconUpload, IconWorldDownload, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { BookmarkIcon, createIconDataUrl } from '@/app/api/bookmark/metadata/types';

// Main icon option component
interface IconOptionProps {
  icon: BookmarkIcon;
  selected: boolean;
  onClick: () => void;
  onRemove?: () => void;
  showRemove?: boolean;
  disabled?: boolean;
}

export function IconOption({ icon, selected, onClick, onRemove, showRemove = false, disabled = false }: IconOptionProps) {
  const t = useTranslations('BookmarkForm');
  const hasMetadata = icon.metadata && icon.metadata.width > 0 && icon.metadata.height > 0;
  
  // Determine the label to show
  let label: string;
  if (hasMetadata) {
    label = t('icon_size', { width: icon.metadata.width, height: icon.metadata.height });
  } else if (icon.type === 'current') {
    label = t('icon_current');
  } else {
    label = t('icon_unknown');
  }
  
  return (
    <Paper
      p="xs"
      withBorder
      radius="sm"
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        outline: selected ? '2px solid var(--mantine-primary-color-6)' : 'none',
        outlineOffset: '-1px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
        opacity: disabled ? 0.5 : 1,
      }}
      onClick={disabled ? undefined : onClick}
    >
      {showRemove && onRemove && !disabled && (
        <ActionIcon
          size="xs"
          color="red"
          variant="filled"
          radius="xl"
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            zIndex: 1,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <IconX size={12} />
        </ActionIcon>
      )}
      <Image
        src={createIconDataUrl(icon)}
        alt={t('icon_alt')}
        w={48}
        h={48}
        fit="contain"
      />
      <Text size="xs" c="dimmed" ta="center" mt={4}>
        {label}
      </Text>
    </Paper>
  );
}

// Upload custom icon button component
interface UploadIconOptionProps {
  onClick: () => void;
  selected: boolean;
  disabled?: boolean;
}

export function UploadIconOption({ onClick, selected, disabled = false }: UploadIconOptionProps) {
  const t = useTranslations('BookmarkForm');
  
  return (
    <Paper
      p="xs"
      withBorder
      radius="sm"
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        outline: selected ? '2px solid var(--mantine-primary-color-6)' : 'none',
        outlineOffset: '-1px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
        opacity: disabled ? 0.5 : 1,
      }}
      onClick={disabled ? undefined : onClick}
    >
      <Box
        style={{
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconUpload size={24} style={{ opacity: 0.5 }} />
      </Box>
      <Text size="xs" c="dimmed" ta="center" mt={4}>
        {t('icon_upload')}
      </Text>
    </Paper>
  );
}

// Google favicon fetch button component
interface GoogleFetchIconOptionProps {
  onFetch: () => void;
  isFetching: boolean;
  disabled: boolean;
  selected: boolean;
}

export function GoogleFetchIconOption({ onFetch, isFetching, disabled, selected }: GoogleFetchIconOptionProps) {
  const t = useTranslations('BookmarkForm');
  
  return (
    <Paper
      p="xs"
      withBorder
      radius="sm"
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        outline: selected ? '2px solid var(--mantine-primary-color-6)' : 'none',
        outlineOffset: '-1px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
        opacity: disabled ? 0.5 : 1,
      }}
      onClick={disabled ? undefined : onFetch}
    >
      <Box
        style={{
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isFetching ? (
          <Loader size="sm" />
        ) : (
          <IconWorldDownload size={24} style={{ opacity: 0.5 }} />
        )}
      </Box>
      <Text size="xs" c="dimmed" ta="center" mt={4}>
        {t('icon_google_fetch')}
      </Text>
    </Paper>
  );
}

