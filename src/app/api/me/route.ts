import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { UserService } from '@/features/user/service';
import { maskEmail } from '@/lib/utils/string';

export const GET = withAuth(async (request, { user }) => {
  const userService = new UserService();
  const userData = await userService.getUser(user.id);
  
  if (!userData) {
    // Should never happen, but just in case
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }
  
  // Mask the email before returning
  const maskedUserData = {
    ...userData,
    email: maskEmail(userData.email),
  };
  
  return NextResponse.json(maskedUserData);
});

