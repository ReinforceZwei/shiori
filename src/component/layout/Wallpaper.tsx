import { CSSProperties } from 'react';

interface WallpaperProps {
  imageUrl: string | null;
  displaySize?: string;
  displayPosition?: string;
  displayRepeat?: string;
  displayOpacity?: number;
  displayBlur?: number;
}

/**
 * Fullscreen wallpaper component that renders behind all content
 * Uses fixed positioning to cover the entire viewport
 */
export function Wallpaper({
  imageUrl,
  displaySize = 'cover',
  displayPosition = 'center',
  displayRepeat = 'no-repeat',
  displayOpacity = 1.0,
  displayBlur = 0,
}: WallpaperProps) {
  if (!imageUrl) {
    return null;
  }

  const style: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: displaySize,
    backgroundPosition: displayPosition,
    backgroundRepeat: displayRepeat,
    opacity: displayOpacity,
    filter: displayBlur > 0 ? `blur(${displayBlur}px)` : undefined,
    zIndex: -1,
    pointerEvents: 'none',
  };

  return <div style={style} aria-hidden="true" />;
}

