'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  Check,
  User,
  GraduationCap,
  Building2,
  Landmark,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Zap,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, setRole, login, isLoggedIn, isLoading } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('GOVT_ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const rolesList: Array<{ role: Role; label: string; icon: React.ElementType; portalPath: string }> = [
    { role: 'CITIZEN', label: 'Citizen', icon: User, portalPath: '/citizen' },
    { role: 'STUDENT', label: 'Student', icon: GraduationCap, portalPath: '/university' },
    { role: 'FACULTY', label: 'Faculty', icon: GraduationCap, portalPath: '/university' },
    { role: 'INDUSTRY', label: 'Industry', icon: Building2, portalPath: '/industry' },
    { role: 'GOVT_ADMIN', label: 'Govt Admin', icon: Landmark, portalPath: '/government' },
  ];

  // If already logged in, redirect to portal
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      const target = getPortalPathForRole(selectedRole);
      router.replace(target);
    }
  }, [isLoading, isLoggedIn]);

  // Handle OAuth redirect callback (Supabase sets hash params on redirect)
  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        // Supabase auto-handles this via onAuthStateChange in AuthContext
        // Just wait for session to be picked up
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const role = (session.user.user_metadata?.role as Role) || 'CITIZEN';
          router.replace(getPortalPathForRole(role));
        }
      }
    };
    handleOAuthCallback();
  }, []);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setRole(role);
  };

  const getPortalPathForRole = (role: Role): string => {
    switch (role) {
      case 'CITIZEN':
        return '/citizen';
      case 'STUDENT':
      case 'FACULTY':
        return '/university';
      case 'INDUSTRY':
        return '/industry';
      case 'GOVT_ADMIN':
      default:
        return '/government';
    }
  };

  // 1-Click Quick Demo Sign-in for immediate testing of any role
  const handleQuickDemoLogin = (role: Role) => {
    setRole(role);
    login(role);
    const target = getPortalPathForRole(role);
    router.push(target);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthMessage(null);

    try {
      if (!email || !password) {
        setAuthMessage({ type: 'error', text: 'Please enter both email and password.' });
        setLoading(false);
        return;
      }

      if (isSignUp) {
        // ── Sign Up ──
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: selectedRole },
          },
        });

        if (error) {
          setAuthMessage({ type: 'error', text: error.message });
          setLoading(false);
          return;
        }

        if (data.user && !data.session) {
          // Email confirmation required
          setAuthMessage({
            type: 'success',
            text: 'Account created! Check your email for a confirmation link.',
          });
          setLoading(false);
          return;
        }

        // Auto-confirmed (dev mode or auto-confirm enabled)
        if (data.session) {
          setAuthMessage({ type: 'success', text: `Welcome! Entering as ${selectedRole}...` });
          setRole(selectedRole);
          const target = getPortalPathForRole(selectedRole);
          setTimeout(() => router.push(target), 500);
          return;
        }
      } else {
        // ── Sign In ──
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If Supabase auth fails, offer demo fallback
          if (error.message.includes('Invalid login') || error.message.includes('invalid_credentials')) {
            setAuthMessage({
              type: 'error',
              text: 'Invalid email or password. Try again or use a 1-click demo portal above.',
            });
          } else {
            setAuthMessage({ type: 'error', text: error.message });
          }
          setLoading(false);
          return;
        }

        if (data.session) {
          const userRole = (data.user?.user_metadata?.role as Role) || selectedRole;
          setRole(userRole);
          setAuthMessage({ type: 'success', text: `Welcome back! Entering as ${userRole}...` });
          const target = getPortalPathForRole(userRole);
          setTimeout(() => router.push(target), 500);
          return;
        }
      }
    } catch (err: any) {
      setAuthMessage({ type: 'error', text: err.message || 'Unexpected authentication error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setAuthMessage(null);
      const target = getPortalPathForRole(selectedRole);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${target}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setAuthMessage({
          type: 'error',
          text: `Google Sign-In failed: ${error.message}. Use email or 1-click demo instead.`,
        });
        setLoading(false);
      }
      // If no error, the browser will redirect to Google OAuth flow
    } catch (err: any) {
      setAuthMessage({
        type: 'error',
        text: 'Google OAuth unavailable. Use email sign-in or 1-click demo portals.',
      });
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col md:flex-row select-none m-0 p-0 overflow-x-hidden relative">
      {/* Back to Home Badge (absolute so it doesn't float over form on mobile scroll) */}
      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/90 hover:bg-white text-slate-800 text-xs font-bold shadow-md border border-slate-200 backdrop-blur-md transition-all hover:scale-105"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
        <span>Back to Home</span>
      </Link>

      {/* =========================================================================
          LEFT HALF: Brand Typography & Unboxed Quote on Rich Civic Blue Gradient
      ========================================================================= */}
      <div className="relative w-full md:w-1/2 min-h-0 md:min-h-screen bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#0F172A] flex flex-col justify-between p-6 pt-16 sm:p-12 lg:p-16 overflow-hidden border-b md:border-b-0 md:border-r border-blue-900 text-white">
        {/* Vertical Amber Accent Pillar on Left Edge */}
        <div className="absolute left-0 top-0 bottom-0 w-2.5 sm:w-4 bg-amber-400 z-10 shadow-lg" />

        {/* Ambient Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/3 w-[380px] h-[380px] bg-blue-400/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-[300px] h-[300px] bg-amber-400/15 blur-[110px] rounded-full pointer-events-none" />

        {/* Center: Hero Quote & Core Mission */}
        <div className="relative z-10 my-auto py-6 sm:py-10 space-y-5 sm:space-y-8 max-w-lg">
          <div className="space-y-2 sm:space-y-3">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-300">
              Transforming Civic Bottlenecks
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              CivicHelix
            </h2>
          </div>

          {/* Unboxed Quote with Sleek Left Accent Line */}
          <div className="relative pl-4 sm:pl-6 border-l-2 border-amber-400/90 space-y-2.5 sm:space-y-3.5">
            <p className="text-sm sm:text-lg text-blue-50/95 font-medium leading-relaxed italic">
              “Civic problems don&apos;t need more paper reports. They need accredited engineering capstones, backed by corporate CSR capital and deployed under verified municipal authority.”
            </p>
            <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="font-extrabold text-amber-300 tracking-wide">
                Triple-Helix Innovation Framework
              </span>
              <span className="text-blue-200/70 text-[10px] sm:text-[11px] font-medium">
                Smart India Hackathon 2026
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="relative z-10 text-[11px] sm:text-xs text-blue-200/70 font-medium flex items-center gap-2 mt-4 md:mt-0">
          <span>Official National SIH 2026 Civic Infrastructure Prototype</span>
        </div>
      </div>

      {/* =========================================================================
          RIGHT HALF: Edge-to-Edge Authentication Form
      ========================================================================= */}
      <div className="w-full md:w-1/2 min-h-screen bg-slate-50/50 flex flex-col justify-center px-4 sm:px-12 lg:px-16 py-8 sm:py-12">
        <div className="max-w-md mx-auto w-full space-y-5 sm:space-y-6">
          
          {/* Header Title */}
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-sm shadow-blue-500/20">
                CH
              </div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-600">
                CivicHelix Access
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
              {isSignUp
                ? 'Sign up to report ward bottlenecks, build prototypes, or fund innovation.'
                : "Hello! Select your role to sign in or use 1-click demo access below."}
            </p>
          </div>

          {/* 1-Click Instant Demo Portals */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 sm:space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                1-Click Instant Test Portals
              </span>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Fast Pass
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {rolesList.map((r, idx) => {
                const Icon = r.icon;
                const isLast = idx === rolesList.length - 1;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleQuickDemoLogin(r.role)}
                    className={`p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-300 text-left transition-all group ${
                      isLast ? 'col-span-2 sm:col-span-1' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 transition-colors shrink-0" />
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate">
                        {r.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Selection Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Select Active Role</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {rolesList.map((r, idx) => {
                const isSelected = selectedRole === r.role;
                const isLast = idx === rolesList.length - 1;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleRoleSelect(r.role)}
                    className={`py-2 px-1.5 rounded-lg text-[11px] font-bold transition-all text-center truncate ${
                      isSelected
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    } ${isLast ? 'col-span-2 sm:col-span-1' : ''}`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Social Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-slate-50/50 px-3 text-[11px] font-semibold text-slate-400 absolute uppercase tracking-wider">
              Or with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Institutional Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="commissioner@delhi.gov.in"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
                  authMessage.type === 'error'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{authMessage.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-500/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2 group"
            >
              <span>{loading ? 'Entering...' : isSignUp ? 'Create Workstation Profile' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Toggle Sign Up / In */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthMessage(null);
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up for Free"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
