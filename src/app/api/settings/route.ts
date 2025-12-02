import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { SettingsService } from '@/features/settings/service';

// Get user settings
export const GET = withAuth(async (request, { user }) => {
  const settingsService = new SettingsService();
  const settings = await settingsService.get({ userId: user.id });
  return NextResponse.json(settings);
});

// Create or update settings (upsert)
export const POST = withAuth(async (request, { user }) => {
  const data = await request.json();

  const settingsService = new SettingsService();
  // Service handles validation and transaction
  const settings = await settingsService.upsert({
    userId: user.id,
    ...data,
  });
  
  return NextResponse.json(settings);
});

