'use client';

import React, { useState } from 'react';
import { Category } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useCivicData, CivicProblemItem } from '@/context/CivicDataContext';
import SmartMediaInput from '@/components/SmartMediaInput';
import InteractiveCivicMap from '@/components/InteractiveCivicMap';
import {
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Wand2,
  ThumbsUp,
  Clock,
  Layers,
  FileCheck,
  Droplets,
  Car,
  Leaf,
  Zap,
  ShieldAlert,
  HeartPulse,
  GraduationCap,
} from 'lucide-react';
import { formatCivicReport, sanitizeOcrText, deduplicateRepeatedPhrases } from '@/utils/textFormatter';

export default function CitizenPortalPage() {
  const { currentUser } = useAuth();
  const { problems, addProblem, upvoteProblem } = useCivicData();
  const [activeTab, setActiveTab] = useState<'submit' | 'track' | 'explore'>('submit');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('WATER_SANITATION');
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.2090);
  const [address, setAddress] = useState('Sector 4, Rohini, New Delhi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<CivicProblemItem | null>(null);

  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(4)));
          setLongitude(Number(pos.coords.longitude.toFixed(4)));
          setAddress(`Detected GPS: ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`);
        },
        () => {
          setLatitude(28.6139);
          setLongitude(77.2090);
          setAddress('Sector 4, Rohini, New Delhi');
        }
      );
    }
  };

  const handlePickMapLocation = (lat: number, lng: number, addr: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setAddress(addr);
  };

  const handleOcrExtracted = (extractedText: string) => {
    const cleanText = sanitizeOcrText(extractedText);
    setDescription((prev) => (prev ? `${prev}\n\n[OCR Evidence]: ${cleanText}` : cleanText));
    if (!title && cleanText) {
      const firstLine = cleanText.split('\n')[0].replace(/[#:]/g, '');
      setTitle(firstLine.slice(0, 65));
    }
  };

  const handleAudioTranscribed = (transcript: string) => {
    const cleanTranscript = deduplicateRepeatedPhrases(transcript);
    setDescription((prev) => (prev ? `${prev} ${cleanTranscript}` : cleanTranscript));
    if (!title && cleanTranscript) {
      setTitle(cleanTranscript.slice(0, 65));
    }
  };

  const handleAiAutoFormat = () => {
    if (!description) return;
    const formatted = formatCivicReport(description);
    setDescription(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const created = addProblem({
        title,
        description,
        category,
        latitude,
        longitude,
        address,
      });

      setSubmissionSuccess(created);
      setIsSubmitting(false);

      // Reset fields
      setTitle('');
      setDescription('');
    }, 400);
  };

  return (
    <div className="space-y-6 w-full max-w-6xl text-slate-900">
      {/* Top Banner & Tab Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Citizen Grievance &amp; Field Reporting
            </h2>
            <span className="px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-[10px] font-black uppercase">
              {currentUser.badgeLabel}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Report local hazards with interactive map pin-dropping, Tesseract OCR, and audio voice input.
          </p>
        </div>

        <div className="flex overflow-x-auto max-w-full scrollbar-none bg-white p-1 rounded-xl border border-slate-200 shadow-xs self-start">
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'submit'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            Report Problem
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'explore'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            Explore Map ({problems.length})
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'track'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            Track Active Issues
          </button>
        </div>
      </div>

      {activeTab === 'submit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Submission Form Card */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 sm:space-y-5"
          >
            {submissionSuccess && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-slate-800 text-xs space-y-2 animate-fade-in">
                <div className="font-black flex items-center gap-2 text-blue-900">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Grievance Logged &amp; Added to Live Map!
                </div>
                <p className="font-medium text-slate-600">
                  Problem <strong>{submissionSuccess.title}</strong> has been indexed with priority score{' '}
                  <strong className="text-amber-600">{submissionSuccess.priorityScore}/100</strong> and assigned a municipal SLA of{' '}
                  <strong>{submissionSuccess.slaRemainingHours} hours</strong>.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                Problem Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken water main flooding residential street"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  <option value="WATER_SANITATION">Water &amp; Sanitation</option>
                  <option value="INFRASTRUCTURE_ROADS">Infrastructure &amp; Roads</option>
                  <option value="ENVIRONMENT_WASTE">Environment &amp; Waste</option>
                  <option value="HEALTHCARE">Healthcare &amp; Sanitation</option>
                  <option value="AGRICULTURE">Agriculture &amp; Irrigation</option>
                  <option value="ENERGY_POWER">Energy &amp; Electrical</option>
                  <option value="PUBLIC_SAFETY">Public Safety &amp; Lighting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                  GPS Location
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 shrink-0"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Auto-GPS</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                Address / Street Landmark
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Community Center, Sector 4, Rohini"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                💡 Tip: Click anywhere on the map to set exact coordinates &amp; address!
              </span>
            </div>

            {/* Multimodal Capture (Tesseract OCR & Speech Recognition) */}
            <SmartMediaInput
              onTextExtracted={handleOcrExtracted}
              onAudioTranscribed={handleAudioTranscribed}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Observation Details
                </label>
                {description && (
                  <button
                    type="button"
                    onClick={handleAiAutoFormat}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Wand2 className="w-3 h-3 text-blue-600" />
                    Clean &amp; Format
                  </button>
                )}
              </div>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe visible damage, hazard to school children, water leakage volume, or transcribe using audio/OCR buttons above..."
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Logging Problem into Triple-Helix Grid...' : 'Submit Civic Grievance'}</span>
            </button>
          </form>

          {/* Right Column: Interactive Click-to-Pin Map */}
          <div className="lg:col-span-5 space-y-4">
            <InteractiveCivicMap
              onPickLocation={handlePickMapLocation}
              isPickerMode={true}
            />

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="font-extrabold text-xs text-slate-900">How Triage Works</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Your report is immediately added to the municipal matrix. Nearby engineering universities (IIT, DTU, NSUT) receive notifications to adopt urgent issues for technical capstone prototyping.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Explore Map Tab */}
      {activeTab === 'explore' && (
        <div className="space-y-4">
          <InteractiveCivicMap />
        </div>
      )}

      {/* Track Active Issues Tab */}
      {activeTab === 'track' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Live Municipal Grievances ({problems.length})
                </h3>
                <span className="text-xs text-slate-500">
                  Updated dynamically • Click thumbs-up to upvote and escalate priority score
                </span>
              </div>
            </div>

            {/* Stack of Distinct Individual Problem Cards */}
            <div className="space-y-4 pt-1">
              {problems.map((prob, idx) => {
                const catInfo = getCategoryInfo(prob.category);
                const CatIcon = catInfo.icon;

                return (
                  <div
                    key={prob.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all relative group overflow-hidden space-y-3"
                  >
                    {/* Left Colored Category Accent Bar */}
                    <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${catInfo.accent}`} />

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pl-2">
                      <div className="space-y-2 flex-1 min-w-0">
                        {/* Top Badges Row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            #{idx + 1}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${catInfo.badge}`}>
                            <CatIcon className="w-3.5 h-3.5" />
                            <span>{prob.category.replace(/_/g, ' ')}</span>
                          </span>
                          <span className="text-xs font-black text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300 flex items-center gap-1 shadow-2xs">
                            <span className="text-amber-500">★</span>
                            <span>Priority {prob.priorityScore}/100</span>
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                            prob.assignedUniversity
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {prob.assignedUniversity ? 'Capstone In Progress' : 'Verified Hotspot'}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="font-black text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                            {prob.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium mt-1">
                            {prob.description}
                          </p>
                        </div>

                        {/* Metadata Footer Strip */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                          <span className="inline-flex items-center gap-1.5 text-slate-600 font-semibold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            <span>{prob.address}</span>
                          </span>

                          <span className="inline-flex items-center gap-1.5 text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>SLA: {prob.slaRemainingHours}h remaining</span>
                          </span>

                          {prob.assignedUniversity && (
                            <span className="inline-flex items-center gap-1.5 text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                              <span>Lab: {prob.assignedUniversity}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Prominent Upvote Button */}
                      <div className="shrink-0 pl-2 sm:pl-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => upvoteProblem(prob.id)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-xs active:scale-95 ${
                            prob.hasUpvoted
                              ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                              : 'bg-white hover:bg-blue-50/60 text-slate-700 hover:text-blue-600 border border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${prob.hasUpvoted ? 'text-amber-300 fill-amber-300' : 'text-slate-400'}`} />
                          <span>{prob.upvotesCount} Upvotes</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getCategoryInfo(category: Category) {
  switch (category) {
    case 'WATER_SANITATION':
      return {
        icon: Droplets,
        accent: 'bg-blue-600',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    case 'INFRASTRUCTURE_ROADS':
      return {
        icon: Car,
        accent: 'bg-slate-700',
        badge: 'bg-slate-100 text-slate-800 border-slate-300',
      };
    case 'ENVIRONMENT_WASTE':
      return {
        icon: Leaf,
        accent: 'bg-emerald-600',
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    case 'ENERGY_POWER':
      return {
        icon: Zap,
        accent: 'bg-amber-500',
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    case 'PUBLIC_SAFETY':
      return {
        icon: ShieldAlert,
        accent: 'bg-rose-600',
        badge: 'bg-rose-50 text-rose-800 border-rose-200',
      };
    case 'HEALTHCARE':
      return {
        icon: HeartPulse,
        accent: 'bg-cyan-600',
        badge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      };
    case 'AGRICULTURE':
      return {
        icon: Leaf,
        accent: 'bg-lime-600',
        badge: 'bg-lime-50 text-lime-800 border-lime-200',
      };
    default:
      return {
        icon: Layers,
        accent: 'bg-blue-600',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
      };
  }
}
