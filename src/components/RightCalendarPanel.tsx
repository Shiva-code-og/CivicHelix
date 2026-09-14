'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, ExternalLink, Calendar as CalendarIcon } from 'lucide-react';

export default function RightCalendarPanel() {
  const [selectedDay, setSelectedDay] = useState(13);

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const calendarDays = [
    { day: 1, isCurrentMonth: true },
    { day: 2, isCurrentMonth: true },
    { day: 3, isCurrentMonth: true },
    { day: 4, isCurrentMonth: true },
    { day: 5, isCurrentMonth: true },
    { day: 6, isCurrentMonth: true },
    { day: 7, isCurrentMonth: true },
    { day: 8, isCurrentMonth: true },
    { day: 9, isCurrentMonth: true },
    { day: 10, isCurrentMonth: true },
    { day: 11, isCurrentMonth: true },
    { day: 12, isCurrentMonth: true },
    { day: 13, isCurrentMonth: true, hasEvent: true },
    { day: 14, isCurrentMonth: true, hasEvent: true },
    { day: 15, isCurrentMonth: true },
    { day: 16, isCurrentMonth: true },
    { day: 17, isCurrentMonth: true, hasEvent: true },
    { day: 18, isCurrentMonth: true },
    { day: 19, isCurrentMonth: true },
    { day: 20, isCurrentMonth: true, hasEvent: true },
    { day: 21, isCurrentMonth: true },
    { day: 22, isCurrentMonth: true },
    { day: 23, isCurrentMonth: true },
    { day: 24, isCurrentMonth: true },
    { day: 25, isCurrentMonth: true },
    { day: 26, isCurrentMonth: true },
    { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true },
    { day: 29, isCurrentMonth: true },
    { day: 30, isCurrentMonth: true },
    { day: 31, isCurrentMonth: true },
  ];

  const upcomingCivicMilestones = [
    {
      title: 'Water Leak Sensor Field Pilot',
      team: 'IIT Delhi • Team AquaSense',
      category: 'IoT / Water',
      status: 'Field Test',
      statusColor: 'bg-rose-50 text-rose-600 border border-rose-200',
      timeSlot: '10:00 - 11:30 AM',
      location: 'Ward 14 • Okhla',
    },
    {
      title: 'Biogas Digestor Municipal Sign-off',
      team: 'DTU Biotech • Team BioClean',
      category: 'Solid Waste',
      status: 'SLA Review',
      statusColor: 'bg-amber-50 text-amber-600 border border-amber-200',
      timeSlot: '12:00 - 01:00 PM',
      location: 'MCD Zone 3',
    },
    {
      title: 'Tata CSR Grant Disbursal Sync',
      team: 'Tata CSR Board & 4 Universities',
      category: 'CSR Funding',
      status: 'Escrow Tranche 2',
      statusColor: 'bg-cyan-50 text-cyan-600 border border-cyan-200',
      timeSlot: '02:30 - 03:30 PM',
      location: 'Virtual Chamber',
    },
  ];

  return (
    <div className="w-full xl:w-72 2xl:w-80 space-y-5 select-none shrink-0">
      {/* Calendar Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8ECF4] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F3F8]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-[#6C5CE7]">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#1E2238]">March 2026</h3>
              <span className="text-[10px] text-[#8F9BB3] font-medium">SLA Milestone Calendar</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-1 rounded-lg hover:bg-[#F4F5FB] text-[#8F9BB3] hover:text-[#1E2238] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-1 rounded-lg hover:bg-[#F4F5FB] text-[#8F9BB3] hover:text-[#1E2238] transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysOfWeek.map((day, idx) => (
            <span key={idx} className="text-[10px] font-bold text-[#A4B0BE]">
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {calendarDays.map((item, idx) => {
            const isMatch = item.day === selectedDay;

            return (
              <button
                type="button"
                key={idx}
                onClick={() => setSelectedDay(item.day)}
                className={`w-7 h-7 rounded-lg mx-auto flex flex-col items-center justify-center font-semibold text-[11px] transition-all relative ${
                  isMatch
                    ? 'bg-[#6C5CE7] text-white font-bold shadow-xs'
                    : 'text-[#2D3436] hover:bg-[#F4F5FB]'
                }`}
              >
                <span>{item.day}</span>
                {item.hasEvent && !isMatch && (
                  <span className="w-1 h-1 rounded-full bg-[#6C5CE7] absolute bottom-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming Civic Field Milestones Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8ECF4] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F3F8]">
          <div>
            <h3 className="font-bold text-xs text-[#1E2238]">Upcoming Pilots</h3>
            <span className="text-[10px] text-[#8F9BB3] font-medium">
              Today • Wed, 13 Mar 2026
            </span>
          </div>
          <span className="text-[9px] font-bold text-[#6C5CE7] bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            3 Active
          </span>
        </div>

        {/* Schedule Cards */}
        <div className="space-y-3">
          {upcomingCivicMilestones.map((task, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#FBFBFE] border border-[#E8ECF4] hover:border-indigo-200 hover:bg-white transition-all space-y-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-xs text-[#1E2238] group-hover:text-[#6C5CE7] transition-colors leading-snug">
                  {task.title}
                </h4>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${task.statusColor}`}>
                  {task.status}
                </span>
              </div>

              <div className="text-[10px] text-[#8F9BB3] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#636E72] truncate">{task.team}</span>
                  <span className="font-bold text-[#1E2238] flex items-center gap-1 shrink-0 ml-1">
                    <Clock className="w-2.5 h-2.5 text-[#6C5CE7]" />
                    {task.timeSlot}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[#8F9BB3]">
                  <MapPin className="w-2.5 h-2.5 text-[#A4B0BE]" />
                  <span className="truncate">{task.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
