import React, { useState, useRef } from 'react';
import { MedicineCatalogEntry, ChronicPack, OCRDetectedMedicine, PriceAlert } from '../types';
import { api, AiRecommendationResponse, AiSearchResult } from '../services/api';

interface PatientPortalViewProps {
  catalog: MedicineCatalogEntry[];
  chronicPacks: ChronicPack[];
  alerts: PriceAlert[];
  onAddToCart: (item: { name: string; price: number; originalPrice: number; savings: number }) => void;
  onOpenSetAlert: (med: MedicineCatalogEntry) => void;
  onOpenAlertsManager: () => void;
  cartCount: number;
  totalSaved: number;
}

export const PatientPortalView: React.FC<PatientPortalViewProps> = ({
  catalog,
  chronicPacks,
  alerts,
  onAddToCart,
  onOpenSetAlert,
  onOpenAlertsManager,
  cartCount,
  totalSaved
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineCatalogEntry>(catalog[0]); // default Januvia 100mg
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrResults, setOcrResults] = useState<OCRDetectedMedicine[] | null>(null);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>('cardio');

  // OCR Inline Editing State
  const [editingOcrId, setEditingOcrId] = useState<string | null>(null);
  const [editPrescribedName, setEditPrescribedName] = useState('');
  const [editDosage, setEditDosage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Regimen Recommender State
  const [recCondition, setRecCondition] = useState('Type 2 Diabetes');
  const [recCurrentMeds, setRecCurrentMeds] = useState<string[]>(['Metformin 500mg']);
  const [recSensitivity, setRecSensitivity] = useState<'maximum-savings' | 'balanced' | 'primary-brand'>('maximum-savings');
  const [recLoading, setRecLoading] = useState(false);
  const [recResult, setRecResult] = useState<AiRecommendationResponse | null>(null);

  // AI Search State
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchResult, setAiSearchResult] = useState<AiSearchResult | null>(null);

  // Filter for search suggestions
  const searchResults = searchQuery.trim()
    ? catalog.filter(
        (m) =>
          m.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.activeSalt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectMed = (med: MedicineCatalogEntry) => {
    setSelectedMedicine(med);
    setSearchQuery('');
    setAiSearchResult(null);
  };

  const handleRunOcrPreset = async (presetId: string) => {
    setActivePreset(presetId);
    setOcrScanning(true);
    setOcrResults(null);
    setOcrSuccessMsg(null);
    try {
      const results = await api.ocrPrescription({ presetId });
      setOcrResults(results);
      const totalSavings = results.reduce((acc, m) => acc + m.savings, 0);
      setOcrSuccessMsg(`Prescription verified by SastaRx Vision AI with ${results.length} bioequivalent alternatives. Projected savings: ₹${totalSavings.toFixed(2)}.`);
    } catch (err) {
      console.warn('OCR preset error', err);
    } finally {
      setOcrScanning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrScanning(true);
    setOcrResults(null);
    setOcrSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const results = await api.ocrPrescription({
          imageBase64: base64,
          mimeType: file.type || 'image/jpeg'
        });
        setOcrResults(results);
        const totalSavings = results.reduce((acc, m) => acc + m.savings, 0);
        setOcrSuccessMsg(`Prescription '${file.name}' analyzed by Gemini Vision AI. Identified ${results.length} medications saving ₹${totalSavings.toFixed(2)}.`);
      } catch (err) {
        console.warn('File OCR error', err);
      } finally {
        setOcrScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStartEdit = (item: OCRDetectedMedicine) => {
    setEditingOcrId(item.id);
    setEditPrescribedName(item.extractedName);
    setEditDosage(item.dosageInstructions);
  };

  const handleSaveEdit = (id: string) => {
    if (!ocrResults) return;
    setOcrResults(prev =>
      prev ? prev.map(m => (m.id === id ? { ...m, extractedName: editPrescribedName, dosageInstructions: editDosage } : m)) : null
    );
    setEditingOcrId(null);
  };

  const handleAddAllOcr = () => {
    if (!ocrResults) return;
    ocrResults.forEach((item) => {
      onAddToCart({
        name: item.suggestedGeneric,
        price: item.genericPrice,
        originalPrice: item.originalPrice,
        savings: item.savings
      });
    });
    const totalSavings = ocrResults.reduce((acc, m) => acc + m.savings, 0);
    setOcrSuccessMsg(`Added all ${ocrResults.length} generic bioequivalents to cart! You are saving ₹${totalSavings.toFixed(2)} on this prescription.`);
  };

  const handleGenerateRegimen = async () => {
    setRecLoading(true);
    try {
      const result = await api.getAiRecommendations({
        condition: recCondition,
        currentMedications: recCurrentMeds,
        priceSensitivity: recSensitivity
      });
      setRecResult(result);
    } catch (err) {
      console.warn('AI recommend error', err);
    } finally {
      setRecLoading(false);
    }
  };

  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsAiSearching(true);
    try {
      const result = await api.aiSearch(searchQuery);
      setAiSearchResult(result);
      if (result.data.length > 0) {
        setSelectedMedicine(result.data[0]);
      }
    } catch (err) {
      console.warn('AI search error', err);
    } finally {
      setIsAiSearching(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto pb-20">
      {/* Top Value Banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-6 sm:p-8 mb-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            100% CDSCO Bioequivalent Guaranteed
          </div>
          <h1 className="font-display-lg text-2xl sm:text-4xl font-bold tracking-tight text-white mb-2 leading-tight">
            Stop Overpaying for Brand Names. <br className="hidden sm:inline" />
            Switch to Exact Generic Salts.
          </h1>
          <p className="text-blue-100 text-xs sm:text-base leading-relaxed mb-6 font-body-md">
            Identical active pharmaceutical ingredients, exact dissolution standards, and verified bioavailability — at a fraction of the cost.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-code-mono text-blue-200">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-400 text-base">verified</span>
              <span>18,430 Generics Indexed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-400 text-base">savings</span>
              <span>Avg ₹418 Saved Per Rx</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-400 text-base">local_shipping</span>
              <span>Home Delivery Available</span>
            </div>
          </div>
        </div>

        {/* Decorative background watermark */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[260px] text-white">medication</span>
        </div>
      </div>

      {/* Floating Cart Indicator if items added */}
      {cartCount > 0 && (
        <div className="sticky top-16 z-30 mb-6 p-3.5 rounded-lg bg-emerald-600 text-white shadow-lg flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white text-emerald-700 flex items-center justify-center font-bold text-sm">
              {cartCount}
            </div>
            <div>
              <span className="font-semibold text-xs sm:text-sm">Generic Rx Cart Active</span>
              <span className="text-xs text-emerald-100 block">
                Total Patient Savings: <strong>₹{totalSaved.toFixed(2)}</strong>
              </span>
            </div>
          </div>
          <button 
            onClick={() => alert(`Proceeding to SastaRx checkout with ${cartCount} generic items saving ₹${totalSaved.toFixed(2)}!`)}
            className="px-4 py-1.5 rounded-lg bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm"
          >
            Review Cart &rarr;
          </button>
        </div>
      )}

      {/* Search Section */}
      <div className="mb-8">
        <div className="relative">
          <div className="flex items-center bg-white border-2 border-slate-300 rounded-xl shadow-xs focus-within:border-[#2563EB] p-1.5 transition-all">
            <span className="material-symbols-outlined text-slate-400 text-2xl ml-3">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your prescribed brand (e.g. Januvia 100mg, Telma 40, Pan-D, Crestor)..."
              className="w-full px-3 py-2 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none font-body-md"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 mr-2"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
            <button className="px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer shrink-0">
              Find Generic
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl border border-slate-200 shadow-xl z-20 overflow-hidden divide-y divide-slate-100">
              {searchResults.map((med) => (
                <div
                  key={med.id}
                  onClick={() => handleSelectMed(med)}
                  className="p-3.5 hover:bg-blue-50/70 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-xs">
                      Rx
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{med.brandName}</div>
                      <div className="text-xs text-slate-500">{med.activeSalt} · {med.compositionDetails}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      Save {med.savingsPercent}% (₹{med.lowestGenericPrice.toFixed(2)})
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">vs ₹{med.brandedMrp.toFixed(2)} MRP</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills & Price Alerts Watchlist */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Common Searches:</span>
            {catalog.slice(0, 4).map((med) => (
              <button
                key={med.id}
                onClick={() => handleSelectMed(med)}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
              >
                {med.brandName}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenAlertsManager}
            className="px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-300 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Open patient price drop alerts watchlist"
          >
            <span className="material-symbols-outlined text-sm text-amber-600">notifications_active</span>
            <span>Price Drop Alerts ({alerts.length})</span>
            {alerts.some(a => a.status === 'Triggered') && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Featured Price Comparison Card */}
      {selectedMedicine && (
        <div className="mb-10 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2 mb-6">
            <div>
              <span className="text-xs font-code-mono text-emerald-700 font-bold uppercase tracking-wider">
                Direct Bioequivalent Comparison
              </span>
              <h2 className="font-headline-sm text-xl font-bold text-slate-900">
                Comparing Alternatives for {selectedMedicine.brandName}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-semibold">
              <span className="material-symbols-outlined text-sm">science</span>
              <span>Active Salt: {selectedMedicine.activeSalt} {selectedMedicine.saltStrength}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left: Prescribed Brand */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Prescribed Brand</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">Innovator/Branded</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{selectedMedicine.brandName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedMedicine.manufacturer}</p>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="text-xs text-slate-500">Retail MRP per strip:</div>
                  <div className="text-2xl font-bold text-slate-900 font-display-lg mt-0.5">
                    ₹{selectedMedicine.brandedMrp.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="mt-6 text-xs text-slate-400 font-code-mono">
                {selectedMedicine.formulationType} • Schedule H Prescription
              </div>
            </div>

            {/* Right: SastaRx Verified Generic */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50/80 to-blue-50/80 border-2 border-emerald-500 flex flex-col justify-between h-full relative overflow-hidden shadow-xs">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white font-bold text-[11px] px-3 py-1 rounded-bl-lg">
                SAVE {selectedMedicine.savingsPercent}%
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Top Bioequivalent Generic</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">verified</span> CDSCO Approved
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{selectedMedicine.lowestGenericBrand}</h3>
                <p className="text-xs text-slate-600 mt-0.5">Manufactured by WHO-GMP Certified Facilities</p>
                <div className="mt-4 pt-4 border-t border-emerald-200/60 flex items-baseline justify-between">
                  <div>
                    <div className="text-xs text-slate-600">Generic Price per strip:</div>
                    <div className="text-3xl font-bold text-emerald-700 font-display-lg mt-0.5">
                      ₹{selectedMedicine.lowestGenericPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-emerald-800 block">
                      You Save ₹{selectedMedicine.savingsAmount.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500">Per 30-day treatment</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() =>
                    onAddToCart({
                      name: selectedMedicine.lowestGenericBrand,
                      price: selectedMedicine.lowestGenericPrice,
                      originalPrice: selectedMedicine.brandedMrp,
                      savings: selectedMedicine.savingsAmount
                    })
                  }
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-base">shopping_cart</span>
                  <span>Switch to Generic & Add to Cart</span>
                </button>

                {(() => {
                  const alertForMed = alerts.find((a) => a.medicineId === selectedMedicine.id);
                  return (
                    <button
                      onClick={() => onOpenSetAlert(selectedMedicine)}
                      className={`w-full sm:w-auto py-2.5 px-4 rounded-lg border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0 ${
                        alertForMed?.status === 'Triggered'
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200'
                          : alertForMed
                          ? 'bg-blue-50 border-blue-200 text-[#2563EB] hover:bg-blue-100'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                      title="Set alert if generic price drops below a threshold"
                    >
                      <span className="material-symbols-outlined text-base">
                        {alertForMed?.status === 'Triggered'
                          ? 'campaign'
                          : alertForMed
                          ? 'notifications_active'
                          : 'add_alert'}
                      </span>
                      <span>
                        {alertForMed?.status === 'Triggered'
                          ? `Alert Met! ₹${(alertForMed.triggeredPrice || selectedMedicine.lowestGenericPrice).toFixed(2)}`
                          : alertForMed
                          ? `Alert Active (<₹${alertForMed.targetThresholdPrice})`
                          : 'Set Price Alert'}
                      </span>
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prescription AI OCR Scanner Section */}
      <div className="mb-12 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline-sm text-lg font-bold text-slate-900">
                Prescription Vision AI Scanner
              </h3>
              <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-code-mono text-[10px] font-bold">
                Model: SastaRx-Vision-v2.4
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload doctor's prescription note or image to instantly detect brand names and convert them to cost-saving generics.
            </p>
          </div>
          <button
            onClick={handleRunSampleOcr}
            disabled={ocrScanning}
            className="px-3.5 py-2 rounded-lg bg-blue-50 border border-blue-200 text-[#2563EB] hover:bg-blue-100 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">upload_file</span>
            <span>{ocrScanning ? 'Scanning Rx...' : 'Load Sample Rx (3 Meds)'}</span>
          </button>
        </div>

        {/* Scanner Drop Zone */}
        {!ocrResults && !ocrScanning && (
          <div 
            onClick={handleRunSampleOcr}
            className="border-2 border-dashed border-slate-300 hover:border-[#2563EB] rounded-xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-blue-50/20"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl">document_scanner</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">
              Drag and drop prescription image or click to browse
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              Supports JPEG, PNG, PDF. All patient identifiers are automatically de-identified under HIPAA & DISHA rules.
            </p>
            <button className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-xs shadow-2xs hover:bg-slate-50">
              Upload Prescription Note
            </button>
          </div>
        )}

        {/* Scanning Animation */}
        {ocrScanning && (
          <div className="p-8 text-center bg-blue-50/50 rounded-xl border border-blue-200">
            <div className="w-10 h-10 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <h4 className="font-bold text-sm text-slate-900">Analyzing Prescription Handwritten Text...</h4>
            <p className="text-xs text-slate-500 font-code-mono mt-1">
              Comparing against 24,850 CDSCO Drug Registry formulations...
            </p>
          </div>
        )}

        {/* OCR Result Table */}
        {ocrResults && (
          <div className="flex flex-col gap-4">
            {ocrSuccessMsg && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                  {ocrSuccessMsg}
                </span>
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-label-xs text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3">Prescribed Brand Detected</th>
                    <th className="py-2.5 px-3">Active Salt Composition</th>
                    <th className="py-2.5 px-3">Bioequivalent Generic</th>
                    <th className="py-2.5 px-3 text-right">Brand MRP</th>
                    <th className="py-2.5 px-3 text-right">Generic Price</th>
                    <th className="py-2.5 px-3 text-right">Savings</th>
                    <th className="py-2.5 px-3 text-center">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-table-data">
                  {ocrResults.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-900">{item.prescribedBrand}</td>
                      <td className="py-3 px-3 text-slate-600 font-code-mono text-[11px]">{item.activeSalt}</td>
                      <td className="py-3 px-3 font-semibold text-emerald-700">{item.genericEquivalent}</td>
                      <td className="py-3 px-3 text-right text-slate-400 line-through font-code-mono">₹{item.brandedPrice.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 font-code-mono">₹{item.genericPrice.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-700 font-code-mono">
                        -{item.savingsPercent}% (₹{(item.brandedPrice - item.genericPrice).toFixed(2)})
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          {(item.confidenceScore * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Calculation & Action */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Total Branded Rx:</span>
                  <span className="text-slate-500 line-through font-bold text-sm">₹710.00</span>
                </div>
                <span className="material-symbols-outlined text-slate-400">arrow_forward</span>
                <div>
                  <span className="text-emerald-700 font-bold block">SastaRx Generic Cart:</span>
                  <span className="text-emerald-700 font-bold text-lg">₹175.00</span>
                </div>
                <div className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold font-code-mono">
                  You Save ₹535.00 (75.3%)
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddAllOcr}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                  <span>Add All 3 Generics to Cart</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chronic Care Savings Packs */}
      <div className="mb-12">
        <div className="mb-4">
          <h3 className="font-headline-sm text-lg font-bold text-slate-900">
            Curated Chronic Regimen Packs (Monthly Subscriptions)
          </h3>
          <p className="text-xs text-slate-500">
            Automated monthly refills of lab-verified bioequivalent generics for chronic conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {chronicPacks.map((pack) => (
            <div key={pack.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] font-code-mono text-[10px] font-bold uppercase border border-blue-200">
                    {pack.condition}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-code-mono text-[10px] font-bold border border-emerald-200">
                    Save {pack.savingsPercent}%
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 mb-1">{pack.title}</h4>
                <p className="text-xs text-slate-500 mb-3">{pack.description}</p>
                <div className="p-2 rounded bg-slate-50 border border-slate-100 font-code-mono text-[11px] text-slate-700 mb-4">
                  {pack.medicinesIncluded.join(' + ')}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 line-through block">₹{pack.brandedMrp.toFixed(2)}</span>
                  <span className="text-lg font-bold text-slate-900 font-code-mono">₹{pack.genericPrice.toFixed(2)}</span>
                </div>
                <button
                  onClick={() =>
                    onAddToCart({
                      name: pack.title,
                      price: pack.genericPrice,
                      originalPrice: pack.brandedMrp,
                      savings: pack.savingsAmount
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Subscribe</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Pillars of Bioequivalence Verification */}
      <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 mb-8">
        <h3 className="font-headline-sm text-base font-bold text-slate-900 text-center mb-6">
          The 3 Pillars of SastaRx Bioequivalence Verification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl">science</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">Identical Active API</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every generic drug possesses the exact identical active pharmaceutical molecule, milligram strength, and salt ester.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl">speed</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">Proven Bioavailability (f2 &gt; 50)</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lab-tested dissolution profiles ensure therapeutic blood concentration mirrors the innovator formulation without delay.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">WHO-GMP & CDSCO Verified</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Only batches from licensed Indian and global manufacturing plants meeting stringent Schedule M good manufacturing practices.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Clinical Advisory Banner */}
      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <span className="material-symbols-outlined text-amber-700 text-lg shrink-0 mt-0.5">info</span>
        <div>
          <strong className="font-bold">Mandatory Clinical & Regulatory Advisory:</strong>
          <p className="mt-0.5 leading-relaxed text-amber-800">
            Always consult your prescribing physician before altering chronic medical regimens or narrow therapeutic index medications. SastaRx provides verified generic alternatives under CDSCO National Drug Guidelines for informational and patient affordability purposes.
          </p>
        </div>
      </div>
    </div>
  );
};
