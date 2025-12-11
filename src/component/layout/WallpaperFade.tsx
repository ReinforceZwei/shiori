"use client";
import { Wallpaper } from "./Wallpaper";
import type { WallpaperProps } from "./Wallpaper";
import { useEffect, useState } from "react";

const useImageFade = ({
  imageUrl,
  duration = 1000,
}: {
  imageUrl?: string;
  duration?: number;
}) => {
  const [activeImg, setActiveImg] = useState<string | undefined>(imageUrl);
  const [fadeInQueue, setFadeInQueue] = useState<
    { imageUrl?: string; opacity: number; startTime?: number }[]
  >([]);
  const [fadeOutQueue, setFadeOutQueue] = useState<
    { imageUrl?: string; opacity: number; startTime?: number }[]
  >([]);

  useEffect(() => {
    if (fadeInQueue.length > 0 || fadeOutQueue.length > 0) {
      requestAnimationFrame(animate);
    }
  }, [activeImg, fadeInQueue, fadeOutQueue]);

  const animate = (timestamp: number) => {
    if (fadeInQueue.length > 0) {
      setFadeInQueue(prev => prev
        .map((img) => {
          if (!img.startTime) {
            return { ...img, startTime: img.opacity ? timestamp - (img.opacity * duration) : timestamp };
          }
          const elapsed = timestamp - img.startTime;
          if (elapsed > duration) {
            setActiveImg(img.imageUrl);
            return { ...img, opacity: 1 };
          }
          return { ...img, opacity: elapsed / duration };
        })
        .filter((img) => img.opacity < 1));
    }
    if (fadeOutQueue.length > 0) {
      setFadeOutQueue(prev => prev
        .map((img) => {
          if (!img.startTime) {
            return { ...img, startTime: img.opacity ? timestamp - ((1 - img.opacity) * duration) : timestamp };
          }
          const elapsed = timestamp - img.startTime;
          if (elapsed > duration) {
            return { ...img, opacity: 0 };
          }
          return { ...img, opacity: 1 - elapsed / duration };
        })
        .filter((img) => img.opacity > 0));
    }
  };

  useEffect(() => {
    if (imageUrl !== activeImg) {
      const fadingOut = fadeOutQueue.find((img) => img.imageUrl === imageUrl);
      setFadeInQueue([
        fadingOut
          ? { imageUrl: fadingOut.imageUrl, opacity: fadingOut.opacity }
          : { imageUrl, opacity: 0 },
      ]);
      setFadeOutQueue((prev) =>
        [
          ...prev,
          ...fadeInQueue.map((img) => ({
            imageUrl: img.imageUrl,
            opacity: img.opacity,
          })),
          ...(activeImg ? [{ imageUrl: activeImg, opacity: 1 }] : []),
        ].filter((img) => img.imageUrl !== imageUrl)
      );
      setActiveImg(undefined);
    }
  }, [imageUrl]);

  return [
    ...(activeImg ? [{ imageUrl: activeImg, opacity: 1.0 }] : []),
    ...fadeInQueue.map((img) => ({
      imageUrl: img.imageUrl,
      opacity: img.opacity,
    })),
    ...fadeOutQueue.map((img) => ({
      imageUrl: img.imageUrl,
      opacity: img.opacity,
    })),
  ];
};

interface WallpaperFadeProps extends WallpaperProps {
  transitionDuration?: number;
}

export function WallpaperFade({
  transitionDuration = 1000,
  imageUrl,
  ...props
}: WallpaperFadeProps) {
  const imgState = useImageFade({
    imageUrl: imageUrl || undefined,
    duration: transitionDuration,
  });

  return (
    <>
      {imgState.map((img) => (
        <Wallpaper
          key={img.imageUrl}
          {...props}
          imageUrl={img.imageUrl || null}
          displayOpacity={img.opacity}
        />
      ))}
    </>
  );
}
