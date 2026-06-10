'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/context/AppContext';
import StudentDashboard from '@/features/student/pages/StudentDashboard';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function StudentRoute() {
  const { user } = useAppState();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    } else if (user.roleType !== 'student') {
      router.replace(`/${user.roleType}`);
    }
  }, [user, router]);

  if (!user || user.roleType !== 'student') {
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
      <StudentDashboard />
    </DashboardLayout>
  );
}
