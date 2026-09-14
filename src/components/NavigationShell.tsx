'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import NewTaskModal from '@/components/NewTaskModal';
import UserProfileModal from '@/components/UserProfileModal';

interface NavigationShellProps {
  children: React.ReactNode;
}

export default function NavigationShell({ children }: NavigationShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  // Full-bleed standalone pages that should cover the entire UI without portal navigation
  const isStandalonePage = pathname === '/' || pathname === '/login' || pathname === '/how-it-works';

  // ── Auth Guard: redirect unauthenticated users to /login ──
  useEffect(() => {
    if (!isLoading && !isLoggedIn && !isStandalonePage) {
      router.replace('/login');
    }
  }, [isLoading, isLoggedIn, isStandalonePage, router]);

  if (isStandalonePage) {
    return (
      <div className="w-full min-h-screen">
        {children}
        <UserProfileModal />
      </div>
    );
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 border-3 border-[#1E3A8A] border-t-transparent animate-spin"
            style={{ borderRadius: '50%', borderWidth: '3px' }}
          />
          <span
            className="text-xs font-bold text-slate-500 uppercase tracking-wider"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Authenticating...
          </span>
        </div>
      </div>
    );
  }

  // If not logged in and not standalone, don't render portal (redirect will fire)
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-slate-900 antialiased select-none">
      {/* Static Fixed Left Sidebar for Portal Pages (Immune to window scrolling) */}
      <Sidebar onOpenNewTask={() => setIsNewTaskOpen(true)} />

      {/* Main Content View with Left Padding to accommodate fixed sidebar */}
      <div className="pl-64 flex flex-col min-h-screen min-w-0">
        <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-8 py-5 max-w-[1600px] w-full mx-auto">
          <Header />
          <main className="flex-1 pt-5">{children}</main>
        </div>
      </div>

      {/* Portal Modals */}
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
      />
      <UserProfileModal />
    </div>
  );
}
