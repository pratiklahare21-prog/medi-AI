import React, { useState, useEffect } from 'react';
import { MedicineCatalogEntry, PriceAlert } from '../types';

interface SetPriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: MedicineCatalogEntry | null;
  allMedicines?: MedicineCatalogEntry[];
  onSave?: (alert: PriceAlert) => Promise<any> | void;
  onSaveAlert?: (alert: PriceAlert) => void;
  existingAlert?: PriceAlert | null;
}

export const SetPriceAlertModal: React.FC<SetPriceAlertModalProps> = ({
  isOpen,
  onClose,
  medicine,
  allMedicines = [],
  onSave,
  onSaveAlert,
  existingAlert
}) => {
  const [selectedMedId, setSelectedMedId] = useState<string>(
    medicine ? medicine.id : allMedicines[0]?.id || ''
  );
  const [targetPrice, setTargetPrice] = useState<number>(100);
  const [channel, setChannel] = useState<'In-App' | 'SMS & WhatsApp' | 'Email Digest'>('In-App');
  const [recipientTarget, setRecipientTarget] = useState<string>('dr.jenkins@apollohealth.org');
  const [notes, setNotes] = useState<string>('');

  const currentMed = allMedicines.find((m) => m.id === selectedMedId) || medicine || allMedicines[0];

  useEffect(() => {
    if (medicine) {
      setSelectedMedId(medicine.id);
      if (existingAlert) {
        setTargetPrice(existingAlert.targetThresholdPrice);
        setChannel(existingAlert.channel);
        setRecipientTarget(existingAlert.recipientTarget);
        setNotes(existingAlert.notes || '');
      } else {
        // Default target to ~15% below current lowest price
        const defTarget = Math.max(10, Math.round(medicine.lowestGenericPrice * 0.85));
        setTargetPrice(defTarget);
        setNotes(`Price drop alert for ${medicine.brandName} (${medicine.activeSalt})`);
      }
    } else if (allMedicines.length > 0 && !selectedMedId) {
      setSelectedMedId(allMedicines[0].id);
    }
  }, [medicine, existingAlert, allMedicines]);

  if (!isOpen || !currentMed) return null;

  const currentLowest = currentMed.lowestGenericPrice;
  const brandedMrp = currentMed.brandedMrp;
  const isBelowCurrent = targetPrice < currentLowest;
  const deltaSavings = Math.max(0, currentLowest - targetPrice);
  const additionalSavingsPercent = currentLowest > 0 
    ? Math.round(((currentLowest - targetPrice) / currentLowest) * 100) 
    : 0;
  const totalSavingsVsBrandedPercent = brandedMrp > 0 
    ? Math.round(((brandedMrp - targetPrice) / brandedMrp) * 100) 
    : 0;

  const handleApplyPreset = (percentDiscount: number) => {
    const discounted = Math.max(5, Math.round(currentLowest * (1 - percentDiscount / 100)));
    setTargetPrice(discounted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetPrice <= 0) return;

    const newOrUpdatedAlert: PriceAlert = {
      id: existingAlert ? existingAlert.id : `alert-${Date.now()}`,
      medicineId: currentMed.id,
      medicineName: currentMed.brandName,
      activeSalt: currentMed.activeSalt,
      brandedMrp: currentMed.brandedMrp,
      currentLowestPrice: currentMed.lowestGenericPrice,
      targetThresholdPrice: Number(targetPrice),
      channel,
      recipientTarget: recipientTarget || 'In-App Notifications',
      status: targetPrice >= currentMed.lowestGenericPrice ? 'Triggered' : 'Active',
      createdAt: existingAlert ? existingAlert.createdAt : 'Just now',
      triggeredAt: targetPrice >= currentMed.lowestGenericPrice ? 'Immediate match' : undefined,
      triggeredPrice: targetPrice >= currentMed.lowestGenericPrice ? currentMed.lowestGenericPrice : undefined,
      triggeredBrand: targetPrice >= currentMed.lowestGenericPrice ? currentMed.lowestGenericBrand : undefined,
      notes: notes.trim() || undefined
    };

    if (onSaveAlert) {
      onSaveAlert(newOrUpdatedAlert);
    } else if (onSave) {
      onSave(newOrUpdatedAlert);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">notifications_active</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-sm sm:text-base font-bold text-slate-900">
                {existingAlert ? 'Edit Price Alert Notification' : 'Set Price Alert Notification'}
              </h3>
              <p className="text-[11px] text-slate-500 font-code-mono">
                Automated threshold monitoring across partner feeds & Jan Aushadhi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs text-slate-700">
          {/* Medicine Selection */}
          <div>
            <label className="font-semibold text-slate-800 block mb-1">
              Target Medicine & Salt Compound *
            </label>
            <select
              value={selectedMedId}
              onChange={(e) => {
                setSelectedMedId(e.target.value);
                const chosen = allMedicines.find((m) => m.id === e.target.value);
                if (chosen) {
                  setTargetPrice(Math.max(10, Math.round(chosen.lowestGenericPrice * 0.85)));
                }
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:border-[#2563EB] focus:bg-white focus:outline-none"
            >
              {allMedicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.brandName} — {m.activeSalt} (Lowest Generic: ₹{m.lowestGenericPrice.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Current Pricing Benchmark Pill */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Branded MRP Base</span>
              <span className="text-base font-bold text-slate-900 font-code-mono">
                ₹{currentMed.brandedMrp.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 block">{currentMed.brandName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Current Lowest Generic</span>
              <span className="text-base font-bold text-emerald-700 font-code-mono">
                ₹{currentMed.lowestGenericPrice.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium block">
                {currentMed.lowestGenericBrand}
              </span>
            </div>
          </div>

          {/* Target Price Input & Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-800">
                Notify Me When Price Drops Below (₹) *
              </label>
              <span className="text-[11px] font-code-mono font-bold text-[#2563EB]">
                Target: ₹{Number(targetPrice).toFixed(2)}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                step="0.5"
                min="1"
                max={currentMed.brandedMrp * 2}
                required
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg text-sm font-code-mono font-bold text-slate-900 focus:border-[#2563EB] focus:outline-none"
                placeholder="e.g. 95"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] text-slate-500 font-medium">Quick Presets:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset(10)}
                className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#2563EB] hover:bg-blue-100 text-[10px] font-semibold cursor-pointer transition-colors"
              >
                -10% (₹{Math.max(5, Math.round(currentLowest * 0.9))})
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(20)}
                className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#2563EB] hover:bg-blue-100 text-[10px] font-semibold cursor-pointer transition-colors"
              >
                -20% (₹{Math.max(5, Math.round(currentLowest * 0.8))})
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(30)}
                className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#2563EB] hover:bg-blue-100 text-[10px] font-semibold cursor-pointer transition-colors"
              >
                -30% (₹{Math.max(5, Math.round(currentLowest * 0.7))})
              </button>
            </div>
          </div>

          {/* Savings Calculation Preview */}
          <div
            className={`p-3 rounded-lg border text-xs leading-relaxed ${
              isBelowCurrent
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            {isBelowCurrent ? (
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-base shrink-0 mt-0.5">
                  trending_down
                </span>
                <div>
                  <strong>Potential Extra Savings:</strong> If prices drop to ₹{Number(targetPrice).toFixed(2)}, patients will save an additional{' '}
                  <strong className="text-emerald-700">₹{deltaSavings.toFixed(2)}</strong> per strip ({additionalSavingsPercent}% extra drop below current lowest generic, and {totalSavingsVsBrandedPercent}% below branded MRP).
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-600 text-base shrink-0 mt-0.5">
                  info
                </span>
                <div>
                  <strong>Immediate Trigger Threshold:</strong> Target ₹{Number(targetPrice).toFixed(2)} is higher than or equal to current lowest generic price (₹{currentLowest.toFixed(2)}). This alert will activate immediately upon save!
                </div>
              </div>
            )}
          </div>

          {/* Delivery Channel */}
          <div>
            <label className="font-semibold text-slate-800 block mb-1">
              Notification Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setChannel('In-App');
                  setRecipientTarget('In-App Bell & Dashboard');
                }}
                className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                  channel === 'In-App'
                    ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-base block mb-0.5">notifications</span>
                In-App Alert
              </button>

              <button
                type="button"
                onClick={() => {
                  setChannel('SMS & WhatsApp');
                  if (!recipientTarget.startsWith('+')) setRecipientTarget('+91 98201 44521');
                }}
                className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                  channel === 'SMS & WhatsApp'
                    ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-base block mb-0.5">chat</span>
                WhatsApp / SMS
              </button>

              <button
                type="button"
                onClick={() => {
                  setChannel('Email Digest');
                  if (!recipientTarget.includes('@')) setRecipientTarget('dr.jenkins@apollohealth.org');
                }}
                className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                  channel === 'Email Digest'
                    ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-base block mb-0.5">mail</span>
                Email Digest
              </button>
            </div>
          </div>

          {/* Recipient Target Detail */}
          {channel !== 'In-App' && (
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                {channel === 'SMS & WhatsApp' ? 'Mobile / WhatsApp Number' : 'Email Address'}
              </label>
              <input
                type={channel === 'SMS & WhatsApp' ? 'tel' : 'email'}
                required
                value={recipientTarget}
                onChange={(e) => setRecipientTarget(e.target.value)}
                placeholder={channel === 'SMS & WhatsApp' ? '+91 98765 43210' : 'name@example.com'}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:border-[#2563EB] focus:outline-none font-code-mono"
              />
            </div>
          )}

          {/* Notes / Clinical Context */}
          <div>
            <label className="font-semibold text-slate-800 block mb-1">
              Reference Note / Clinical Purpose (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Monthly refill for diabetic patient cohort"
              className="w-full p-2 border border-slate-300 rounded text-xs focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">notifications_active</span>
              <span>{existingAlert ? 'Update Alert' : 'Activate Price Alert'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
