'use client';

import { SignupForm } from './components/signup-form';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignupPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <SignupForm />
    </div>
  );
}
