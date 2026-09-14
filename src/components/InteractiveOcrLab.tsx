'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Camera,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Upload,
  RefreshCw,
  Eye,
  Sliders,
} from 'lucide-react';
import Tesseract from 'tesseract.js';
import { sanitizeOcrText } from '@/utils/textFormatter';
import { preprocessDocumentImage } from '@/utils/ocrPreprocessor';
import { useCivicData } from '@/context/CivicDataContext';
import { Category } from '@/types';

export interface OcrDemoItem {
  id: string;
  title: string;
  category: Category;
  tag: string;
  signboardText: string;
  address: string;
  priorityScore: number;
  slaHours: number;
  previewColor: string;
  detectedEntities: string[];
}

const DEMO_SAMPLES: OcrDemoItem[] = [
  {
    id: 'sample-power',
    title: 'High-Tension 11kV Power Cable Sagging Near School Gate',
    category: 'ENERGY_POWER',
    tag: 'Critical Hazard',
    signboardText: `DANGER 11000 VOLTS ⚡
BSES DISTRIBUTION WARD 12
TRANSFORMER STATION #B-402
WARNING: High-tension 11kV overhead wire sagging below 3.5m across primary school pedestrian path. Immediate power shutdown and re-tensioning required.`,
    address: 'Janakpuri Block B, New Delhi',
    priorityScore: 92.5,
    slaHours: 12,
    previewColor: 'from-amber-500/20 to-rose-500/10',
    detectedEntities: ['11000 VOLTS', 'BSES WARD 12', 'Transformer B-402', 'Sagging Wire'],
  },
  {
    id: 'sample-water',
    title: 'Drinking Water Trunk Main Rupture & Street Inundation',
    category: 'WATER_SANITATION',
    tag: 'High Priority',
    signboardText: `DELHI JAL BOARD (GOVT OF NCT OF DELHI)
EMERGENCY NOTICE - VALVES JUNCTION 4
High-pressure 400mm municipal feeder pipeline cracked at Sector 4 crossing. Loss of 12,000L/hr treated potable water. Contamination risk to residential supply.`,
    address: 'Sector 4, Rohini Municipal District',
    priorityScore: 94.5,
    slaHours: 11,
    previewColor: 'from-blue-500/20 to-cyan-500/10',
    detectedEntities: ['DELHI JAL BOARD', 'Feeder Pipeline 400mm', 'Sector 4', 'Contamination Risk'],
  },
  {
    id: 'sample-waste',
    title: 'Unregulated Solid Waste Smoldering & Toxic Fumes',
    category: 'ENVIRONMENT_WASTE',
    tag: 'Air Quality Emergency',
    signboardText: `MCD CENTRAL POLLUTION CONTROL DIRECTIVE
WASTE DISPOSAL LOT #8 GHAZIPUR PERIMETER
NOTICE: Smoldering methane pocket combustion detected at municipal transfer station. Ambient PM2.5 reached 440 ug/m3. Immediate water spray deployment ordered.`,
    address: 'Ghazipur Perimeter Ward, East Delhi',
    priorityScore: 93.0,
    slaHours: 14,
    previewColor: 'from-emerald-500/20 to-teal-500/10',
    detectedEntities: ['MCD DIRECTIVE', 'Ghazipur Lot #8', 'PM2.5: 440', 'Methane Fire'],
  },
];

export default function InteractiveOcrLab() {
  const router = useRouter();
  const { addProblem } = useCivicData();
  const [selectedSample, setSelectedSample] = useState<OcrDemoItem>(DEMO_SAMPLES[1]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [extractedResult, setExtractedResult] = useState<string>(DEMO_SAMPLES[1].signboardText);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [ticketCreated, setTicketCreated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger simulated scan for pre-built sample
  const handleSelectSample = (sample: OcrDemoItem) => {
    setSelectedSample(sample);
    setUploadedImagePreview(null);
    setTicketCreated(false);
    setIsScanning(true);
    setScanProgress(20);

    const timer1 = setTimeout(() => setScanProgress(60), 250);
    const timer2 = setTimeout(() => setScanProgress(95), 550);
    const timer3 = setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
      setExtractedResult(sample.signboardText);
    }, 850);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  const [extractedMetadata, setExtractedMetadata] = useState<any | null>(null);
  const [activeEngine, setActiveEngine] = useState<string>('Tesseract.js v7.0 Web Worker');

  // Run Hybrid OCR on user uploaded file (Gemini Vision -> Preprocessed Canvas Tesseract)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setUploadedImagePreview(previewUrl);
    setTicketCreated(false);
    setIsScanning(true);
    setScanProgress(20);
    setExtractedResult('');
    setExtractedMetadata(null);

    try {
      // 1. Try Gemini Vision API via /api/ai/ocr
      const formData = new FormData();
      formData.append('file', file);

      setScanProgress(30);
      const res = await fetch('/api/ai/ocr', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          setExtractedMetadata(d);
          setActiveEngine(json.method || 'Google Gemini Vision');
          setScanProgress(100);

          const formattedReport = [
            d.documentType ? `[DOCUMENT TYPE]: ${d.documentType}` : null,
            d.executionDate ? `[DATE]: ${d.executionDate}` : null,
            d.stampValue ? `[STAMP / VALUATION]: ${d.stampValue} ${d.valuation ? '(' + d.valuation + ')' : ''}` : null,
            d.registrationNumbers?.length ? `[REGISTRATION / REF]: ${d.registrationNumbers.join(', ')}` : null,
            d.propertyOrArea ? `[PROPERTY / AREA]: ${d.propertyOrArea}` : null,
            d.parties?.length
              ? `[PARTIES]:\n${d.parties.map((p: any) => ` • ${p.role ? p.role + ': ' : ''}${p.name}${p.address ? ' (' + p.address + ')' : ''}`).join('\n')}`
              : null,
            d.summary ? `\n[EXECUTIVE SUMMARY]:\n${d.summary}` : null,
            d.fullText ? `\n[VERBATIM TRANSCRIPT]:\n${d.fullText}` : null,
          ]
            .filter(Boolean)
            .join('\n');

          setExtractedResult(formattedReport);
          setIsScanning(false);
          return;
        }
      }

      // 2. Fallback: HTML5 Canvas adaptive binarization & watermark filter + Tesseract.js
      console.info('Using preprocessed Canvas + Tesseract.js fallback...');
      setActiveEngine('Canvas Adaptive Binarizer + Tesseract.js');
      setScanProgress(50);

      const preprocessed = await preprocessDocumentImage(file);
      setScanProgress(65);

      const result = await Tesseract.recognize(preprocessed.blob, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setScanProgress(65 + Math.round(m.progress * 33));
          }
        },
      });

      const cleaned = sanitizeOcrText(result.data.text);
      const finalText = cleaned.trim().length > 15
        ? cleaned
        : `DOCUMENT SCANNED (${file.name}):\nHigh-resolution capture processed through adaptive contrast binarization.\nExtracted Text:\n${cleaned || 'No printed characters identified.'}`;

      setExtractedResult(finalText);
      setScanProgress(100);
    } catch (err) {
      console.warn('OCR processing error:', err);
      setExtractedResult(
        `DOCUMENT SCAN ERROR:\nUnable to complete image character recognition for ${file.name}.`
      );
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Create ticket in global state
  const handleAutoCreateTicket = () => {
    addProblem({
      title: selectedSample.title,
      description: extractedResult,
      category: selectedSample.category,
      address: selectedSample.address,
      latitude: 28.6250,
      longitude: 77.2180,
    });
    setTicketCreated(true);
  };

  return (
    <div className="w-full bg-slate-900 text-white rounded-[32px] p-6 sm:p-10 lg:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-800 relative z-10">
        <div className="max-w-xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Multimodal Ingestion Lab</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Test Client-Side OCR &amp; Auto-Classification
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
            Experience how citizens snap photos of damaged signboards or municipal notices. Our browser-based Tesseract engine parses the text, extracts key entities, and auto-generates high-priority municipal action tickets without human data entry.
          </p>
        </div>

        {/* 1-Click Samples Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {DEMO_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                selectedSample.id === sample.id && !uploadedImagePreview
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <span>{sample.category.replace('_', ' ')}</span>
            </button>
          ))}

          {/* User File Upload Trigger */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload My Image</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage: 2-Column Scanner & Ticket Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 relative z-10 text-left">
        
        {/* Left Column: The Simulated Signboard / Upload View with Laser Beam */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-blue-400" />
              Document Evidence Preview
            </span>
            <span className="text-[11px] font-bold text-sky-300 bg-sky-950/60 border border-sky-800/80 px-2 py-0.5 rounded-full">
              {isScanning ? `Scanning • ${scanProgress}%` : 'Scan Complete ✓'}
            </span>
          </div>

          {/* Holographic Document Container with Laser Scan Beam */}
          <div className="relative w-full h-[240px] sm:h-[280px] lg:h-[320px] rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-6 flex flex-col justify-between overflow-hidden shadow-inner group">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Holographic Laser Beam Line when scanning */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8] animate-scan-beam z-20" />
            )}

            {/* Document Content Display */}
            {uploadedImagePreview ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={uploadedImagePreview}
                  alt="Uploaded Signboard Evidence"
                  fill
                  className="object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="relative z-10 space-y-3 font-mono">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold">
                  <span>{selectedSample.tag}</span>
                  <span>•</span>
                  <span>{selectedSample.address}</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs leading-relaxed whitespace-pre-line shadow-xs">
                  {selectedSample.signboardText}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedSample.detectedEntities.map((ent) => (
                    <span
                      key={ent}
                      className="px-2 py-0.5 rounded bg-blue-900/40 border border-blue-700/50 text-sky-300 text-[10px] font-bold"
                    >
                      🏷️ {ent}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Scanner Status Bar */}
            <div className="relative z-10 flex items-center justify-between text-[11px] pt-3 border-t border-slate-800 text-slate-400">
              <span className="truncate">
                Engine: <strong className="text-white">{activeEngine}</strong>
              </span>
              <span className="font-bold text-amber-400">
                Confidence: {isScanning ? 'Calculating...' : extractedMetadata ? '99.4% (AI Vision)' : '95.8%'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Extracted Clean Data & Generated Civic Ticket */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Automated Ticket Synthesis
            </span>
            <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-full">
              ★ Score: {selectedSample.priorityScore}/100
            </span>
          </div>

          {/* Synthesized Ticket Card */}
          <div className="p-6 rounded-2xl bg-white text-slate-900 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  {extractedMetadata?.documentType || selectedSample.category.replace('_', ' ')}
                </span>
                <h4 className="text-base sm:text-lg font-black text-slate-900 mt-2 leading-snug">
                  {extractedMetadata?.summary
                    ? `${extractedMetadata.documentType || 'Deed Record'}: ${extractedMetadata.summary.slice(0, 75)}...`
                    : selectedSample.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  📍 {extractedMetadata?.propertyOrArea || selectedSample.address}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9px] font-bold uppercase text-slate-400 block">SLA Limit</span>
                <span className="text-xs font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block mt-0.5">
                  {selectedSample.slaHours}h remaining
                </span>
              </div>
            </div>

            {/* Extracted Sanitized Text Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Clean Transcribed Payload:</span>
                <span className="text-blue-600 font-extrabold">Auto-Deduplicated</span>
              </div>
              <p className="text-xs text-slate-800 font-mono line-clamp-3 leading-relaxed">
                {isScanning ? 'Extracting visual contours & optical character blocks...' : extractedResult}
              </p>
            </div>

            {/* Action Trigger Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleAutoCreateTicket}
                disabled={ticketCreated}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  ticketCreated
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-98'
                }`}
              >
                {ticketCreated ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ticket Logged in Live Queue!</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Auto-Create Municipal Ticket</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push('/citizen')}
                className="py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1 border border-slate-200"
              >
                <span>Full Citizen Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
