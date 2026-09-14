'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  X,
  ShieldCheck,
  Building2,
  GraduationCap,
  Users,
  Landmark,
  Layers,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { currentUser, setRole, isLoggedIn } = useAuth();
  const activeRole: Role = currentUser?.role || 'CITIZEN';
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedRoleForJoin, setSelectedRoleForJoin] = useState<Role>(activeRole);

  const getRoleDestination = (r: Role): string => {
    switch (r) {
      case 'CITIZEN':
        return '/citizen';
      case 'STUDENT':
      case 'FACULTY':
        return '/university';
      case 'INDUSTRY':
        return '/industry';
      case 'GOVT_ADMIN':
        return '/government';
      default:
        return '/citizen';
    }
  };

  const workstations = [
    {
      role: 'CITIZEN' as Role,
      title: 'Citizen Portal',
      tagline: 'Geotagged Reporting & Upvoting',
      portalPath: '/citizen',
      icon: Users,
      color: 'hover:border-blue-500 hover:bg-blue-50/50',
    },
    {
      role: 'STUDENT' as Role,
      title: 'Student Innovator Lab',
      tagline: 'Hardware Capstone Prototyping',
      portalPath: '/university',
      icon: GraduationCap,
      color: 'hover:border-amber-500 hover:bg-amber-50/50',
    },
    {
      role: 'FACULTY' as Role,
      title: 'Faculty Research Hub',
      tagline: 'Lab Governance & Milestone Signoff',
      portalPath: '/university',
      icon: Building2,
      color: 'hover:border-indigo-500 hover:bg-indigo-50/50',
    },
    {
      role: 'INDUSTRY' as Role,
      title: 'Industry CSR Grants',
      tagline: 'Escrow Milestone Disbursements',
      portalPath: '/industry',
      icon: Landmark,
      color: 'hover:border-emerald-500 hover:bg-emerald-50/50',
    },
    {
      role: 'GOVT_ADMIN' as Role,
      title: 'Municipal Command',
      tagline: 'SLA Triage & Field Deployment',
      portalPath: '/government',
      icon: ShieldCheck,
      color: 'hover:border-rose-500 hover:bg-rose-50/50',
    },
  ];

  const handleQuickLaunch = (r: Role, path: string) => {
    setRole(r);
    router.push(path);
  };

  const handleConfirmJoin = () => {
    setRole(selectedRoleForJoin);
    setIsJoinModalOpen(false);
    router.push(getRoleDestination(selectedRoleForJoin));
  };

  return (
    <main className="w-full min-h-screen bg-[#FAFAFC] text-slate-900 flex flex-col justify-center items-center px-4 sm:px-8 py-8 sm:py-12 select-none overflow-x-hidden relative">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-100/40 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[500px] h-[300px] bg-amber-100/30 blur-[110px] rounded-full pointer-events-none -z-10" />

      {/* =========================================================================
          TOP NAVBAR: Brand Logo & Actions (Mobile responsive)
      ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-3 sm:py-4 bg-[#FAFAFC]/90 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-500/20">
            CH
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm sm:text-base font-black text-slate-950 tracking-tight leading-none">
              CivicHelix
            </span>
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider leading-none mt-0.5">
              SIH 2026 Grid
            </span>
          </div>
        </Link>

        {/* Right Actions */}
        <div>
          {isLoggedIn ? (
            <Link
              href={getRoleDestination(activeRole)}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 sm:gap-2 active:scale-95 hover:shadow-lg"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white text-slate-800 text-xs font-bold border border-slate-200 shadow-xs hover:shadow-sm transition-all"
              >
                Login
              </Link>
              <button
                type="button"
                onClick={() => setIsJoinModalOpen(true)}
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide shadow-md shadow-blue-500/25 transition-all flex items-center gap-1 active:scale-95"
              >
                <span>Select Role</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="w-full max-w-6xl mx-auto flex flex-col items-center text-center pt-16 sm:pt-20 pb-8">
        
        {/* =========================================================================
            THE ALIEN DESIGN HERO EDITORIAL TYPOGRAPHY (Responsive & Non-overlapping)
        ========================================================================= */}
        <div className="space-y-4 sm:space-y-6 max-w-5xl tracking-tight mt-4 sm:mt-8 w-full">
          
          {/* Main Hero Headline Row 1 */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-950 uppercase leading-none">
            <span>Engineering</span>
            
            {/* Dark Marquee Box */}
            <div className="relative inline-flex items-center overflow-hidden bg-slate-950 text-white rounded-lg sm:rounded-xl px-2.5 sm:px-6 py-1 sm:py-3.5 shadow-xl border border-slate-800 max-w-[170px] xs:max-w-[210px] sm:max-w-[340px] h-[34px] xs:h-[40px] sm:h-[68px]">
              <div className="animate-marquee whitespace-nowrap text-[9px] xs:text-[11px] sm:text-base font-black tracking-wider text-amber-300 flex items-center gap-3 sm:gap-4">
                <span>★ TRIPLE-HELIX VERIFIED</span>
                <span>★ NO PAPER REPORTS</span>
                <span>★ REAL HARDWARE</span>
                <span>★ TRIPLE-HELIX VERIFIED</span>
                <span>★ NO PAPER REPORTS</span>
                <span>★ REAL HARDWARE</span>
              </div>
            </div>

            <span>Civic</span>
          </div>

          {/* Main Hero Headline Row 2 */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-950 uppercase leading-none">
            <span>Solutions</span>
            
            {/* Radiant Yellow Marquee Box */}
            <div className="relative inline-flex items-center overflow-hidden bg-amber-400 text-slate-950 rounded-lg sm:rounded-xl px-2.5 sm:px-6 py-1 sm:py-3.5 shadow-xl border border-amber-300 max-w-[180px] xs:max-w-[220px] sm:max-w-[360px] h-[34px] xs:h-[40px] sm:h-[68px]">
              <div className="animate-marquee-reverse whitespace-nowrap text-[9px] xs:text-[11px] sm:text-base font-black tracking-wider text-slate-950 flex items-center gap-3 sm:gap-4">
                <span>★ STUDENT CAPSTONES</span>
                <span>★ CSR ESCROW GRANTS</span>
                <span>★ MUNICIPAL INFRA</span>
                <span>★ STUDENT CAPSTONES</span>
                <span>★ CSR ESCROW GRANTS</span>
                <span>★ MUNICIPAL INFRA</span>
              </div>
            </div>

            <span>To Reality</span>
          </div>
        </div>

        {/* Subtitle */}
        <div className="mt-6 sm:mt-8 max-w-2xl mx-auto px-2">
          <p className="text-sm sm:text-lg text-slate-600 font-medium leading-relaxed">
            We bridge citizens reporting ground municipal bottlenecks, engineering university teams engineering verifiable hardware prototypes, and industry CSR funds disbursing milestone grants.
          </p>
        </div>

        {/* Not Logged In Quick Role Launch Pills (Shown only when unauthenticated) */}
        {!isLoggedIn && (
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-2 max-w-xl px-2">
            {workstations.map((ws) => {
              const Icon = ws.icon;
              return (
                <button
                  key={ws.role}
                  type="button"
                  onClick={() => handleQuickLaunch(ws.role, ws.portalPath)}
                  className={`px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-[11px] sm:text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 ${ws.color}`}
                >
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{ws.title}</span>
                </button>
              );
            })}
          </div>
        )}

      </div>

      {/* =========================================================================
          ROLE-BASED JOIN MODAL (Triggered when user clicks "Select Role")
      ========================================================================= */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-200 text-left">
            
            {/* Close Button */}
            <button
              onClick={() => setIsJoinModalOpen(false)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 mx-auto flex items-center justify-center text-xl mb-3 shadow-xs">
                🤝
              </div>
              <h3 className="text-2xl font-black text-slate-950 tracking-tight">
                Select Your Workstation
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Activate your personalized role in the Triple-Helix civic ecosystem.
              </p>
            </div>

            {/* Role Options */}
            <div className="space-y-2.5 mb-6">
              {workstations.map((item) => {
                const isSelected = selectedRoleForJoin === item.role;
                const Icon = item.icon;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setSelectedRoleForJoin(item.role)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[260px]">
                          {item.tagline}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <span className="text-[10px] font-bold">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Continue Button */}
            <button
              onClick={handleConfirmJoin}
              className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold tracking-wide shadow-md hover:shadow-lg transition-all"
            >
              Continue to Workstation
            </button>

          </div>
        </div>
      )}

    </main>
  );
}
