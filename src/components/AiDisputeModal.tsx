import React, { useState, useEffect } from 'react';
import { AccuracyDisputeItem } from '../types';
import { api, AiDisputeTriageResult } from '../services/api';

interface AiDisputeModalProps {
  isOpen: boolean;
  dispute: AccuracyDisputeItem | null;
  onClose: () => void;
  onApplyDecision: (disputeId: string, decision: string) => void;
}

export const AiDisputeModal: React.FC<AiDisputeModalProps> = ({
  isOpen,
  dispute,
  onClose,
  onApplyDecision
}) => {
  const [loading, setLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<AiDisputeTriageResult | null>(null);

  useEffect(() => {
    if (isOpen && dispute) {
      setLoading(true);
      setTriageResult(null);
      api.triageDispute(dispute.id)
        .then(result => {
          setTriageResult(result);
        })
        .catch(err => {
          console.warn('Failed to load AI dispute triage', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, dispute]);

  if (!isOpen || !dispute) return null;

  const handleApply = () => {
    if (triageResult) {
      onApplyDecision(dispute.id, triageResult.aiTriage.recommendedAction);
      onClose();
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    if (severity === 'Critical') return 'bg-red-50 text-red-700 border-red-200';
    if (severity === 'Warning') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-blue-200">
              <span className="material-symbols-outlined text-lg">psychology</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Gemini AI Auto-Triage & Evidence Analysis</h3>
              <p className="text-[11px] text-blue-200 font-code-mono">Dispute #{dispute.id} · {dispute.feedSource}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
          {/* Dispute Context Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-slate-900">{dispute.title}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Target: <strong>{dispute.medicineAffected}</strong> ({dispute.activeComposition})
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getSeverityBadgeColor(dispute.severity)}`}>
              {dispute.severity}
            </span>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium">Cross-referencing CDSCO pricing databases & historical feed variance...</p>
            </div>
          ) : triageResult ? (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200">
                  <span className="text-[11px] text-blue-700 font-bold uppercase tracking-wider block">Anomaly Score</span>
                  <div className="text-2xl font-bold font-display-lg text-slate-900 mt-1">
                    {triageResult.aiTriage.anomalyScore}%
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {triageResult.aiTriage.anomalyScore > 70 ? 'Severe Discrepancy' : 'Moderate Tolerance'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200">
                  <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider block">AI Confidence</span>
                  <div className="text-2xl font-bold font-display-lg text-emerald-700 mt-1">
                    {triageResult.aiTriage.confidence}%
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Regulatory DPCO Match
                  </span>
                </div>
              </div>

              {/* Recommended Decision Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block font-code-mono">
                  Recommended Clinical Resolution
                </span>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  {triageResult.aiTriage.recommendedAction}
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  Regulatory Impact: {triageResult.aiTriage.regulatoryImpact}
                </div>
              </div>

              {/* Evidence Points */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Clinical & Market Evidence Trail:
                </h4>
                <div className="space-y-2">
                  {triageResult.aiTriage.evidencePoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                      <span className="material-symbols-outlined text-base text-blue-600 shrink-0">verified</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-red-600">Failed to load AI triage assessment. Please try again.</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={loading || !triageResult}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">done_all</span>
            <span>Apply AI Recommendation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
