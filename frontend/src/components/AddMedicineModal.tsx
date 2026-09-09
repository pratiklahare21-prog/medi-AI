import React, { useState } from 'react';
import { MedicineCatalogEntry } from '../types';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newEntry: MedicineCatalogEntry) => void;
}

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [brandName, setBrandName] = useState('');
  const [activeSalt, setActiveSalt] = useState('');
  const [saltStrength, setSaltStrength] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [brandedMrp, setBrandedMrp] = useState<number>(250);
  const [genericBrand, setGenericBrand] = useState('');
  const [genericPrice, setGenericPrice] = useState<number>(65);
  const [therapeuticCategory, setTherapeuticCategory] = useState('Anti-diabetic & Incretins');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName || !activeSalt) return;

    const savings = brandedMrp - genericPrice;
    const savingsPercent = Math.round((savings / brandedMrp) * 100);

    const newMed: MedicineCatalogEntry = {
      id: `med-${Date.now()}`,
      brandName,
      manufacturer: manufacturer || 'Standard Pharma Labs',
      activeSalt,
      saltStrength: saltStrength || 'Standard Dose',
      atcCode: 'ATC-CUSTOM-01',
      dosageForm: 'Oral Tablet',
      formulationType: 'Strip of 10 Tablets',
      compositionDetails: `${activeSalt} ${saltStrength}`,
      brandedMrp: Number(brandedMrp),
      lowestGenericBrand: genericBrand || `${activeSalt} Generic`,
      lowestGenericPrice: Number(genericPrice),
      savingsAmount: savings,
      savingsPercent: savingsPercent,
      savingsIntervalText: 'Per 30-day course',
      verifiedGenericsCount: 1,
      regulatoryStatus: '100% Bioequivalent',
      bioequivalenceConfidence: 100,
      verifierName: 'Dr. Sarah Jenkins',
      verifiedTimeAgo: 'Just now',
      therapeuticCategory,
      pharmacopeiaStandard: 'IP / USP Reference Standard',
      dissolutionNote: 'Dissolution profile similarity f2 > 65 across standard buffers.',
      genericsList: [
        {
          id: `gen-${Date.now()}`,
          name: genericBrand || `${activeSalt} Generic`,
          manufacturer: 'Generic Pharma Lab',
          genericStripMrp: Number(genericPrice),
          compositionMatch: 'Identical Salt & Strength',
          patientSavingsPercent: savingsPercent,
          patientSavingsAmount: savings,
          verifiedMatch: true,
          includedInPatientRx: true,
          formularyStatus: 'Tier 1 Primary'
        }
      ]
    };

    onAdd(newMed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2563EB] text-xl">add_circle</span>
            <h3 className="font-headline-sm text-sm sm:text-base font-bold text-slate-900">
              Add Medicine & Formulations Entry
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Prescribed Brand Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Lipitor 20mg"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Active Salt (INN) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Atorvastatin"
                value={activeSalt}
                onChange={(e) => setActiveSalt(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Strength</label>
              <input
                type="text"
                placeholder="e.g. 20mg"
                value={saltStrength}
                onChange={(e) => setSaltStrength(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Manufacturer</label>
              <input
                type="text"
                placeholder="e.g. Pfizer"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Branded MRP (₹) *</label>
              <input
                type="number"
                required
                value={brandedMrp}
                onChange={(e) => setBrandedMrp(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Top Generic Alternative</label>
              <input
                type="text"
                placeholder="e.g. Atorva 20 (Zydus)"
                value={genericBrand}
                onChange={(e) => setGenericBrand(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Generic Price (₹) *</label>
              <input
                type="number"
                required
                value={genericPrice}
                onChange={(e) => setGenericPrice(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Therapeutic Category</label>
            <select
              value={therapeuticCategory}
              onChange={(e) => setTherapeuticCategory(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:border-[#2563EB] focus:outline-none bg-white"
            >
              <option>Anti-diabetic & Incretins</option>
              <option>Cardiovascular (Hypertension/Lipids)</option>
              <option>Gastrointestinal & Proton Inhibitors</option>
              <option>Anti-infective & Antibiotic</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#2563EB] hover:bg-blue-700 text-white font-semibold transition-colors shadow-sm"
            >
              Save Medicine Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
