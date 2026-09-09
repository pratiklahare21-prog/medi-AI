import React, { useState } from 'react';
import { MedicineCatalogEntry } from '../types';

interface MedicineComparisonViewProps {
  medicines: MedicineCatalogEntry[];
}

export const MedicineComparisonView: React.FC<MedicineComparisonViewProps> = ({ medicines }) => {
  const [selectedBranded, setSelectedBranded] = useState<MedicineCatalogEntry | null>(
    medicines.length > 0 ? medicines[0] : null
  );
  const [selectedGeneric, setSelectedGeneric] = useState<string | null>(null);

  const genericOptions = selectedBranded?.genericsList || [];
  const selectedGenericData = genericOptions.find((g) => g.id === selectedGeneric);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-headline-sm text-slate-900">
              Medicine Comparison Tool
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Side-by-side detailed bioequivalence, pricing, and savings analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">download</span>
              Export PDF Report
            </button>
            <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">share</span>
              Share Comparison
            </button>
          </div>
        </div>
      </div>

      {/* Selection Controls */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="grid grid-cols-2 gap-6">
          {/* Branded Medicine Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Branded Medicine
            </label>
            <select
              value={selectedBranded?.id || ''}
              onChange={(e) => {
                const med = medicines.find((m) => m.id === e.target.value);
                setSelectedBranded(med || null);
                setSelectedGeneric(null);
              }}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choose a branded medicine --</option>
              {medicines.map((med) => (
                <option key={med.id} value={med.id}>
                  {med.brandName} ({med.activeSalt}) - ₹{med.brandedMrp.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Generic Medicine Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Generic Alternative
            </label>
            <select
              value={selectedGeneric || ''}
              onChange={(e) => setSelectedGeneric(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedBranded || genericOptions.length === 0}
            >
              <option value="">-- Choose a generic alternative --</option>
              {genericOptions.map((gen) => (
                <option key={gen.id} value={gen.id}>
                  {gen.name} by {gen.manufacturer} - ₹{gen.genericStripMrp.toFixed(2)} ({gen.patientSavingsPercent}% savings)
                </option>
              ))}
            </select>
            {selectedBranded && genericOptions.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No verified generics available for this medicine</p>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Content */}
      <div className="flex-1 overflow-auto p-6">
        {!selectedBranded ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">compare_arrows</span>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Select Medicines to Compare</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Choose a branded medicine and a generic alternative to see detailed side-by-side comparison
            </p>
          </div>
        ) : !selectedGenericData ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="material-symbols-outlined text-6xl text-blue-300 mb-4">medications</span>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Select a Generic Alternative</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Choose a verified generic to compare with {selectedBranded.brandName}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {/* Branded Column */}
            <div className="bg-white rounded-xl border-2 border-blue-200 shadow-sm">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Branded Medicine</span>
                    <h3 className="text-xl font-bold mt-1">{selectedBranded.brandName}</h3>
                  </div>
                  <span className="material-symbols-outlined text-4xl opacity-80">verified</span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Basic Info */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Manufacturer:</span>
                      <span className="font-semibold text-slate-900">{selectedBranded.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Formulation:</span>
                      <span className="font-semibold text-slate-900">{selectedBranded.formulationType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Dosage Form:</span>
                      <span className="font-semibold text-slate-900">{selectedBranded.dosageForm}</span>
                    </div>
                  </div>
                </div>

                {/* Composition */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Composition</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Active Salt:</span>
                      <span className="font-semibold text-slate-900">{selectedBranded.activeSalt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Strength:</span>
                      <span className="font-semibold text-slate-900">{selectedBranded.saltStrength}</span>
                    </div>
                    <div className="bg-slate-50 rounded p-2 border border-slate-200">
                      <span className="text-xs text-slate-600">Full Composition:</span>
                      <p className="text-xs text-slate-900 font-medium mt-1">{selectedBranded.compositionDetails}</p>
                    </div>
                  </div>
                </div>

                {/* Regulatory */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Regulatory Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Approval:</span>
                      <span className="font-semibold text-slate-900">{selectedBranded.regulatoryStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">ATC Code:</span>
                      <span className="font-code-mono text-slate-900 font-medium">{selectedBranded.atcCode}</span>
                    </div>
                    {selectedBranded.innCode && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">INN Code:</span>
                        <span className="font-code-mono text-slate-900 font-medium">{selectedBranded.innCode}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pricing</h4>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-center">
                      <span className="text-xs text-blue-700 font-semibold uppercase tracking-wider">Brand MRP</span>
                      <div className="text-3xl font-bold text-blue-900 mt-1">₹{selectedBranded.brandedMrp.toFixed(2)}</div>
                      <span className="text-xs text-blue-600">per {selectedBranded.formulationType}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generic Column */}
            <div className="bg-white rounded-xl border-2 border-emerald-200 shadow-sm">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Generic Alternative</span>
                    <h3 className="text-xl font-bold mt-1">{selectedGenericData.name}</h3>
                  </div>
                  <span className="material-symbols-outlined text-4xl opacity-80">science</span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Basic Info */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Manufacturer:</span>
                      <span className="font-semibold text-slate-900">{selectedGenericData.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Formulation:</span>
                      <span className="font-semibold text-slate-900">{selectedBranded.formulationType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Dosage Form:</span>
                      <span className="font-semibold text-slate-900">{selectedBranded.dosageForm}</span>
                    </div>
                  </div>
                </div>

                {/* Composition Match */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Bioequivalence Verification</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Composition Match:</span>
                      <span className="font-semibold text-emerald-700">{selectedGenericData.compositionMatch}</span>
                    </div>
                    {selectedGenericData.similarityFactorF2 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">f₂ Similarity Factor:</span>
                        <span className="font-bold text-emerald-700">{selectedGenericData.similarityFactorF2.toFixed(1)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Verified Match:</span>
                      {selectedGenericData.verifiedMatch ? (
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <span className="material-symbols-outlined text-base">check_circle</span>
                          Yes
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600 font-semibold">
                          <span className="material-symbols-outlined text-base">pending</span>
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Formulary Status */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Formulary Status</h4>
                  <div className="bg-slate-50 rounded p-3 border border-slate-200 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      selectedGenericData.formularyStatus === 'Tier 1 Primary'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : selectedGenericData.formularyStatus === 'Preferred'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-slate-200 text-slate-700 border border-slate-300'
                    }`}>
                      {selectedGenericData.formularyStatus}
                    </span>
                  </div>
                </div>

                {/* Pricing & Savings */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pricing & Savings</h4>
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                    <div className="text-center">
                      <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Generic Price</span>
                      <div className="text-3xl font-bold text-emerald-900 mt-1">₹{selectedGenericData.genericStripMrp.toFixed(2)}</div>
                      <span className="text-xs text-emerald-600">per {selectedBranded.formulationType}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Savings Summary Card */}
        {selectedBranded && selectedGenericData && (
          <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-3xl">savings</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Patient Savings Analysis</h3>
                  <p className="text-sm text-slate-600">Switching from {selectedBranded.brandName} to {selectedGenericData.name}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-4xl font-bold text-orange-700">
                  ₹{selectedGenericData.patientSavingsAmount.toFixed(2)}
                </div>
                <div className="text-sm text-slate-700 font-semibold mt-1">
                  {selectedGenericData.patientSavingsPercent.toFixed(1)}% savings per strip
                </div>
                <div className="text-xs text-slate-600 mt-2">
                  Monthly savings (30-day supply): <span className="font-bold text-orange-700">₹{(selectedGenericData.patientSavingsAmount * 2).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
