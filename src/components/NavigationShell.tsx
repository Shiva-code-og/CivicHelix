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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Full-bleed standalone pages that should cover the entire UI without portal navigation
  const isStandalonePage = pathname === '/' || pathname === '/login' || pathname === '/how-it-works';

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileSidebarOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSidebarOpen]);

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
      {/* ====== MOBILE SIDEBAR OVERLAY ====== */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Desktop Fixed Left Sidebar (hidden on mobile) */}
      <div className="hidden lg:block">
        <Sidebar onOpenNewTask={() => setIsNewTaskOpen(true)} />
      </div>

      {/* Mobile Slide-In Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-[60] lg:hidden transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          onOpenNewTask={() => {
            setIsNewTaskOpen(true);
            setIsMobileSidebarOpen(false);
          }}
          isMobile
          onClose={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Content View — left padding only on desktop for fixed sidebar */}
      <div className="lg:pl-64 flex flex-col min-h-screen min-w-0">
        <div className="flex-1 flex flex-col px-3 sm:px-4 lg:px-8 py-3 sm:py-5 max-w-[1600px] w-full mx-auto">
          <Header onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
          <main className="flex-1 pt-3 sm:pt-5">{children}</main>
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
