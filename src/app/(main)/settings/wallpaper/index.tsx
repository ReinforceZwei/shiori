import { requireUser } from '@/lib/auth';
import { WallpaperService } from '@/features/wallpaper/service';
import WallpaperSettings from './WallpaperSettings';

export default async function WallpaperSection() {
  const user = await requireUser();
  const wallpaperService = new WallpaperService();
  const wallpapersMetadata = await wallpaperService.getAllMetadata({ userId: user.id });

  return <WallpaperSettings initialWallpapers={wallpapersMetadata} />;
}

