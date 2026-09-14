'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ShieldCheck,
  Calendar,
  Command,
  SlidersHorizontal,
  X,
  Check,
  CheckCheck,
  Building,
  GraduationCap,
  MapPin,
  Tag,
  AlertTriangle,
  Award,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Coins,
  Landmark,
} from 'lucide-react';
import { useAuth, getRoleAvatarColorHex } from '@/context/AuthContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'ALERT' | 'PROTOTYPE' | 'GRANT' | 'MUNICIPAL';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Water Pipeline Rupture Escalated',
    message: 'Sector 4 Rohini feeder burst marked critical (Priority 94.5). Immediate ward dispatch requested.',
    time: '4m ago',
    read: false,
    type: 'ALERT',
  },
  {
    id: 'n2',
    title: 'IIT Delhi Capstone Benchmark Ready',
    message: 'Acoustic clamp-on leak detector achieved 98.2% pinpoint accuracy in hydraulic testing.',
    time: '24m ago',
    read: false,
    type: 'PROTOTYPE',
  },
  {
    id: 'n3',
    title: 'Tata CSR Released ₹2,50,000 Milestone',
    message: 'First tranche disbursed to escrow for university clean water sensor batch deployment.',
    time: '1h ago',
    read: false,
    type: 'GRANT',
  },
  {
    id: 'n4',
    title: 'Okhla Road Crater Cluster Repaired',
    message: 'Municipal engineering team validated automated pothole scan and completed cold-mix resurfacing.',
    time: '3h ago',
    read: true,
    type: 'MUNICIPAL',
  },
];

const FILTER_CATEGORIES = {
  companies: [
    { label: 'Tata Motors CSR', count: 4 },
    { label: 'Infosys Foundation', count: 3 },
    { label: 'Reliance CSR', count: 2 },
    { label: 'L&T Public Infra', count: 2 },
  ],
  universities: [
    { label: 'IIT Delhi', count: 5 },
    { label: 'DTU Delhi', count: 3 },
    { label: 'NIT Warangal', count: 2 },
    { label: 'BITS Pilani', count: 2 },
  ],
  locations: [
    { label: 'Sector 4, Rohini', count: 3 },
    { label: 'Ward 12, Uppal', count: 2 },
    { label: 'Okhla Phase III', count: 4 },
    { label: 'Indirapuram', count: 2 },
  ],
  sectors: [
    { label: 'Water Sanitation', count: 6 },
    { label: 'Roads & Traffic', count: 5 },
    { label: 'Environment & Waste', count: 3 },
    { label: 'Clean Energy', count: 2 },
  ],
};

export default function Header({
  title = 'Civic Command Dashboard',
  subtitle = 'Civic infrastructure & university capstone collaboration platform',
}: HeaderProps) {
  const { currentUser, setIsProfileOpen } = useAuth();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<{ type: string; value: string } | null>(null);

  // Notification State
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<'ALL' | 'UNREAD'>('ALL');

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsFilterMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleSelectFilter = (type: string, value: string) => {
    if (activeFilter?.type === type && activeFilter.value === value) {
      setActiveFilter(null);
    } else {
      setActiveFilter({ type, value });
      setSearchQuery(value);
    }
    setIsFilterMenuOpen(false);
  };

  const clearFilter = () => {
    setActiveFilter(null);
    setSearchQuery('');
  };

  const filteredNotifications = notifications.filter((n) => {
    if (notifTab === 'UNREAD') return !n.read;
    return true;
  });

  return (
    <header className="w-full flex items-center justify-between gap-4 pb-4 border-b border-slate-200 relative z-30">
      {/* Page Title & Clean Subtitle (No clutter badges) */}
      <div className="min-w-max">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-xs text-slate-500 font-medium hidden md:block mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Right Actions Cluster */}
      <div className="flex items-center gap-2.5 shrink-0">
        
        {/* =========================================================================
            ADVANCED SEARCH & FILTRATION (Companies, Locations, Universities, Sectors)
        ========================================================================= */}
        <div ref={searchRef} className="relative hidden lg:block w-72 xl:w-80">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!isFilterMenuOpen) setIsFilterMenuOpen(true);
              }}
              onFocus={() => setIsFilterMenuOpen(true)}
              placeholder="Search companies, locations, universities..."
              className="w-full pl-9 pr-16 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
            />

            {/* Filter Toggle Button */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {activeFilter ? (
                <button
                  type="button"
                  onClick={clearFilter}
                  title="Clear filter"
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                  title="Filter options"
                  className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all ${
                    isFilterMenuOpen
                      ? 'bg-blue-50 text-blue-600 border-blue-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <SlidersHorizontal className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Pill indicator */}
          {activeFilter && (
            <div className="absolute -bottom-6 left-0 flex items-center gap-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              <span>Filtered by: {activeFilter.value}</span>
              <button onClick={clearFilter} className="hover:text-rose-600">
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          {/* Filtration Dropdown Popover */}
          {isFilterMenuOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                  <span>Filter Directory</span>
                </div>
                {activeFilter && (
                  <button
                    type="button"
                    onClick={clearFilter}
                    className="text-[10px] font-bold text-rose-600 hover:underline"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {/* Companies / CSR Sponsors */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <Building className="w-3 h-3 text-blue-600" />
                  <span>Companies &amp; CSR Sponsors</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {FILTER_CATEGORIES.companies.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => handleSelectFilter('COMPANY', c.label)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        activeFilter?.value === c.label
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Universities & Labs */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <GraduationCap className="w-3 h-3 text-amber-500" />
                  <span>Universities &amp; Labs</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {FILTER_CATEGORIES.universities.map((u) => (
                    <button
                      key={u.label}
                      type="button"
                      onClick={() => handleSelectFilter('UNIVERSITY', u.label)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        activeFilter?.value === u.label
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Locations & Areas */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>Locations &amp; Ward Areas</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {FILTER_CATEGORIES.locations.map((loc) => (
                    <button
                      key={loc.label}
                      type="button"
                      onClick={() => handleSelectFilter('LOCATION', loc.label)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        activeFilter?.value === loc.label
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50/50'
                      }`}
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sectors */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <Tag className="w-3 h-3 text-emerald-500" />
                  <span>Problem Sectors</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {FILTER_CATEGORIES.sectors.map((sec) => (
                    <button
                      key={sec.label}
                      type="button"
                      onClick={() => handleSelectFilter('SECTOR', sec.label)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        activeFilter?.value === sec.label
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                      }`}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SLA Pulse Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-semibold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span className="text-[11px] font-bold text-slate-800">99.2% SLA</span>
        </div>

        {/* Date Pill */}
        <div className="hidden 2xl:flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-semibold text-slate-800">
          <Calendar className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] text-slate-600">13 Mar 2026</span>
        </div>

        {/* =========================================================================
            INTERACTIVE NOTIFICATION BELL & NOTIFICATION CENTER
        ========================================================================= */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative p-2.5 rounded-xl border transition-colors shadow-xs ${
              isNotifOpen
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
            }`}
            title={`${unreadCount} Unread Civic Alerts`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-extrabold absolute -top-1.5 -right-1.5 ring-2 ring-white flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Dropdown Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark read</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Tabs (All / Unread) */}
              <div className="flex border-b border-slate-100 bg-white px-3 pt-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setNotifTab('ALL')}
                  className={`pb-2 px-3 font-bold border-b-2 transition-all ${
                    notifTab === 'ALL'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNotifTab('UNREAD')}
                  className={`pb-2 px-3 font-bold border-b-2 transition-all ${
                    notifTab === 'UNREAD'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Notifications List */}
              <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <Check className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-50" />
                    <span>No notifications in this tab</span>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleToggleRead(notif.id)}
                      className={`p-3.5 text-left transition-colors cursor-pointer flex items-start gap-3 ${
                        notif.read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/70'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {notif.type === 'ALERT' && (
                          <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-2xs">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                        )}
                        {notif.type === 'PROTOTYPE' && (
                          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-2xs">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                        )}
                        {notif.type === 'GRANT' && (
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-2xs">
                            <Coins className="w-4 h-4" />
                          </div>
                        )}
                        {notif.type === 'MUNICIPAL' && (
                          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shadow-2xs">
                            <Landmark className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-xs truncate ${notif.read ? 'font-bold text-slate-700' : 'font-extrabold text-slate-900'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-snug">
                          {notif.message}
                        </p>
                      </div>

                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={handleClearNotifications}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    Clear all
                  </button>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Click any alert to toggle read state
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Persona Switcher Quick Trigger */}
        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-all shadow-xs group"
        >
          {(() => {
            const avatarColor = getRoleAvatarColorHex(currentUser.role);
            const initials = currentUser.avatarText || currentUser.name.slice(0, 2).toUpperCase() || 'SB';
            return (
              <div
                style={{ backgroundColor: avatarColor.bg, color: avatarColor.text }}
                className="w-7 h-7 rounded-lg font-black text-[11px] flex items-center justify-center shadow-xs select-none tracking-wide"
              >
                {initials}
              </div>
            );
          })()}
          <div className="text-left hidden sm:block">
            <span className="text-[11px] font-bold text-slate-800 block leading-tight">
              {currentUser.name.split(' ')[0]}
            </span>
            <span className="text-[9px] font-bold text-blue-600 block leading-none">
              {currentUser.badgeLabel}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}
