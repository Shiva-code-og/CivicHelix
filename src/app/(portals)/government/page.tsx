'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCivicData, CivicProblemItem } from '@/context/CivicDataContext';
import InteractiveCivicMap from '@/components/InteractiveCivicMap';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Building2,
  Landmark,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface PrototypeReviewItem {
  id: string;
  projectTitle: string;
  university: string;
  category: string;
  milestoneTitle: string;
  submittedProofUrl: string;
  studentTeamLead: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REVISED';
}

export default function GovernmentCommandPortalPage() {
  const { currentUser } = useAuth();
  const { problems, selectedProblem, setSelectedProblem, upvoteProblem } = useCivicData();

  const [prototypes, setPrototypes] = useState<PrototypeReviewItem[]>([
    {
      id: 'proto-01',
      projectTitle: 'IoT Ultrasonic Acoustic Pipeline Leak Detector',
      university: 'IIT Delhi Civil & Environmental Lab',
      category: 'WATER_SANITATION',
      milestoneTitle: 'Milestone 2: Hardware Sensor Telemetry & Rig Test',
      submittedProofUrl: 'https://github.com/iitd-civic-leak-iot/sensor-firmware',
      studentTeamLead: 'Rohan Verma (M.Tech Environmental Engg)',
      status: 'PENDING_REVIEW',
    },
    {
      id: 'proto-02',
      projectTitle: 'Cold-Chain Solar Inverter with LFP Battery Backup',
      university: 'AIIMS Biomedical & DTU Mechatronics',
      category: 'HEALTHCARE',
      milestoneTitle: 'Milestone 3: 72-Hour Thermal Hold Validation',
      submittedProofUrl: 'https://drive.google.com/open?id=coldchain_test_results',
      studentTeamLead: 'Ananya Sharma (B.Tech Mechanical & Biotech)',
      status: 'APPROVED',
    },
  ]);

  const [triageFilter, setTriageFilter] = useState<'ALL' | 'CRITICAL' | 'ADOPTED'>('ALL');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const handleApprovePrototype = (id: string) => {
    setPrototypes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'APPROVED' } : item))
    );
    setActionSuccessMsg(`Prototype Milestone approved. CSR Milestone grant disbursement triggered!`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleEscalateSLA = (problemId: string) => {
    setActionSuccessMsg(`Problem ${problemId} escalated & assigned to IIT Delhi Lab.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleDeployFix = (problemId: string) => {
    setActionSuccessMsg(`Problem ${problemId} marked as DEPLOYED & RESOLVED by Municipal Body.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const filteredProblems = problems.filter((p) => {
    if (triageFilter === 'CRITICAL') return p.priorityScore >= 90;
    if (triageFilter === 'ADOPTED') return Boolean(p.assignedUniversity);
    return true;
  });

  return (
    <div className="space-y-8 w-full max-w-7xl text-slate-900">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Municipal Command &amp; Civic Triage Grid
            </h2>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black border border-blue-200 uppercase tracking-wide">
              Govt Authority
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Real-time geospatial bottleneck tracking, priority escalation, and academic capstone prototype sign-off.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-800">Active SLA Grid: Delhi NCT</span>
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-2.5 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* =========================================================================
          1. INTERACTIVE MUNICIPAL MAP
      ========================================================================= */}
      <InteractiveCivicMap />

      {/* =========================================================================
          2. LIVE TRIAGE QUEUE & SELECTED PROBLEM ACTIONS (Picture 2 Redesigned with White, Blue & Yellow)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem Statements Queue */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  Active Civic Bottlenecks Queue ({filteredProblems.length})
                </h3>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                  Scroll for all items ↓
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Prioritized dynamically by verified reports, severity, and proximity
              </span>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setTriageFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  triageFilter === 'ALL'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                All ({problems.length})
              </button>
              <button
                type="button"
                onClick={() => setTriageFilter('CRITICAL')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  triageFilter === 'CRITICAL'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-amber-700'
                }`}
              >
                Critical (&ge;90)
              </button>
              <button
                type="button"
                onClick={() => setTriageFilter('ADOPTED')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  triageFilter === 'ADOPTED'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                In Capstone
              </button>
            </div>
          </div>

          {/* Internal Scrollable Queue Section (Occupies screen & scrolls smoothly) */}
          <div className="max-h-[580px] overflow-y-auto pr-2.5 space-y-3 pt-1 custom-queue-scroll">
            {filteredProblems.map((prob) => {
              const isSelected = selectedProblem?.id === prob.id;
              const isCritical = prob.priorityScore >= 90;

              return (
                <div
                  key={prob.id}
                  onClick={() => setSelectedProblem(prob)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {prob.category.replace('_', ' ')}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border ${
                            isCritical
                              ? 'bg-amber-100 text-amber-950 border-amber-300'
                              : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                          }`}
                        >
                          ★ Score: {prob.priorityScore}/100
                        </span>
                        <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {prob.assignedUniversity ? 'ADOPTED CAPSTONE' : 'VERIFIED'}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                        {prob.title}
                      </h4>

                      <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                        {prob.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span className="font-medium text-slate-700">📍 {prob.address}</span>
                        <span>• Upvotes: {prob.upvotesCount}</span>
                        {prob.assignedUniversity && (
                          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            🏛️ Lab: {prob.assignedUniversity}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">SLA</span>
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 inline-block mt-0.5">
                        {prob.slaRemainingHours}h left
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Problem Action Card (Sticky to match queue height) */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-6">
          {selectedProblem ? (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[11px] font-black uppercase text-blue-600 tracking-wider">
                  Selected Hotspot Action
                </span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                  {selectedProblem.priorityScore}/100 Priority
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-base text-slate-900 leading-snug">
                  {selectedProblem.title}
                </h4>
                <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed">
                  {selectedProblem.description}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Status:</span>
                  <span className="font-black text-blue-700">
                    {selectedProblem.assignedUniversity ? 'ADOPTED_CAPSTONE' : 'VERIFIED'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Assigned Lab:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[170px]">
                    {selectedProblem.assignedUniversity || 'None assigned yet'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Citizen Upvotes:</span>
                  <span className="font-black text-amber-600">{selectedProblem.upvotesCount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleEscalateSLA(selectedProblem.id)}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Assign to University Capstone Lab</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeployFix(selectedProblem.id)}
                  className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authorize Municipal Field Fix</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm text-center py-12 text-slate-400">
              <p className="text-xs font-medium">Click on any problem in the list or on the map to inspect.</p>
            </div>
          )}

          {/* Quick SLA Matrix Info Card with Warm Yellow Glow */}
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">⚡</span>
              <h4 className="font-extrabold text-xs text-amber-950">Triple-Helix Escalation SLA</h4>
            </div>
            <p className="text-xs text-amber-900/90 font-medium leading-relaxed">
              Bottlenecks scoring above 90 are flagged for 24h immediate municipal escalation and prioritized for capstone grants.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. UNIVERSITY CAPSTONE PROTOTYPE REVIEW TABLE (Clean White & Blue Design)
      ========================================================================= */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              University Prototype Milestone Verification
            </h3>
          </div>
          <span className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Sign-off unlocks CSR grant disbursements
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400">
                <th className="py-3 font-bold">Prototype Title &amp; Team</th>
                <th className="py-3 font-bold">University Lab</th>
                <th className="py-3 font-bold">Milestone Proof</th>
                <th className="py-3 font-bold">Status</th>
                <th className="py-3 font-bold text-right">Municipal Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900">
              {prototypes.map((proto) => (
                <tr key={proto.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="font-bold text-slate-900">{proto.projectTitle}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{proto.studentTeamLead}</div>
                  </td>
                  <td className="py-4 pr-4 text-[11px] font-semibold text-slate-700">{proto.university}</td>
                  <td className="py-4 pr-4">
                    <a
                      href={proto.submittedProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>View Proof</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        proto.status === 'APPROVED'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {proto.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    {proto.status === 'PENDING_REVIEW' ? (
                      <button
                        type="button"
                        onClick={() => handleApprovePrototype(proto.id)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 active:scale-[0.98]"
                      >
                        Approve &amp; Release CSR
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-blue-600 flex items-center justify-end gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" /> Approved
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
