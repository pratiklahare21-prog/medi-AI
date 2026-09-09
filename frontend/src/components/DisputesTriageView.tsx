import React, { useState } from 'react';
import { AccuracyDisputeItem } from '../types';

interface DisputesTriageViewProps {
  disputes: AccuracyDisputeItem[];
  onResolveDispute: (id: string, resolutionAction: string) => void;
  onOpenAiTriage?: (dispute: AccuracyDisputeItem) => void;
}

export const DisputesTriageView: React.FC<DisputesTriageViewProps> = ({
  disputes,
  onResolveDispute,
  onOpenAiTriage
}) => {
  const [activeDisputeId, setActiveDisputeId] = useState<string>('disp-01');
  const [overrideNote, setOverrideNote] = useState<string>('');
  const [resolvedStatus, setResolvedStatus] = useState<string | null>(null);

  const currentDispute = disputes.find(d => d.id === activeDisputeId) || disputes[0];

  const handleAction = (action: string) => {
    onResolveDispute(currentDispute.id, action);
    setResolvedStatus(`Dispute "${currentDispute.title}" resolved with action: ${action}. Audit entry committed to HMAC stream.`);
    setTimeout(() => setResolvedStatus(null), 5000);
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {resolvedStatus && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-sm animate-in fade-in">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
            {resolvedStatus}
          </span>
          <button onClick={() => setResolvedStatus(null)} className="text-emerald-700">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-code-mono text-[11px] font-semibold border border-red-200">
              Clinical Triage Queue (SLA Enforced)
            </span>
          </div>
          <h1 className="font-headline-md text-xl lg:text-2xl text-slate-900 font-bold tracking-tight">
            Accuracy Reports & Bio-Ratio Dispute Center
          </h1>
          <p className="font-body-sm text-xs sm:text-sm text-slate-500">
            Pharmacovigilance discrepancy resolution for reported salt formulation and bio-equivalence mismatches
          </p>
        </div>

        {currentDispute && onOpenAiTriage && (
          <button
            onClick={() => onOpenAiTriage(currentDispute)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-base text-blue-200">psychology</span>
            <span>Gemini AI Auto-Triage & Evidence</span>
          </button>
        )}
      </div>

      {/* Main Grid: Queue on Left, Inspection Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dispute Queue */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Active Discrepancy Queue ({disputes.length})
          </div>

          {disputes.map((d) => {
            const isSelected = d.id === currentDispute.id;
            return (
              <div
                key={d.id}
                onClick={() => setActiveDisputeId(d.id)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white border-[#2563EB] ring-1 ring-[#2563EB]/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`px-2 py-0.2 rounded font-code-mono text-[10px] font-bold border ${
                    d.severity === 'Critical' 
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {d.severity} Priority
                  </span>
                  <span className="font-code-mono text-[11px] text-slate-400">
                    SLA: {d.slaRemaining}
                  </span>
                </div>
                <h4 className="font-title-md text-xs sm:text-sm text-slate-900 font-bold mb-0.5">
                  {d.title}
                </h4>
                <div className="text-xs text-slate-600 font-medium">
                  {d.medicineAffected}
                </div>
                <div className="flex items-center justify-between text-[11px] font-code-mono text-slate-500 mt-2 pt-2 border-t border-slate-100">
                  <span>{d.feedSource}</span>
                  <span className="text-red-700 font-bold">{d.clinicalReportsCount} Reports</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Inspection & Actions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">{currentDispute.title}</h3>
                <span className="text-xs text-slate-500 font-code-mono">Dispute ID: #{currentDispute.id}</span>
              </div>
              {onOpenAiTriage && (
                <button
                  onClick={() => onOpenAiTriage(currentDispute)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">psychology</span>
                  <span>AI Triage Advice</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs mb-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Affected Innovator</span>
                <span className="font-bold text-slate-800 text-sm">{currentDispute.medicineAffected}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Active Formulation Salt</span>
                <span className="font-bold text-slate-800 text-sm">{currentDispute.activeComposition}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 mb-4">
              <span className="font-bold text-slate-900 block mb-1">Clinical Discrepancy Note:</span>
              <p className="leading-relaxed">{currentDispute.discrepancyDescription}</p>
            </div>
          </div>

          {/* Triage Decision Controls */}
          <div className="mt-auto pt-4 border-t border-slate-200">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Clinical Reviewer Override / Quarantine Reason:
            </label>
            <textarea
              value={overrideNote}
              onChange={(e) => setOverrideNote(e.target.value)}
              placeholder="Provide pharmacological reasoning (e.g., 'Quarantining generic batch until re-assayed by CDSCO lab')..."
              className="w-full h-20 p-2.5 rounded border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#2563EB] mb-3"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] font-code-mono text-slate-500">
                Action will be cryptographically logged to tenant audit trail
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAction('Quarantine & Suppress')}
                  className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-title-md text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">block</span>
                  <span>Quarantine & Suppress</span>
                </button>
                <button
                  onClick={() => handleAction('Approve with Warning')}
                  className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-title-md text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">notification_important</span>
                  <span>Approve with Warning</span>
                </button>
                <button
                  onClick={() => handleAction('Dismiss Variation')}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-title-md text-xs font-semibold flex items-center gap-1 border border-slate-300 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  <span>Dismiss</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

