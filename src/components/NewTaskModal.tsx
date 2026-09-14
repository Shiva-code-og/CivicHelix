'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import SmartMediaInput from '@/components/SmartMediaInput';
import {
  X,
  Send,
  MapPin,
  Wand2,
  FileDown,
  Printer,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Clock,
  User,
  Phone,
  Building,
  Hash,
} from 'lucide-react';
import { Category } from '@/types';
import { formatCivicReport, sanitizeOcrText, deduplicateRepeatedPhrases } from '@/utils/textFormatter';
import { useCivicData } from '@/context/CivicDataContext';
import { downloadIncidentReportPdf, printCivicIncidentReport, CivicReportData } from '@/utils/pdfGenerator';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function NewTaskModal({ isOpen, onClose, onCreated }: NewTaskModalProps) {
  const { currentUser } = useAuth();
  const { addProblem } = useCivicData();

  // Mandatory Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('WATER_SANITATION');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [description, setDescription] = useState('');
  
  // Mandatory Citizen Details
  const [reporterName, setReporterName] = useState(currentUser?.name || '');
  const [reporterPhone, setReporterPhone] = useState('+91 98765 43210');
  const [reporterEmail, setReporterEmail] = useState(currentUser?.email || 'citizen@civic-helix.org');

  // Mandatory Location & Timing
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState(new Date().toTimeString().slice(0, 5));
  const [address, setAddress] = useState('Sector 4, Rohini Municipal District');
  const [wardOrSector, setWardOrSector] = useState('Ward #12 / Sector 4');
  const [district, setDistrict] = useState('North West Delhi');
  const [state, setState] = useState('Delhi');
  const [pincode, setPincode] = useState('110085');

  // Captured Multimodal Evidence
  const [ocrEvidence, setOcrEvidence] = useState('');
  const [audioTranscript, setAudioTranscript] = useState('');

  // UI / Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<CivicReportData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Auto-fill from OCR scan
  const handleOcrExtracted = (extractedText: string) => {
    const cleanText = sanitizeOcrText(extractedText);
    setOcrEvidence(cleanText);

    // Append to description if not already there
    setDescription((prev) => (prev ? `${prev}\n\n[OCR Evidence]:\n${cleanText}` : cleanText));

    // Try parsing address or title from deed/notice if blank
    if (!title && cleanText) {
      const firstLine = cleanText.split('\n')[0].replace(/[[\]#:]/g, '').trim();
      setTitle(firstLine.slice(0, 70));
    }

    // Auto-detect district / state from legal deeds (e.g., Murshidabad, West Bengal)
    if (cleanText.includes('Murshidabad')) {
      setDistrict('Murshidabad');
      setState('West Bengal');
      setPincode('742225');
      setAddress('Vill- Gopalnagar Uttar, P.O. Raghunathganj');
      setWardOrSector('Mouza-Dafahat / Raghunathganj');
    }
  };

  const handleAudioTranscribed = (transcript: string) => {
    const cleanTranscript = deduplicateRepeatedPhrases(transcript);
    setAudioTranscript(cleanTranscript);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Form Validations for Mandatory Fields
    if (!title.trim()) {
      setErrorMessage('Problem Title is mandatory.');
      return;
    }
    if (!reporterName.trim() || !reporterPhone.trim()) {
      setErrorMessage('Citizen Name and Contact Phone are mandatory.');
      return;
    }
    if (!address.trim() || !wardOrSector.trim() || !district.trim() || !pincode.trim()) {
      setErrorMessage('All Location fields (Address, Ward, District, PIN) are mandatory.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Detailed observation narrative is mandatory.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Generate unique government tracking ID
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const stateCode = state.slice(0, 2).toUpperCase() || 'IN';
      const reportId = `REP-${datePart}-${stateCode}-${randomSuffix}`;

      // 2. SLA calculation based on severity
      const slaMap = { CRITICAL: 12, HIGH: 24, MEDIUM: 48, LOW: 72 };
      const slaHours = slaMap[severity];

      const reportData: CivicReportData = {
        reportId,
        title,
        category,
        severity,
        description,
        reporterName,
        reporterPhone,
        reporterEmail,
        reporterRole: currentUser?.badgeLabel || 'Registered Resident',
        incidentDate,
        incidentTime,
        address,
        wardOrSector,
        district,
        state,
        pincode,
        latitude: 28.6139,
        longitude: 77.2090,
        ocrExtractedEvidence: ocrEvidence,
        audioTranscript,
        assignedDepartment: `Municipal ${category.replace('_', ' ')} Taskforce`,
        slaHours,
      };

      // 3. Add problem to client-side reactive civic data context
      addProblem({
        title: `[${reportId}] ${title}`,
        description,
        category,
        latitude: 28.6139,
        longitude: 77.2090,
        address: `${address}, ${wardOrSector}, ${district} - ${pincode}`,
      });

      // 4. Automatically trigger PDF download
      await downloadIncidentReportPdf(reportData);

      // 5. Store submitted report to display success screen
      setSubmittedReport(reportData);
      if (onCreated) onCreated();
    } catch (err: any) {
      console.error('Submission failed:', err);
      setErrorMessage('Failed to index report and generate PDF. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedReport(null);
    setTitle('');
    setDescription('');
    setOcrEvidence('');
    setAudioTranscript('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              🏛️
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                File Official Civic Incident Report
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                Generates a verified, downloadable legal/civic PDF record
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* =========================================================================
              SUCCESS VIEW (Triggered after submission and PDF download)
          ========================================================================= */}
          {submittedReport ? (
            <div className="space-y-5 py-4 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-900">
                  Incident Submitted &amp; PDF Report Generated!
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your grievance has been officially cataloged in the dispatch queue. A digitally stamped PDF has been prepared and downloaded.
                </p>
              </div>

              {/* Report Reference Badge */}
              <div className="inline-flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  Official Tracking Reference
                </span>
                <span className="font-mono text-sm sm:text-base font-black tracking-wider text-white">
                  {submittedReport.reportId}
                </span>
                <span className="text-[10px] text-slate-400">
                  Target Resolution SLA: {submittedReport.slaHours} Hours
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => downloadIncidentReportPdf(submittedReport)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center gap-1.5"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download PDF Again</span>
                </button>

                <button
                  type="button"
                  onClick={() => printCivicIncidentReport(submittedReport)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Print / Save as PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
                >
                  Done &amp; Return
                </button>
              </div>
            </div>
          ) : (
            /* =========================================================================
                INCIDENT ENTRY FORM WITH MANDATORY FIELDS
            ========================================================================= */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Section 1: Title, Category & Severity */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  1. Incident Classification <span className="text-rose-500">*Mandatory</span>
                </span>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Problem Title / Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Broken Water Trunk Main Line Causing Street Flooding"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department / Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                    >
                      <option value="WATER_SANITATION">Water &amp; Sanitation</option>
                      <option value="INFRASTRUCTURE_ROADS">Infrastructure &amp; Roads</option>
                      <option value="ENVIRONMENT_WASTE">Environment &amp; Waste</option>
                      <option value="HEALTHCARE">Healthcare &amp; Disease Prevention</option>
                      <option value="ENERGY_POWER">Energy &amp; Electrical Grid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Severity Rating *
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                    >
                      <option value="LOW">Low (Routine maintenance)</option>
                      <option value="MEDIUM">Medium (Within standard SLA)</option>
                      <option value="HIGH">High (Active disruption - 24h SLA)</option>
                      <option value="CRITICAL">Critical Hazard (Immediate risk - 12h SLA)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Smart OCR and Audio Ingestion */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  2. Multimodal Ingestion (OCR &amp; Audio Transcripts)
                </span>
                <SmartMediaInput
                  onTextExtracted={handleOcrExtracted}
                  onAudioTranscribed={handleAudioTranscribed}
                />
              </div>

              {/* Section 3: Citizen / Informant Details */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  3. Citizen Informant Identification <span className="text-rose-500">*Mandatory</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        placeholder="Citizen Name"
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Phone *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={reporterPhone}
                        onChange={(e) => setReporterPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={reporterEmail}
                      onChange={(e) => setReporterEmail(e.target.value)}
                      placeholder="citizen@domain.com"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Mandatory Location & Timing */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  4. Location &amp; Occurrence Timing <span className="text-rose-500">*Mandatory</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Occurrence Date *
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="date"
                        required
                        value={incidentDate}
                        onChange={(e) => setIncidentDate(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Occurrence Time *
                    </label>
                    <div className="relative">
                      <Clock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="time"
                        required
                        value={incidentTime}
                        onChange={(e) => setIncidentTime(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Exact Street Address / Landmark *
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street No., Near Primary School"
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Municipal Ward / Sector *
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={wardOrSector}
                        onChange={(e) => setWardOrSector(e.target.value)}
                        placeholder="Ward #12 / Sector 4"
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      District *
                    </label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. North West Delhi"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Delhi / West Bengal"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      PIN Code *
                    </label>
                    <div className="relative">
                      <Hash className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="110085"
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Detailed Observation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Detailed Observation &amp; Field Description *
                  </label>
                  {description && (
                    <button
                      type="button"
                      onClick={handleAiAutoFormat}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Wand2 className="w-3 h-3 text-blue-600" />
                      Format &amp; Clean Text
                    </button>
                  )}
                </div>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide precise observation details, physical defect notes, or scan documents with the OCR camera above..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="sm:w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="sm:w-2/3 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <span>Generating Official PDF &amp; Submitting...</span>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      <span>Submit &amp; Generate Official PDF Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
