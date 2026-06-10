'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/context/AppContext';
import WardenDashboard from '@/features/warden/pages/WardenDashboard';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function WardenRoute() {
  const { user } = useAppState();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    } else if (user.roleType !== 'warden') {
      router.replace(`/${user.roleType}`);
    }
  }, [user, router]);

  if (!user || user.roleType !== 'warden') {
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
      <WardenDashboard />
    </DashboardLayout>
  );
}
