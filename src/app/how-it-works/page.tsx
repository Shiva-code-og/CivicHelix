'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Users,
  GraduationCap,
  Building2,
  Landmark,
  MapPin,
  Mic,
  Camera,
  Coins,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export default function HowItWorksPage() {
  const router = useRouter();
  const { isLoggedIn, logout, currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);

  const workflowSteps = [
    {
      step: '01',
      role: 'Citizens & Communities',
      title: 'Multimodal Incident Ingestion',
      icon: MapPin,
      tag: 'Field Ingestion',
      desc: 'Residents flag ward bottlenecks (broken water pipes, dangerous potholes, uncollected waste) using GPS geocoding, Tesseract OCR for notice boards, or speech audio notes. Neighbors upvote to signal collective urgency.',
      output: 'Geotagged Problem Statement with Live Priority Score',
    },
    {
      step: '02',
      role: 'University Engineering Labs',
      title: 'Capstone Adoption & Prototyping',
      icon: GraduationCap,
      tag: 'R&D Incubation',
      desc: 'Undergraduate and postgraduate engineering teams adopt verified municipal challenges as credited final-year capstone projects. Faculty mentors guide the technical design and bill of materials.',
      output: 'Working Hardware / Software Proof of Concept',
    },
    {
      step: '03',
      role: 'CSR Industry Partners',
      title: 'Milestone-Based Grant Funding',
      icon: Building2,
      tag: 'Impact Capital',
      desc: 'Corporate sponsors review student prototypes aligned with SDG targets and release non-dilutive milestone grants directly for hardware fabrication, sensors, and lab testing.',
      output: 'Procurement Grant Disbursed with ESG Audit Trail',
    },
    {
      step: '04',
      role: 'Municipal Local Government',
      title: 'Field Pilot & Ward Deployment',
      icon: Landmark,
      tag: 'Civic Scale',
      desc: 'Ward engineers and municipal commissioners authorize real-world street pilot trials. Once safety and efficiency criteria are met, the solution is permanently integrated into urban infrastructure.',
      output: 'Municipal Sign-off & Real-Time Citizen Notification',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      {/* =========================================================================
          1. PUBLIC TOP NAVBAR (Consistent with Landing Page)
      ========================================================================= */}
      <header className="w-full px-6 sm:px-12 py-4 flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-blue-500/20">
            CH
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900">
            CivicHelix
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href="/#features" className="hover:text-blue-600 transition-colors">
            Features
          </Link>
          <Link href="/how-it-works" className="text-blue-600 underline underline-offset-8 decoration-2 decoration-blue-600 font-extrabold">
            How It Works
          </Link>
        </nav>

        {/* Auth CTA Actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href="/government"
                className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
              >
                Login
              </Link>
              <Link
                href="/login"
                className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide shadow-md transition-all"
              >
                Join Now
              </Link>
            </>
          )}
        </div>
      </header>

      {/* =========================================================================
          2. HERO BANNER
      ========================================================================= */}
      <section className="w-full px-6 sm:px-12 py-16 text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>The Triple-Helix Civic Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          How CivicHelix Solves Urban Bottlenecks
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
          Instead of leaving civic grievances trapped in municipal queues, CivicHelix converts them into accredited engineering capstone projects funded by corporate CSR and deployed by municipal engineers.
        </p>
      </section>

      {/* =========================================================================
          3. INTERACTIVE STEP SIMULATOR
      ========================================================================= */}
      <section className="w-full px-6 sm:px-12 pb-20 max-w-6xl mx-auto space-y-8">
        {/* Step Selector Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={step.step}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg -translate-y-1'
                    : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-amber-300' : 'text-blue-600'}`}>
                    STEP {step.step}
                  </span>
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs sm:text-sm truncate">{step.title}</h4>
                <span className={`text-[10px] block mt-1 ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                  {step.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detailed Spotlight Box for Current Step */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
              <span>Actor: {workflowSteps[activeStep].role}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {workflowSteps[activeStep].title}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {workflowSteps[activeStep].desc}
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Step Deliverable
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {workflowSteps[activeStep].output}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between h-full space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Platform Automation</span>
              <h4 className="font-bold text-sm text-slate-900">Real-Time Verification</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeStep === 0 && 'GPS coordinates and photo OCR clean inputs instantly, grouping nearby reports.'}
                {activeStep === 1 && 'University mentors verify technical feasibility and upload capstone milestones.'}
                {activeStep === 2 && 'Industry CSR funds are escrowed and disbursed only upon verified lab testing proof.'}
                {activeStep === 3 && 'Urban local bodies validate the street fix, automatically closing the public ticket.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveStep((prev) => (prev + 1) % workflowSteps.length)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Next Workflow Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. 4 PILLARS BREAKDOWN
      ========================================================================= */}
      <section className="w-full px-6 sm:px-12 py-16 bg-slate-100/60 border-t border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              The 4 Pillars of the CivicHelix Network
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-medium">
              Every participant holds a clear role in ensuring civic problems are not merely filed, but physically solved.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: Citizen */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">1. Citizens</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Identify hazards in their neighborhoods. They submit geotagged complaints with photos and audio, and upvote existing tickets to indicate urgency.
              </p>
              <Link href="/citizen" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 pt-1">
                Citizen Portal <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Pillar 2: Universities */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">2. Universities</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Engineering and research students select real problems as degree capstone projects, receiving academic credit for practical innovation.
              </p>
              <Link href="/university" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 pt-1">
                University Hub <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Pillar 3: Industry */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">3. Industry CSR</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Companies fund student prototypes through milestone-governed CSR allocations, gaining transparent ESG verification for community impact.
              </p>
              <Link href="/industry" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 pt-1">
                Industry Portal <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Pillar 4: Government */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Landmark className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">4. Government</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Municipal commissioners prioritize bottlenecks, review academic prototypes, and commission field deployment with SLA tracking.
              </p>
              <Link href="/government" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 pt-1">
                Civic Dashboard <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. CTA BANNER
      ========================================================================= */}
      <section className="w-full px-6 sm:px-12 py-16 text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          Be Part of the Innovation Cycle
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto">
          Whether you want to report a pothole, build an engineering prototype, sponsor a grant, or supervise municipal improvements — CivicHelix connects you.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide shadow-md hover:shadow-lg transition-all"
          >
            Get Started Now
          </Link>
          <Link
            href="/"
            className="px-8 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 px-6 border-t border-slate-200 text-center text-[11px] text-slate-500">
        © 2026 CivicHelix. Powered by Triple-Helix Collaboration Framework.
      </footer>
    </div>
  );
}
