'use client';

import React, { useState } from 'react';
import { useCivicData, CivicProblemItem } from '@/context/CivicDataContext';
import {
  CheckCircle,
  FolderPlus,
  MapPin,
  Users,
  X,
  GraduationCap,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function UniversityPortalPage() {
  const { problems, setSelectedProblem } = useCivicData();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [adoptingChallenge, setAdoptingChallenge] = useState<CivicProblemItem | null>(null);

  const [projectTitle, setProjectTitle] = useState('');
  const [studentCount, setStudentCount] = useState(4);
  const [isAdopting, setIsAdopting] = useState(false);
  const [adoptionSuccess, setAdoptionSuccess] = useState<string | null>(null);

  const filteredProblems = problems.filter((p) => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    return true;
  });

  const handleAdoptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adoptingChallenge) return;
    setIsAdopting(true);

    setTimeout(() => {
      setAdoptionSuccess(`Challenge "${adoptingChallenge.title}" adopted as credited Capstone!`);
      setAdoptingChallenge(null);
      setIsAdopting(false);
      setProjectTitle('');
      setTimeout(() => setAdoptionSuccess(null), 4000);
    }, 400);
  };

  return (
    <div className="space-y-8 w-full max-w-6xl text-slate-900">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              University Innovation Hub &amp; Capstones
            </h2>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black border border-blue-200 uppercase tracking-wide">
              Academic Credits
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Browse verified municipal challenges and adopt them as credited final-year engineering capstones.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800">IIT Delhi / DTU / NSUT Lattice</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 font-black text-[10px]">Active</span>
        </div>
      </div>

      {adoptionSuccess && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-2.5 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{adoptionSuccess}</span>
        </div>
      )}

      {/* Filter Category Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none w-full sm:w-auto -mx-1 px-1">
          {[
            { label: 'All Challenges', value: 'ALL' },
            { label: 'Water & Sanitation', value: 'WATER_SANITATION' },
            { label: 'Infrastructure & Roads', value: 'INFRASTRUCTURE_ROADS' },
            { label: 'Environment & Waste', value: 'ENVIRONMENT_WASTE' },
            { label: 'Energy & Electrical', value: 'ENERGY_POWER' },
            { label: 'Healthcare', value: 'HEALTHCARE' },
          ].map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all border shrink-0 text-xs ${
                selectedCategory === cat.value
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] sm:text-xs text-slate-500 font-bold shrink-0">
          Showing {filteredProblems.length} available challenges
        </span>
      </div>

      {/* Available Challenges 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProblems.map((prob) => {
          const isAdopted = Boolean(prob.assignedUniversity || prob.stage === '3_UNIVERSITY_APPROVED' || prob.stage === '4_PROTOTYPE_SUBMITTED' || prob.stage === '5_SEEKING_FUNDS' || prob.stage === '6_FUNDED_DEPLOYED');

          return (
            <div
              key={prob.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {prob.category.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold bg-amber-100 text-amber-950 px-2 py-0.5 rounded-md border border-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Priority: {prob.priorityScore}/100</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                  {prob.title}
                </h3>

                <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">
                  {prob.description}
                </p>

                <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                  <div>📍 Location: <span className="font-semibold text-slate-700">{prob.address}</span></div>
                  <div>👥 Citizen Reports Clustered: <span className="font-semibold text-slate-700">{prob.reportsCount}</span> ({prob.upvotesCount} upvotes)</div>
                  {prob.assignedUniversity && (
                    <div className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mt-1">
                      🏛️ Assigned: {prob.assignedUniversity}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                {isAdopted ? (
                  <div className="w-full py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>In Active Capstone Prototype</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAdoptingChallenge(prob)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>Adopt as Capstone Project</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Adoption Modal */}
      {adoptingChallenge && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                Adopt Civic Capstone Project
              </h3>
              <button
                type="button"
                onClick={() => setAdoptingChallenge(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs space-y-1">
              <div className="font-bold text-blue-950">{adoptingChallenge.title}</div>
              <div className="text-blue-700">📍 Location: {adoptingChallenge.address}</div>
            </div>

            <form onSubmit={handleAdoptSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Proposed Solution Title
                </label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. IoT Ultrasonic Sensor Rig for Pipeline Rupture Detection"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Student Team Size
                </label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAdoptingChallenge(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdopting}
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-[0.98]"
                >
                  {isAdopting ? 'Assigning...' : 'Confirm Adoption'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
