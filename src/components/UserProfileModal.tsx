'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getRoleAvatarColorHex } from '@/context/AuthContext';
import { Role } from '@/types';
import {
  X,
  ShieldCheck,
  Check,
  LogOut,
  Landmark,
  GraduationCap,
  Sparkles,
  Building2,
  Users,
} from 'lucide-react';

export default function UserProfileModal() {
  const router = useRouter();
  const { currentUser, setRole, isProfileOpen, setIsProfileOpen, logout } = useAuth();

  if (!isProfileOpen) return null;

  const rolesList: Role[] = ['GOVT_ADMIN', 'FACULTY', 'STUDENT', 'INDUSTRY', 'CITIZEN'];

  const roleCardMeta: Record<Role, { title: string; subtitle: string; icon: React.ElementType; color: string }> = {
    GOVT_ADMIN: {
      title: 'Municipal Command',
      subtitle: 'Triage, field deployment & SLA sign-off',
      icon: Landmark,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    FACULTY: {
      title: 'Faculty Lead',
      subtitle: 'Capstone mentorship & lab accreditation',
      icon: GraduationCap,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    STUDENT: {
      title: 'Student Innovator',
      subtitle: 'Hardware prototype engineering',
      icon: Sparkles,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    INDUSTRY: {
      title: 'Industry CSR Partner',
      subtitle: 'Milestone grants & escrow funding',
      icon: Building2,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    CITIZEN: {
      title: 'Active Citizen',
      subtitle: 'Verified local bottleneck reporting',
      icon: Users,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    router.push('/login');
  };

  const handleSwitchRole = (role: Role) => {
    setRole(role);
  };

  const avatarColor = getRoleAvatarColorHex(currentUser.role);
  const initials = currentUser.avatarText || currentUser.name.slice(0, 2).toUpperCase() || 'SB';

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">
              User Profile &amp; Role Switcher
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsProfileOpen(false)}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Profile Card with High-Contrast Visible Avatar */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
          <div
            style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-md shrink-0 ring-2 ring-white/50 select-none tracking-wider"
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-base text-slate-900 truncate">{currentUser.name}</h4>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60 shadow-2xs">
                {currentUser.badgeLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">{currentUser.email}</p>
            <p className="text-xs text-slate-600 font-medium mt-1 truncate">
              {currentUser.institutionName}{currentUser.department ? ` • ${currentUser.department}` : ''}
            </p>
          </div>
        </div>

        {/* Switch Persona Role */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Switch Persona Role
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {rolesList.map((r) => {
              const meta = roleCardMeta[r];
              const Icon = meta.icon;
              const isSelected = currentUser.role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleSwitchRole(r)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="mt-3">
                    <div className="font-extrabold text-xs text-slate-900 leading-tight">
                      {meta.title}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-snug font-medium">
                      {meta.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleLogout}
            className="py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>

          <button
            type="button"
            onClick={() => setIsProfileOpen(false)}
            className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            Save &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
}
