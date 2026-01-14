'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type { BackgroundImageMetadata } from '../query';
import { WallpaperFade } from '@/component/layout/WallpaperFade';

interface WallpaperDisplayProps {
  wallpapers: BackgroundImageMetadata[];
  cycleIntervalMs?: number;
}

/**
 * Client component that handles wallpaper display logic
 * 
 * Features:
 * - Detects screen orientation (portrait vs landscape)
 * - Selects appropriate wallpapers based on orientation:
 *   - Portrait mode: shows wallpapers with deviceType "mobile" or "all"
 *   - Landscape mode: shows wallpapers with deviceType "desktop" or "all"
 * - Cycles through multiple active wallpapers at a fixed interval (default: 1 hour)
 * - Uses the Wallpaper component for CSS rendering
 * 
 * @param wallpapers - Array of active wallpapers from wallpaperService.getAllActiveMetadata()
 * @param cycleIntervalMs - Interval in milliseconds to cycle wallpapers (default: 1 hour)
 */
export function WallpaperDisplay({ 
  wallpapers, 
  cycleIntervalMs = 60 * 60 * 1000 // Default: 1 hour
}: WallpaperDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPortrait, setIsPortrait] = useState(false);
  const isInitialMount = useRef(true);

  // Detect screen orientation (portrait vs landscape)
  useEffect(() => {
    const checkOrientation = () => {
      // Portrait mode: height > width
      // Landscape mode: width > height
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    // Initial check
    checkOrientation();

    // Listen for window resize and orientation changes
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Filter wallpapers based on orientation
  // Portrait mode → show "mobile" or "all" wallpapers
  // Landscape mode → show "desktop" or "all" wallpapers
  const filteredWallpapers = useMemo(() => {
    return wallpapers.filter((wallpaper) => {
      if (wallpaper.deviceType === 'all') return true;
      if (isPortrait && wallpaper.deviceType === 'mobile') return true;
      if (!isPortrait && wallpaper.deviceType === 'desktop') return true;
      return false;
    });
  }, [wallpapers, isPortrait]);

  // Cycle through wallpapers at the specified interval
  useEffect(() => {
    if (filteredWallpapers.length <= 1) {
      // No need to cycle if there's only one or no wallpapers
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredWallpapers.length);
    }, cycleIntervalMs);

    return () => clearInterval(interval);
  }, [filteredWallpapers.length, cycleIntervalMs]);

  // Set random starting index ONLY on initial mount
  // This prevents wallpaper changes when the page revalidates (e.g., after bookmark updates)
  useEffect(() => {
    if (filteredWallpapers.length > 0 && isInitialMount.current) {
      const randomIndex = Math.floor(Math.random() * filteredWallpapers.length);
      setCurrentIndex(randomIndex);
      isInitialMount.current = false;
    }
  }, [filteredWallpapers.length]);

  useEffect(() => {
    // Fix a bug that currentIndex out of bound when isPortrait changed
    // and filteredWallpapers recalculated
    if (filteredWallpapers.length > 0 && currentIndex >= filteredWallpapers.length) {
      const randomIndex = Math.floor(Math.random() * filteredWallpapers.length);
      setCurrentIndex(randomIndex);
    }
  }, [filteredWallpapers.length, currentIndex]);

  // Get the current wallpaper to display
  const currentWallpaper = filteredWallpapers[currentIndex];

  // If no wallpaper is available, don't render anything
  if (!currentWallpaper) {
    return null;
  }

  // Construct the image URL for the current wallpaper
  const imageUrl = `/api/wallpaper/${currentWallpaper.id}`;

  return (
    <WallpaperFade
      imageUrl={imageUrl}
      transitionDuration={250}
      displaySize={currentWallpaper.displaySize}
      displayPosition={currentWallpaper.displayPosition}
      displayRepeat={currentWallpaper.displayRepeat}
      displayOpacity={currentWallpaper.displayOpacity}
      displayBlur={currentWallpaper.displayBlur}
    />
  );
}

