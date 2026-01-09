'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Box, Group, Text, FileButton } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { BookmarkIcon } from '@/app/api/bookmark/metadata/types';
import { imageToBase64, fetchGoogleFavicon, extractDomain, isPublicDomain } from '../utils';
import { IconOption, UploadIconOption, GoogleFetchIconOption } from './IconOptions';

interface IconSelectorProps {
  // Standard form input props
  value?: string; // base64 string
  onChange?: (value: string, mimeType: string) => void;
  error?: React.ReactNode;
  
  // Additional props for functionality
  currentUrl: string;
  metadataIcons?: BookmarkIcon[];
  initialIcon?: { base64: string; mimeType: string };
  
  // Optional customization
  label?: string;
  disabled?: boolean;
}

export default function IconSelector({
  value,
  onChange,
  error,
  currentUrl,
  metadataIcons = [],
  initialIcon,
  label,
  disabled = false,
}: IconSelectorProps) {
  const t = useTranslations('BookmarkForm');
  
  // Internal state for custom/fetched icons
  const [customUploadedIcon, setCustomUploadedIcon] = useState<BookmarkIcon | null>(null);
  const [googleFetchedIcon, setGoogleFetchedIcon] = useState<BookmarkIcon | null>(null);
  const [isFetchingGoogle, setIsFetchingGoogle] = useState(false);

  // Combine all available icons
  const allIcons = useMemo(() => {
    const icons: BookmarkIcon[] = [];
    const seen = new Set<string>();
    
    // Add initial icon if exists
    if (initialIcon?.base64 && initialIcon?.mimeType) {
      const icon: BookmarkIcon = {
        base64: initialIcon.base64,
        mimeType: initialIcon.mimeType,
        source: 'default',
        url: '',
        type: 'current',
        sizes: 'unknown',
        metadata: { 
          width: 0, 
          height: 0, 
          format: initialIcon.mimeType.split('/')[1] || 'unknown',
          size: 0,
        },
      };
      icons.push(icon);
      seen.add(initialIcon.base64);
    }
    
    // Add custom uploaded icon
    if (customUploadedIcon && !seen.has(customUploadedIcon.base64)) {
      icons.push(customUploadedIcon);
      seen.add(customUploadedIcon.base64);
    }
    
    // Add Google fetched icon
    if (googleFetchedIcon && !seen.has(googleFetchedIcon.base64)) {
      icons.push(googleFetchedIcon);
      seen.add(googleFetchedIcon.base64);
    }
    
    // Add metadata icons
    metadataIcons.forEach((icon) => {
      if (!seen.has(icon.base64)) {
        icons.push(icon);
        seen.add(icon.base64);
      }
    });
    
    return icons;
  }, [initialIcon, customUploadedIcon, googleFetchedIcon, metadataIcons]);

  // Auto-select first icon if no value is set and icons are available
  useEffect(() => {
    if (!value && allIcons.length > 0 && onChange) {
      onChange(allIcons[0].base64, allIcons[0].mimeType);
    }
  }, [allIcons, value, onChange]);

  const handleUploadCustomIcon = useCallback(async (file: File | null) => {
    if (!file || !onChange) return;
    
    try {
      const { base64, mimeType, width, height } = await imageToBase64(file);
      const customIcon: BookmarkIcon = {
        base64,
        mimeType,
        source: 'default',
        url: '',
        type: 'custom-upload',
        sizes: width > 0 && height > 0 ? `${width}x${height}` : 'unknown',
        metadata: {
          width,
          height,
          format: mimeType.split('/')[1] || 'unknown',
          size: file.size,
        },
      };
      setCustomUploadedIcon(customIcon);
      onChange(base64, mimeType);
    } catch (error) {
      console.error('Failed to upload custom icon:', error);
    }
  }, [onChange]);

  const handleFetchGoogleIcon = useCallback(async () => {
    if (!onChange) return;
    
    const domain = extractDomain(currentUrl);
    if (!domain || !isPublicDomain(domain)) return;
    
    setIsFetchingGoogle(true);
    try {
      const result = await fetchGoogleFavicon(domain, 128);
      if (result) {
        const googleIcon: BookmarkIcon = {
          base64: result.base64,
          mimeType: result.mimeType,
          source: 'default',
          url: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
          type: 'google-favicon',
          sizes: `${result.width}x${result.height}`,
          metadata: {
            width: result.width,
            height: result.height,
            format: result.mimeType.split('/')[1] || 'png',
            size: 0,
          },
        };
        setGoogleFetchedIcon(googleIcon);
        onChange(result.base64, result.mimeType);
      }
    } catch (error) {
      console.error('Failed to fetch Google favicon:', error);
    } finally {
      setIsFetchingGoogle(false);
    }
  }, [onChange, currentUrl]);

  const handleRemoveCustomIcon = useCallback(() => {
    setCustomUploadedIcon(null);
    if (customUploadedIcon && value === customUploadedIcon.base64 && onChange) {
      // Clear value or select another icon
      const otherIcon = allIcons.find(icon => icon.base64 !== customUploadedIcon.base64);
      if (otherIcon) {
        onChange(otherIcon.base64, otherIcon.mimeType);
      } else {
        onChange('', '');
      }
    }
  }, [customUploadedIcon, value, onChange, allIcons]);

  const handleRemoveGoogleIcon = useCallback(() => {
    setGoogleFetchedIcon(null);
    if (googleFetchedIcon && value === googleFetchedIcon.base64 && onChange) {
      const otherIcon = allIcons.find(icon => icon.base64 !== googleFetchedIcon.base64);
      if (otherIcon) {
        onChange(otherIcon.base64, otherIcon.mimeType);
      } else {
        onChange('', '');
      }
    }
  }, [googleFetchedIcon, value, onChange, allIcons]);

  const currentDomain = useMemo(() => extractDomain(currentUrl), [currentUrl]);
  const isGoogleFetchEnabled = useMemo(() => isPublicDomain(currentDomain), [currentDomain]);

  return (
    <Box>
      {label && (
        <Text size="sm" fw={500} mb="xs">
          {label}
        </Text>
      )}
      
      <Group gap="xs">
        {/* Upload button */}
        <FileButton 
          onChange={handleUploadCustomIcon} 
          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
          disabled={disabled}
        >
          {(props) => (
            <UploadIconOption {...props} selected={false} disabled={disabled} />
          )}
        </FileButton>

        {/* Google fetch button */}
        <GoogleFetchIconOption
          onFetch={handleFetchGoogleIcon}
          isFetching={isFetchingGoogle}
          disabled={disabled || !isGoogleFetchEnabled}
          selected={false}
        />

        {/* Custom uploaded icon */}
        {customUploadedIcon && (
          <IconOption
            icon={customUploadedIcon}
            selected={value === customUploadedIcon.base64}
            onClick={() => onChange?.(customUploadedIcon.base64, customUploadedIcon.mimeType)}
            onRemove={handleRemoveCustomIcon}
            showRemove
            disabled={disabled}
          />
        )}

        {/* Google fetched icon */}
        {googleFetchedIcon && (
          <IconOption
            icon={googleFetchedIcon}
            selected={value === googleFetchedIcon.base64}
            onClick={() => onChange?.(googleFetchedIcon.base64, googleFetchedIcon.mimeType)}
            onRemove={handleRemoveGoogleIcon}
            showRemove
            disabled={disabled}
          />
        )}

        {/* Metadata icons */}
        {allIcons.map((icon, index) => {
          if (icon.type === 'custom-upload' || icon.type === 'google-favicon') {
            return null;
          }
          return (
            <IconOption
              key={index}
              icon={icon}
              selected={value === icon.base64}
              onClick={() => onChange?.(icon.base64, icon.mimeType)}
              disabled={disabled}
            />
          );
        })}
      </Group>
      
      {error && (
        <Text size="xs" c="red" mt="xs">
          {error}
        </Text>
      )}
    </Box>
  );
}

