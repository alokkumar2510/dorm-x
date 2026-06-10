'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/context/AppContext';
import LoginPage from '@/features/auth/pages/LoginPage';

export default function LoginPageContainer() {
  const { user } = useAppState();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace(`/${user.roleType}`);
    }
  }, [user, router]);

  if (user) return null;

  return <LoginPage />;
}
