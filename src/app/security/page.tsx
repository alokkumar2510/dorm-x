'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/context/AppContext';
import SecurityDashboard from '@/features/security/pages/SecurityDashboard';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function SecurityRoute() {
  const { user } = useAppState();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    } else if (user.roleType !== 'security') {
      router.replace(`/${user.roleType}`);
    }
  }, [user, router]);

  if (!user || user.roleType !== 'security') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p className="text-xs uppercase tracking-[0.3em] font-black animate-pulse">
          Establishing Secure Link...
        </p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <SecurityDashboard />
    </DashboardLayout>
  );
}
