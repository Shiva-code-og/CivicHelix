'use client';

import React, { useState } from 'react';
import { useCivicData, CivicProblemItem } from '@/context/CivicDataContext';
import {
  Building2,
  DollarSign,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  X,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function IndustryPortalPage() {
  const { problems, industryPledgeFunding } = useCivicData();

  const [sponsorModalProblem, setSponsorModalProblem] = useState<CivicProblemItem | null>(null);
  const [pledgeAmount, setPledgeAmount] = useState<number>(150000);
  const [companyName, setCompanyName] = useState('Tata Sustainability Trust CSR');
  const [sponsorSuccess, setSponsorSuccess] = useState<string | null>(null);

  // Projects that have been university-approved and posted for funding (Stage 5 and Stage 6)
  const fundingProjects = problems.filter(
    (p) => p.stage === '5_SEEKING_FUNDS' || p.stage === '6_FUNDED_DEPLOYED'
  );

  const totalFundsRaised = fundingProjects.reduce(
    (acc, p) => acc + (p.funding?.raisedINR || 0),
    0
  );

  const handlePledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorModalProblem) return;

    industryPledgeFunding(sponsorModalProblem.id, companyName, pledgeAmount);

    setSponsorSuccess(
      `Pledged ₹${pledgeAmount.toLocaleString('en-IN')} CSR grant to "${sponsorModalProblem.studentProposal?.solutionTitle || sponsorModalProblem.title}". Automated ESG tax certificate generated!`
    );
    setSponsorModalProblem(null);
    setTimeout(() => setSponsorSuccess(null), 5000);
  };

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto pb-16 text-slate-900">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Industry CSR Grants &amp; Milestone Funding
            </h1>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black border border-blue-200 uppercase tracking-wide">
              ESG Verified
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Companies review university-certified student prototypes, verify lab metrics, and disburse non-dilutive milestone CSR grants.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs font-bold text-slate-800">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Verified Corporate CSR Portal</span>
        </div>
      </div>

      {sponsorSuccess && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{sponsorSuccess}</span>
          </div>
          <button
            onClick={() => setSponsorSuccess(null)}
            className="text-blue-700 underline hover:text-blue-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-2 shadow-md shadow-blue-500/25">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Total CSR Grants Disbursed
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{(totalFundsRaised / 100000).toFixed(1)} Lakhs
          </div>
          <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 inline-block">
            100% Tax Deductible (Section 80G / CSR)
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mb-2 shadow-md shadow-amber-400/25">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            University Prototypes Funded
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {fundingProjects.length} Verified Projects
          </div>
          <span className="text-xs text-amber-950 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 inline-block">
            Tested in Academic Lab Environments
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-2 shadow-md shadow-blue-500/25">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Verified Urban Beneficiaries
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            420,000+ Citizens
          </div>
          <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 inline-block">
            Audited via Municipal Deployment Logs
          </span>
        </div>
      </div>

      {/* Available Projects for Sponsorship */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            University-Certified Prototypes Seeking Industry CSR Grants ({fundingProjects.length})
          </h2>
          <span className="text-xs text-slate-400">
            Funds held in milestone escrow; disbursed only upon verified lab testing proof
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {fundingProjects.map((prob) => {
            const funding = prob.funding || { targetINR: 300000, raisedINR: 0, industrySponsors: [] };
            const fundedPercent = Math.min(100, Math.round((funding.raisedINR / funding.targetINR) * 100));
            const isFullyFunded = funding.raisedINR >= funding.targetINR;

            return (
              <div
                key={prob.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {prob.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      🏛️ {prob.studentProposal?.university || 'University Lab'}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {prob.studentProposal?.solutionTitle || prob.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Civic Bottleneck:</strong> {prob.description}
                  </p>

                  {prob.prototypeDetails && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="font-bold text-slate-900">
                        Lab Verified: {prob.prototypeDetails.prototypeName}
                      </div>
                      <div className="text-slate-500">
                        Test Metric: {prob.prototypeDetails.testedMetric}
                      </div>
                      <a
                        href={prob.prototypeDetails.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 font-bold hover:underline flex items-center gap-1 pt-0.5"
                      >
                        <span>Inspect Verification Specs</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Funding Progress Bar */}
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-blue-700">
                        Raised: ₹{funding.raisedINR.toLocaleString('en-IN')}
                      </span>
                      <span className="text-slate-500">
                        Target: ₹{funding.targetINR.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFullyFunded ? 'bg-amber-400' : 'bg-blue-600'
                        }`}
                        style={{ width: `${fundedPercent}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>{fundedPercent}% funded</span>
                      <span>
                        {funding.industrySponsors.length} Corporate Sponsor(s)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  {!isFullyFunded ? (
                    <button
                      type="button"
                      onClick={() => setSponsorModalProblem(prob)}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Pledge Milestone CSR Grant</span>
                    </button>
                  ) : (
                    <div className="w-full py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      <span>Fully Funded &bull; Municipal Deployment Active</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CSR Pledge Modal */}
      {sponsorModalProblem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                Pledge Corporate CSR Grant
              </h3>
              <button
                type="button"
                onClick={() => setSponsorModalProblem(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs space-y-1">
              <div className="font-bold text-blue-950">
                {sponsorModalProblem.studentProposal?.solutionTitle || sponsorModalProblem.title}
              </div>
              <div className="text-blue-700">
                Team: {sponsorModalProblem.studentProposal?.teamName} ({sponsorModalProblem.studentProposal?.university})
              </div>
            </div>

            <form onSubmit={handlePledgeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Company / Foundation Name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Tata Trusts / Infosys CSR Foundation"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pledge Grant Amount (INR)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[50000, 100000, 200000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPledgeAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        pledgeAmount === amt
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50'
                      }`}
                    >
                      ₹{(amt / 1000)}k
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={10000}
                  step={5000}
                  value={pledgeAmount}
                  onChange={(e) => setPledgeAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSponsorModalProblem(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-[0.98]"
                >
                  Disburse CSR Pledge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
