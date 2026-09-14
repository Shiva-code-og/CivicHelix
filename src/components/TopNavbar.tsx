'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutGrid,
  MapPin,
  GraduationCap,
  Building2,
  Plus,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  Zap,
} from 'lucide-react';
import { Role } from '@/types';

interface TopNavbarProps {
  onOpenNewTask?: () => void;
}

export default function TopNavbar({ onOpenNewTask }: TopNavbarProps) {
  const pathname = usePathname();
  const { currentUser, setIsProfileOpen } = useAuth();

  const navLinks = [
    {
      label: 'Civic Command',
      href: '/government',
      icon: LayoutGrid,
      desc: 'Triage & Deployment',
    },
    {
      label: 'Citizen Ingestion',
      href: '/citizen',
      icon: MapPin,
      desc: 'GPS, OCR & Voice Reports',
    },
    {
      label: 'University Hub',
      href: '/university',
      icon: GraduationCap,
      desc: 'Student Proposals & Lab R&D',
    },
    {
      label: 'Industry CSR Grants',
      href: '/industry',
      icon: Building2,
      desc: 'Milestone Funding & ESG',
    },
  ];

  return (
    <header className="w-full bg-[#FFFFFF] border-b border-[#E5E7EB] sticky top-0 z-40 shadow-xs">
      {/* Top Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#0C4A23] text-[#FBF7EE] flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                CH
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-[#14281D]">
                  Civic<span className="text-[#1F6F3A]">Helix</span>
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.2 rounded-md bg-[#EAE3CA]/60 text-[#0C4A23] text-[9px] font-bold tracking-wider uppercase">
                  Triple-Helix
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 ml-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#FBF7EE] text-[#0C4A23] border border-[#EAE3CA] shadow-xs'
                        : 'text-[#475569] hover:text-[#14281D] hover:bg-[#F8F9FA]'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isActive ? 'text-[#0C4A23]' : 'text-[#64748B]'
                      }`}
                    />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Quick Report Civic Problem CTA */}
            <button
              type="button"
              onClick={onOpenNewTask}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0C4A23] hover:bg-[#1F6F3A] text-[#FBF7EE] text-xs font-bold transition-all shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report Problem</span>
            </button>

            {/* User Profile & Role Pill Switcher */}
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#0C4A23] hover:shadow-xs transition-all text-left"
              title="Click to switch role or view profile"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-[#14281D] leading-tight truncate max-w-[130px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] font-semibold text-[#1F6F3A] leading-tight truncate max-w-[130px]">
                  {currentUser.badgeLabel}
                </div>
              </div>

              <div className="relative">
                <div
                  className={`w-8 h-8 rounded-lg ${currentUser.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-xs`}
                >
                  {currentUser.avatarText}
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 border border-white absolute -bottom-0.5 -right-0.5" />
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto py-2 border-t border-[#F1F5F9] scrollbar-none text-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap text-[11px] font-bold transition-all ${
                  isActive
                    ? 'bg-[#FBF7EE] text-[#0C4A23] border border-[#EAE3CA]'
                    : 'text-[#475569] hover:bg-gray-50'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
