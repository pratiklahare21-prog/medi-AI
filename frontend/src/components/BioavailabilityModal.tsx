import React from 'react';
import { MedicineCatalogEntry } from '../types';

interface BioavailabilityModalProps {
  medicine: MedicineCatalogEntry | null;
  onClose: () => void;
}

export const BioavailabilityModal: React.FC<BioavailabilityModalProps> = ({
  medicine,
  onClose
}) => {
  if (!medicine) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2563EB] text-xl">science</span>
            <div>
              <h3 className="font-headline-sm text-sm sm:text-base font-bold text-slate-900">
                In-Vitro Dissolution & Bioavailability Curve
              </h3>
              <p className="text-[11px] text-slate-500 font-code-mono">
                Compound: {medicine.brandName} vs {medicine.lowestGenericBrand} ({medicine.activeSalt})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          {/* Summary Metric Chips */}
          <div className="grid grid-cols-3 gap-3 text-center font-code-mono">
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] text-emerald-800 uppercase font-bold block">Dissimilarity f1</span>
              <span className="text-base font-bold text-emerald-700">3.4%</span>
              <span className="text-[9px] text-emerald-600 block">&lt; 15% (Compliant)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] text-emerald-800 uppercase font-bold block">Similarity Factor f2</span>
              <span className="text-base font-bold text-emerald-700">74.2</span>
              <span className="text-[9px] text-emerald-600 block">&gt; 50 (Compliant)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-[10px] text-blue-800 uppercase font-bold block">Bioequivalence Status</span>
              <span className="text-sm font-bold text-[#2563EB]">100% Bioequivalent</span>
              <span className="text-[9px] text-blue-600 block">CDSCO Certified</span>
            </div>
          </div>

          {/* Graphical In-Vitro Dissolution Simulation */}
          <div className="p-4 rounded-lg bg-slate-900 text-white">
            <div className="flex items-center justify-between mb-3 text-[11px] text-slate-300">
              <span className="font-semibold">Dissolution Rate Profile (% Drug Released over Time)</span>
              <span className="font-code-mono text-slate-400">Media: pH 6.8 Buffer (USP Apparatus II, 50 RPM)</span>
            </div>

            {/* Time points curve simulation */}
            <div className="space-y-2 font-code-mono text-[11px]">
              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>10 mins:</span>
                  <span>Innovator (Januvia): 48% | Generic (Zita): 46%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                  <div className="bg-blue-400 h-full" style={{ width: '48%' }}></div>
                  <div className="bg-emerald-400 h-full" style={{ width: '46%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>20 mins:</span>
                  <span>Innovator (Januvia): 76% | Generic (Zita): 74%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                  <div className="bg-blue-400 h-full" style={{ width: '76%' }}></div>
                  <div className="bg-emerald-400 h-full" style={{ width: '74%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>30 mins (Endpoint):</span>
                  <span>Innovator (Januvia): 98% | Generic (Zita): 97%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                  <div className="bg-blue-400 h-full" style={{ width: '98%' }}></div>
                  <div className="bg-emerald-400 h-full" style={{ width: '97%' }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-800 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-blue-400 rounded"></span>
                <span className="text-slate-300">Prescribed Innovator (Reference)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-emerald-400 rounded"></span>
                <span className="text-slate-300">Generic Alternative (Test Formulation)</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 leading-relaxed">
            <strong>Clinical Review Summary:</strong> Dissolution profile between {medicine.brandName} and {medicine.lowestGenericBrand} confirms bio-equivalence across pH 1.2, pH 4.5, and pH 6.8 media under WHO guideline TRS 937. No clinical safety or therapeutic substitution risk detected.
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="font-code-mono text-[11px] text-slate-400">
            Assay Certificate: #CDSCO-QC-9942A
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
