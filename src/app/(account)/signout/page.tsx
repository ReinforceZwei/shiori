'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function SignoutPage() {
  const router = useRouter();

  useEffect(() => {
    const signOut = async () => {
      await authClient.signOut();
      router.push('/');
    };

    signOut();
  }, [router]);

  return null;
}
