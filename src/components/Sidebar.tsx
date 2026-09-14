'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, getRoleAvatarColorHex } from '@/context/AuthContext';
import {
  LayoutGrid,
  Target,
  GraduationCap,
  Building2,
  ShieldAlert,
  Plus,
  Layers,
  ChevronRight,
  X,
} from 'lucide-react';
import { Role } from '@/types';

interface SidebarProps {
  onOpenNewTask?: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ onOpenNewTask, isMobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, setIsProfileOpen } = useAuth();

  const allNavItems = [
    {
      label: 'Civic Dashboard',
      href: '/government',
      icon: LayoutGrid,
      allowedRoles: ['GOVT_ADMIN', 'FACULTY', 'STUDENT', 'INDUSTRY', 'CITIZEN'] as Role[],
    },
    {
      label: 'Citizen Tracking',
      href: '/citizen',
      icon: Target,
      allowedRoles: ['CITIZEN', 'GOVT_ADMIN', 'STUDENT', 'FACULTY'] as Role[],
    },
    {
      label: 'University Capstones',
      href: '/university',
      icon: GraduationCap,
      allowedRoles: ['FACULTY', 'STUDENT', 'GOVT_ADMIN', 'INDUSTRY'] as Role[],
    },
    {
      label: 'Industry CSR Grants',
      href: '/industry',
      icon: Building2,
      allowedRoles: ['INDUSTRY', 'GOVT_ADMIN', 'FACULTY'] as Role[],
    },
  ];

  const toolsNavItems = [
    {
      label: 'Government Command',
      href: '/government',
      icon: ShieldAlert,
      allowedRoles: ['GOVT_ADMIN', 'INDUSTRY'] as Role[],
    },
  ];

  const visibleMainItems = allNavItems.filter((item) => item.allowedRoles.includes(currentUser.role));
  const visibleToolItems = toolsNavItems.filter((item) => item.allowedRoles.includes(currentUser.role));

  return (
    <aside className={`${isMobile ? 'relative' : 'fixed left-0 top-0 bottom-0'} w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/90 flex flex-col justify-between h-screen overflow-y-auto select-none shrink-0 z-40 shadow-xs`}>
      {/* Top Brand & Navigation */}
      <div className="p-5 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <Link href="/" className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
            <Layers className="w-5 h-5 text-white" />
          </Link>
          <div className="min-w-0 flex-1">
            <span className="font-extrabold text-slate-900 text-base tracking-tight leading-none block">
              CivicHelix
            </span>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wide mt-1 truncate">
              Civic Innovation Platform
            </p>
          </div>

          {/* Mobile Close Button */}
          {isMobile && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Report CTA */}
        <button
          type="button"
          onClick={onOpenNewTask}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 transition-all active:scale-[0.98] group"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
          <span>Report Civic Problem</span>
        </button>

        {/* Workstations / Core Navigation */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block">
            Navigation Portals
          </span>
          <nav className="space-y-1">
            {visibleMainItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Administration Tools */}
        {visibleToolItems.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block">
              Governance Tools
            </span>
            <nav className="space-y-1">
              {visibleToolItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Bottom User Snapshot */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          className="w-full p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-3 min-w-0">
            {(() => {
              const avatarColor = getRoleAvatarColorHex(currentUser.role);
              const initials = currentUser.avatarText || currentUser.name.slice(0, 2).toUpperCase() || 'SB';
              return (
                <div
                  style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
                  className="w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 shadow-xs select-none tracking-wide"
                >
                  {initials}
                </div>
              );
            })()}
            <div className="text-left min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 font-medium truncate">
                {currentUser.badgeLabel}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>
      </div>
    </aside>
  );
}
