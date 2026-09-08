import React, { useState } from 'react';
import { MedicineCatalogEntry, LinkedGenericCompound } from '../types';

interface LinkGenericModalProps {
  medicine: MedicineCatalogEntry | null;
  onClose: () => void;
  onLink: (medId: string, newGeneric: LinkedGenericCompound) => void;
}

export const LinkGenericModal: React.FC<LinkGenericModalProps> = ({
  medicine,
  onClose,
  onLink
}) => {
  const [genericName, setGenericName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [stripPrice, setStripPrice] = useState<number>(100);
  const [formularyTier, setFormularyTier] = useState<'Tier 1 Primary' | 'Preferred' | 'Standard'>('Preferred');

  if (!medicine) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genericName) return;

    const savingsAmount = Math.max(0, medicine.brandedMrp - stripPrice);
    const savingsPercent = Math.round((savingsAmount / medicine.brandedMrp) * 100);

    const newGeneric: LinkedGenericCompound = {
      id: `gen-custom-${Date.now()}`,
      name: genericName,
      manufacturer: manufacturer || 'WHO-GMP Partner Lab',
      genericStripMrp: Number(stripPrice),
      compositionMatch: `${medicine.activeSalt} ${medicine.saltStrength} (Exact Bioequivalent)`,
      patientSavingsPercent: savingsPercent,
      patientSavingsAmount: savingsAmount,
      verifiedMatch: true,
      includedInPatientRx: true,
      formularyStatus: formularyTier
    };

    onLink(medicine.id, newGeneric);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2563EB] text-xl">hub</span>
            <h3 className="font-headline-sm text-sm font-bold text-slate-900">
              Link Generic Bioequivalent to {medicine.brandName}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Generic Brand / Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sitaglu 100 (Lupin)"
              value={genericName}
              onChange={(e) => setGenericName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Generic Manufacturer</label>
            <input
              type="text"
              placeholder="e.g. Lupin Pharmaceuticals"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Strip MRP (₹) *</label>
              <input
                type="number"
                required
                value={stripPrice}
                onChange={(e) => setStripPrice(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Formulary Tier</label>
              <select
                value={formularyTier}
                onChange={(e) => setFormularyTier(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded focus:border-[#2563EB] focus:outline-none bg-white"
              >
                <option value="Tier 1 Primary">Tier 1 Primary</option>
                <option value="Preferred">Preferred</option>
                <option value="Standard">Standard</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-900 text-[11px]">
            Prescribed Base MRP is <strong>₹{medicine.brandedMrp.toFixed(2)}</strong>. Patient will save{' '}
            <strong>
              {Math.max(0, Math.round(((medicine.brandedMrp - stripPrice) / medicine.brandedMrp) * 100))}%
            </strong>{' '}
            (₹{Math.max(0, medicine.brandedMrp - stripPrice).toFixed(2)}) per strip.
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-[#2563EB] hover:bg-blue-700 text-white font-semibold shadow-sm"
            >
              Link Generic
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
