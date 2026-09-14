'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Role } from '@/types';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  institutionName: string;
  department?: string;
  avatarText: string;
  avatarBg: string;
  badgeLabel: string;
}

export const DEMO_PROFILES: Record<Role, UserProfile> = {
  GOVT_ADMIN: {
    id: 'user-govt-001',
    name: 'Samala',
    email: 'commissioner@delhi.gov.in',
    role: 'GOVT_ADMIN',
    institutionName: 'Municipal Corporation & District Administration',
    department: 'Urban Governance & Disaster Cell',
    avatarText: 'S',
    avatarBg: 'bg-emerald-600',
    badgeLabel: 'Municipal Admin',
  },
  FACULTY: {
    id: 'user-faculty-001',
    name: 'Prof. K. Sharma',
    email: 'k.sharma@civil.iitd.ac.in',
    role: 'FACULTY',
    institutionName: 'IIT Delhi',
    department: 'Civil & Environmental Engineering',
    avatarText: 'KS',
    avatarBg: 'bg-indigo-600',
    badgeLabel: 'Faculty Lead',
  },
  STUDENT: {
    id: 'user-student-001',
    name: 'Rohan Gupta',
    email: 'rohan.btech@iitd.ac.in',
    role: 'STUDENT',
    institutionName: 'IIT Delhi',
    department: 'Final Year B.Tech Capstone',
    avatarText: 'RG',
    avatarBg: 'bg-blue-600',
    badgeLabel: 'Student Innovator',
  },
  INDUSTRY: {
    id: 'user-industry-001',
    name: 'Vikramaditya Tata',
    email: 'v.tata@tatatrusts.org',
    role: 'INDUSTRY',
    institutionName: 'Tata Sustainability & Civic Trust',
    department: 'CSR Grant Allocation Board',
    avatarText: 'VT',
    avatarBg: 'bg-amber-600',
    badgeLabel: 'CSR Partner',
  },
  CITIZEN: {
    id: 'user-citizen-001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    role: 'CITIZEN',
    institutionName: 'Resident Welfare Association',
    department: 'Sector 4, Rohini Community',
    avatarText: 'AS',
    avatarBg: 'bg-blue-600',
    badgeLabel: 'Active Citizen',
  },
};

// Badge labels by role
const ROLE_BADGES: Record<Role, string> = {
  GOVT_ADMIN: 'Municipal Admin',
  FACULTY: 'Faculty Lead',
  STUDENT: 'Student Innovator',
  INDUSTRY: 'CSR Partner',
  CITIZEN: 'Active Citizen',
};

// Avatar colors by role
const ROLE_COLORS: Record<Role, string> = {
  GOVT_ADMIN: 'bg-emerald-600',
  FACULTY: 'bg-indigo-600',
  STUDENT: 'bg-blue-600',
  INDUSTRY: 'bg-amber-600',
  CITIZEN: 'bg-blue-600',
};

export function getRoleAvatarColorHex(role: Role = 'CITIZEN'): { bg: string; text: string } {
  switch (role) {
    case 'GOVT_ADMIN':
      return { bg: '#059669', text: '#ffffff' };
    case 'FACULTY':
      return { bg: '#4f46e5', text: '#ffffff' };
    case 'STUDENT':
      return { bg: '#2563eb', text: '#ffffff' };
    case 'INDUSTRY':
      return { bg: '#d97706', text: '#ffffff' };
    case 'CITIZEN':
    default:
      return { bg: '#2563eb', text: '#ffffff' };
  }
}

function buildProfileFromSupabaseUser(user: SupabaseUser, role: Role): UserProfile {
  const meta = user.user_metadata || {};
  const fullName = meta.full_name || meta.name || user.email?.split('@')[0] || 'User';
  const initials = fullName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return {
    id: user.id,
    name: fullName,
    email: user.email || '',
    role,
    institutionName: meta.institution || 'CivicHelix Platform',
    department: meta.department || undefined,
    avatarText: initials,
    avatarBg: ROLE_COLORS[role],
    badgeLabel: ROLE_BADGES[role],
  };
}

interface AuthContextType {
  currentUser: UserProfile;
  supabaseUser: SupabaseUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (role?: Role) => void;
  logout: () => Promise<void>;
  setRole: (role: Role) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  isAuthorized: (allowedRoles: Role[]) => boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<Role>('GOVT_ADMIN');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // ──────────────────────────────────────────────
  // 1. Check existing Supabase session on mount
  // ──────────────────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for existing Supabase session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setSupabaseUser(session.user);
          const userRole = (session.user.user_metadata?.role as Role) || 'CITIZEN';
          const validRoles: Role[] = ['CITIZEN', 'STUDENT', 'FACULTY', 'INDUSTRY', 'GOVT_ADMIN'];
          setCurrentRole(validRoles.includes(userRole) ? userRole : 'CITIZEN');
          setIsLoggedIn(true);
          setIsDemoMode(false);
        } else {
          // Check for demo/localStorage session
          const savedRole = localStorage.getItem('civic_user_role') as Role | null;
          const demoLoggedIn = localStorage.getItem('civic_logged_in') === 'true';

          if (savedRole && DEMO_PROFILES[savedRole]) {
            setCurrentRole(savedRole);
          }
          if (demoLoggedIn) {
            setIsLoggedIn(true);
            setIsDemoMode(true);
          }
        }

        // Load theme preference
        const savedTheme = localStorage.getItem('civic_theme') as 'light' | 'dark' | null;
        if (savedTheme) {
          setTheme(savedTheme);
          document.documentElement.setAttribute('data-theme', savedTheme);
          document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        }
      } catch (err) {
        console.warn('Auth init error:', err);
        // Fall back to localStorage demo mode
        const savedRole = localStorage.getItem('civic_user_role') as Role | null;
        if (savedRole && DEMO_PROFILES[savedRole]) {
          setCurrentRole(savedRole);
        }
        if (localStorage.getItem('civic_logged_in') === 'true') {
          setIsLoggedIn(true);
          setIsDemoMode(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ──────────────────────────────────────────────
  // 2. Listen for Supabase auth state changes (OAuth redirects, token refresh)
  // ──────────────────────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setSupabaseUser(session.user);
          const userRole = (session.user.user_metadata?.role as Role) || currentRole;
          const validRoles: Role[] = ['CITIZEN', 'STUDENT', 'FACULTY', 'INDUSTRY', 'GOVT_ADMIN'];
          if (validRoles.includes(userRole)) {
            setCurrentRole(userRole);
          }
          setIsLoggedIn(true);
          setIsDemoMode(false);
          localStorage.setItem('civic_logged_in', 'true');
          localStorage.setItem('civic_user_role', userRole);
        } else if (event === 'SIGNED_OUT') {
          setSupabaseUser(null);
          setIsLoggedIn(false);
          setIsDemoMode(false);
          localStorage.removeItem('civic_logged_in');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [currentRole]);

  // ──────────────────────────────────────────────
  // Theme toggle
  // ──────────────────────────────────────────────
  const toggleTheme = useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('civic_theme', next);
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  }, [theme]);

  // ──────────────────────────────────────────────
  // Role management
  // ──────────────────────────────────────────────
  const handleSetRole = useCallback((role: Role) => {
    setCurrentRole(role);
    localStorage.setItem('civic_user_role', role);

    // If real Supabase user, update their metadata
    if (supabaseUser) {
      supabase.auth.updateUser({ data: { role } }).catch(() => {});
    }
  }, [supabaseUser]);

  // ──────────────────────────────────────────────
  // Demo login (no Supabase)
  // ──────────────────────────────────────────────
  const login = useCallback((role?: Role) => {
    if (role) {
      setCurrentRole(role);
      localStorage.setItem('civic_user_role', role);
    }
    setIsLoggedIn(true);
    setIsDemoMode(true);
    localStorage.setItem('civic_logged_in', 'true');
  }, []);

  // ──────────────────────────────────────────────
  // Logout (clears both Supabase + demo)
  // ──────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      if (supabaseUser) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    setSupabaseUser(null);
    setIsLoggedIn(false);
    setIsDemoMode(false);
    localStorage.removeItem('civic_logged_in');
    localStorage.removeItem('civic_user_role');
  }, [supabaseUser]);

  // ──────────────────────────────────────────────
  // Build current user profile
  // ──────────────────────────────────────────────
  const currentUser: UserProfile = supabaseUser
    ? buildProfileFromSupabaseUser(supabaseUser, currentRole)
    : DEMO_PROFILES[currentRole];

  const isAuthorized = useCallback((allowedRoles: Role[]) => {
    return allowedRoles.includes(currentRole);
  }, [currentRole]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        supabaseUser,
        isLoggedIn,
        isLoading,
        isDemoMode,
        login,
        logout,
        setRole: handleSetRole,
        isProfileOpen,
        setIsProfileOpen,
        isAuthorized,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
