import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { getSettings, upsertSettings } from '@/features/settings/service';

// Get user settings
export const GET = withAuth(async (request, { user }) => {
  const settings = await getSettings({ userId: user.id });
  return NextResponse.json(settings);
});

// Create or update settings (upsert)
export const POST = withAuth(async (request, { user }) => {
  const data = await request.json();

  // Service handles validation and transaction
  const settings = await upsertSettings({
    userId: user.id,
    ...data,
  });
  
  return NextResponse.json(settings);
});

