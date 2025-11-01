'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) {
      // Wait until user status is resolved
      return;
    }

    if (user) {
      // If user is logged in, redirect to dashboard
      router.push('/dashboard');
    } else {
      // If user is not logged in, redirect to login page
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // You can show a loading indicator here while checking auth status
  return (
    <div className="flex h-screen items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}
