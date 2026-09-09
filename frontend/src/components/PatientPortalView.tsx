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
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineCatalogEntry>(catalog[0]);
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

  // OCR: run a preset (cardio / diabetic / gastric)
  const handleRunOcrPreset = async (presetId: string) => {
    setActivePreset(presetId);
    setOcrScanning(true);
    setOcrResults(null);
    setOcrSuccessMsg(null);
    try {
      const results = await api.ocrPrescription({ presetId });
      setOcrResults(results);
      const totalSavings = results.reduce((acc, m) => acc + m.savings, 0);
      setOcrSuccessMsg(
        `Prescription verified by SastaRx Vision AI · ${results.length} bioequivalent alternatives found · Projected savings: ₹${totalSavings.toFixed(2)}`
      );
    } catch (err) {
      console.warn('OCR preset error', err);
    } finally {
      setOcrScanning(false);
    }
  };

  // OCR: load default sample (3 meds)
  const handleRunSampleOcr = () => handleRunOcrPreset('cardio');

  // OCR: real file upload
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
        setOcrSuccessMsg(
          `'${file.name}' analyzed by Gemini Vision AI · ${results.length} medications identified · Saving ₹${totalSavings.toFixed(2)}`
        );
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
      prev
        ? prev.map(m =>
            m.id === id ? { ...m, extractedName: editPrescribedName, dosageInstructions: editDosage } : m
          )
        : null
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
    setOcrSuccessMsg(
      `Added all ${ocrResults.length} generic bioequivalents to cart! You are saving ₹${totalSavings.toFixed(2)} on this prescription.`
    );
  };

  // AI Recommendations
  const handleGenerateRegimen = async () => {
    setRecLoading(true);
    setRecResult(null);
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

  // AI Search
  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsAiSearching(true);
    setAiSearchResult(null);
    try {
      const result = await api.aiSearch(searchQuery);
      setAiSearchResult(result);
      if (result.data.length > 0) {
        setSelectedMedicine(result.data[0]);
      }
      setSearchQuery('');
    } catch (err) {
      console.warn('AI search error', err);
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        handleSelectMed(searchResults[0]);
      } else {
        handleAiSearch();
      }
    }
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto pb-20">
      {/* ── Top Value Banner ─────────────────────────────────────────────── */}
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
        {/* Decorative watermark */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[260px] text-white">medication</span>
        </div>
      </div>

      {/* ── Floating Cart Indicator ───────────────────────────────────────── */}
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
            onClick={() =>
              alert(
                `Proceeding to SastaRx checkout with ${cartCount} generic items saving ₹${totalSaved.toFixed(2)}!`
              )
            }
            className="px-4 py-1.5 rounded-lg bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm"
          >
            Review Cart &rarr;
          </button>
        </div>
      )}

      {/* ── Search Section ───────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="relative">
          <div className="flex items-center bg-white border-2 border-slate-300 rounded-xl shadow-xs focus-within:border-[#2563EB] p-1.5 transition-all">
            <span className="material-symbols-outlined text-slate-400 text-2xl ml-3">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search brand name or ask in plain English — e.g. 'cheap diabetes meds under ₹100'..."
              className="w-full px-3 py-2 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none font-body-md"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setAiSearchResult(null); }}
                className="p-1 text-slate-400 hover:text-slate-600 mr-1"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
            {/* AI search button */}
            <button
              onClick={handleAiSearch}
              disabled={isAiSearching || !searchQuery.trim()}
              title="Natural language AI search"
              className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer shrink-0 mr-1 flex items-center gap-1"
            >
              {isAiSearching ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span className="material-symbols-outlined text-sm">psychology</span>
              )}
              <span className="hidden sm:inline">AI Search</span>
            </button>
            <button
              onClick={() => {
                if (searchResults.length > 0) handleSelectMed(searchResults[0]);
                else handleAiSearch();
              }}
              className="px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer shrink-0"
            >
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

        {/* AI Search Result Banner */}
        {aiSearchResult && (
          <div className="mt-3 p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3">
            <span className="material-symbols-outlined text-purple-600 text-lg shrink-0 mt-0.5">psychology</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-purple-800">Gemini AI Search Result</span>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-code-mono border border-purple-200">
                  {aiSearchResult.count} matches
                </span>
                {aiSearchResult.parsedIntent.category && (
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-code-mono border border-blue-200">
                    Category: {aiSearchResult.parsedIntent.category}
                  </span>
                )}
                {aiSearchResult.parsedIntent.maxPrice !== null && (
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-code-mono border border-emerald-200">
                    Under ₹{aiSearchResult.parsedIntent.maxPrice}
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-700">{aiSearchResult.aiExplanation}</p>
            </div>
            <button
              onClick={() => setAiSearchResult(null)}
              className="text-slate-400 hover:text-slate-600 shrink-0"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

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
          >
            <span className="material-symbols-outlined text-sm text-amber-600">notifications_active</span>
            <span>Price Drop Alerts ({alerts.length})</span>
            {alerts.some((a) => a.status === 'Triggered') && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* ── Featured Price Comparison Card ───────────────────────────────── */}
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
            {/* Prescribed Brand */}
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

            {/* SastaRx Verified Generic */}
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
                    >
                      <span className="material-symbols-outlined text-base">
                        {alertForMed?.status === 'Triggered' ? 'campaign' : alertForMed ? 'notifications_active' : 'add_alert'}
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

      {/* ── Prescription Vision AI Scanner ───────────────────────────────── */}
      <div className="mb-12 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline-sm text-lg font-bold text-slate-900">
                Prescription Vision AI Scanner
              </h3>
              <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-code-mono text-[10px] font-bold">
                Gemini 2.5 Flash · Vision
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload a prescription image or choose a demo preset to instantly convert brand names to cost-saving generics.
            </p>
          </div>
          {/* Preset quick-selectors */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium shrink-0">Demo Rx:</span>
            {(['cardio', 'diabetic', 'gastric'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => handleRunOcrPreset(preset)}
                disabled={ocrScanning}
                className={`px-2.5 py-1 rounded-lg border font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 ${
                  activePreset === preset && ocrResults
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {preset.charAt(0).toUpperCase() + preset.slice(1)}
              </button>
            ))}
            {/* Hidden real file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={ocrScanning}
              className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[#2563EB] hover:bg-blue-100 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">upload_file</span>
              <span className="hidden sm:inline">Upload Rx</span>
            </button>
          </div>
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
              Supports JPEG, PNG, PDF. Patient identifiers are auto de-identified under HIPAA &amp; DISHA rules.
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
            <h4 className="font-bold text-sm text-slate-900">Analyzing Prescription with Gemini Vision AI...</h4>
            <p className="text-xs text-slate-500 font-code-mono mt-1">
              Comparing against 24,850 CDSCO Drug Registry formulations...
            </p>
          </div>
        )}

        {/* OCR Result Table */}
        {ocrResults && !ocrScanning && (
          <div className="flex flex-col gap-4">
            {ocrSuccessMsg && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                  {ocrSuccessMsg}
                </span>
                <button
                  onClick={() => { setOcrResults(null); setOcrSuccessMsg(null); }}
                  className="text-emerald-700 hover:text-emerald-900 ml-2 shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-label-xs text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3">Detected Brand</th>
                    <th className="py-2.5 px-3">Active Salt</th>
                    <th className="py-2.5 px-3">Dosage</th>
                    <th className="py-2.5 px-3">Bioequivalent Generic</th>
                    <th className="py-2.5 px-3 text-right">Brand MRP</th>
                    <th className="py-2.5 px-3 text-right">Generic Price</th>
                    <th className="py-2.5 px-3 text-right">Savings</th>
                    <th className="py-2.5 px-3 text-center">Confidence</th>
                    <th className="py-2.5 px-3 text-center">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-table-data">
                  {ocrResults.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        {editingOcrId === item.id ? (
                          <input
                            value={editPrescribedName}
                            onChange={(e) => setEditPrescribedName(e.target.value)}
                            className="w-full border border-blue-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-500"
                          />
                        ) : (
                          <span className="font-semibold text-slate-900">{item.extractedName}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-code-mono text-[11px]">
                        {item.detectedSalt} {item.detectedStrength}
                      </td>
                      <td className="py-3 px-3 text-slate-500 max-w-[140px]">
                        {editingOcrId === item.id ? (
                          <input
                            value={editDosage}
                            onChange={(e) => setEditDosage(e.target.value)}
                            className="w-full border border-blue-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-500"
                          />
                        ) : (
                          <span className="text-[11px]">{item.dosageInstructions}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-semibold text-emerald-700">{item.suggestedGeneric}</td>
                      <td className="py-3 px-3 text-right text-slate-400 line-through font-code-mono">
                        ₹{item.originalPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 font-code-mono">
                        ₹{item.genericPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-700 font-code-mono">
                        ₹{item.savings.toFixed(2)}
                        <span className="text-[10px] text-emerald-600 block">
                          ({((item.savings / item.originalPrice) * 100).toFixed(0)}% off)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.confidence >= 95
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {item.confidence.toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {editingOcrId === item.id ? (
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="text-emerald-600 hover:text-emerald-800"
                          >
                            <span className="material-symbols-outlined text-base">check</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                        )}
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
                  <span className="text-slate-500 line-through font-bold text-sm">
                    ₹{ocrResults.reduce((s, m) => s + m.originalPrice, 0).toFixed(2)}
                  </span>
                </div>
                <span className="material-symbols-outlined text-slate-400">arrow_forward</span>
                <div>
                  <span className="text-emerald-700 font-bold block">SastaRx Generic Cart:</span>
                  <span className="text-emerald-700 font-bold text-lg">
                    ₹{ocrResults.reduce((s, m) => s + m.genericPrice, 0).toFixed(2)}
                  </span>
                </div>
                <div className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold font-code-mono">
                  Save ₹{ocrResults.reduce((s, m) => s + m.savings, 0).toFixed(2)} (
                  {(
                    (ocrResults.reduce((s, m) => s + m.savings, 0) /
                      ocrResults.reduce((s, m) => s + m.originalPrice, 0)) *
                    100
                  ).toFixed(0)}
                  %)
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setOcrResults(null); setOcrSuccessMsg(null); }}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Scan Another
                </button>
                <button
                  onClick={handleAddAllOcr}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                  <span>Add All {ocrResults.length} Generics to Cart</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── AI Clinical Regimen Recommender ──────────────────────────────── */}
      <div className="mb-12 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline-sm text-lg font-bold text-slate-900">
                AI Clinical Regimen Recommender
              </h3>
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-code-mono text-[10px] font-bold">
                Gemini 2.5 Flash · Clinical
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter a diagnosis and current medications to get bioequivalent generic alternatives with drug-interaction safety checks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {/* Condition */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Diagnosis / Condition
            </label>
            <select
              value={recCondition}
              onChange={(e) => setRecCondition(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#2563EB] bg-white"
            >
              <option>Type 2 Diabetes</option>
              <option>Hypertension</option>
              <option>Cardiovascular Disease</option>
              <option>Hyperlipidemia</option>
              <option>GERD / Acid Reflux</option>
              <option>Hypothyroidism</option>
            </select>
          </div>

          {/* Current Medications */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Current Medications (for interaction check)
            </label>
            <input
              type="text"
              value={recCurrentMeds.join(', ')}
              onChange={(e) =>
                setRecCurrentMeds(
                  e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
              placeholder="e.g. Metformin 500mg, Aspirin 75mg"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#2563EB] placeholder:text-slate-400"
            />
          </div>

          {/* Price Sensitivity */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Price Sensitivity
            </label>
            <select
              value={recSensitivity}
              onChange={(e) => setRecSensitivity(e.target.value as typeof recSensitivity)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#2563EB] bg-white"
            >
              <option value="maximum-savings">Maximum Savings (Cheapest Generic)</option>
              <option value="balanced">Balanced (Quality + Savings)</option>
              <option value="primary-brand">Primary Brand Preferred</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateRegimen}
          disabled={recLoading}
          className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm mb-6"
        >
          {recLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Generating Clinical Regimen...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">psychology</span>
              <span>Generate AI Generic Regimen</span>
            </>
          )}
        </button>

        {/* Results */}
        {recResult && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-indigo-600 text-lg shrink-0 mt-0.5">summarize</span>
                <div>
                  <h4 className="text-xs font-bold text-indigo-900 mb-0.5 uppercase tracking-wider">Clinical Summary</h4>
                  <p className="text-sm text-indigo-800">{recResult.summary}</p>
                  <p className="text-[11px] text-indigo-600 font-code-mono mt-1">{recResult.regulatoryCompliance}</p>
                </div>
              </div>
            </div>

            {/* Drug Interaction Check */}
            <div className={`p-4 rounded-xl border flex items-start gap-2.5 ${
              recResult.interactionCheck.riskLevel === 'Safe'
                ? 'bg-emerald-50 border-emerald-200'
                : recResult.interactionCheck.riskLevel === 'Moderate Precaution'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <span className={`material-symbols-outlined text-lg shrink-0 mt-0.5 ${
                recResult.interactionCheck.riskLevel === 'Safe'
                  ? 'text-emerald-600'
                  : recResult.interactionCheck.riskLevel === 'Moderate Precaution'
                  ? 'text-amber-600'
                  : 'text-red-600'
              }`}>
                {recResult.interactionCheck.riskLevel === 'Safe'
                  ? 'check_circle'
                  : recResult.interactionCheck.riskLevel === 'Moderate Precaution'
                  ? 'warning'
                  : 'dangerous'}
              </span>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${
                    recResult.interactionCheck.riskLevel === 'Safe'
                      ? 'text-emerald-800'
                      : recResult.interactionCheck.riskLevel === 'Moderate Precaution'
                      ? 'text-amber-800'
                      : 'text-red-800'
                  }`}>
                    Drug Interaction Check
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border font-code-mono ${
                    recResult.interactionCheck.riskLevel === 'Safe'
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                      : recResult.interactionCheck.riskLevel === 'Moderate Precaution'
                      ? 'bg-amber-100 text-amber-700 border-amber-300'
                      : 'bg-red-100 text-red-700 border-red-300'
                  }`}>
                    {recResult.interactionCheck.riskLevel}
                  </span>
                </div>
                <p className="text-xs text-slate-700">{recResult.interactionCheck.summary}</p>
                {recResult.interactionCheck.details.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5">
                    {recResult.interactionCheck.details.map((d, i) => (
                      <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-xs text-slate-400 shrink-0 mt-0.5">chevron_right</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Recommendation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recResult.recommendations.map((rec) => (
                <div
                  key={rec.medicineId}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-bold text-sm text-slate-900">{rec.recommendedGeneric}</h5>
                      <p className="text-xs text-slate-500">{rec.genericManufacturer}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-code-mono shrink-0 ml-2">
                      {rec.formularyTier}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 mb-3 font-code-mono">
                    {rec.activeSalt} {rec.saltStrength} · {rec.dosageForm}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Branded</div>
                      <div className="text-sm font-bold text-slate-500 line-through">₹{rec.brandedStripMrp.toFixed(0)}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                      <div className="text-[10px] text-emerald-600 uppercase font-bold mb-0.5">Generic</div>
                      <div className="text-sm font-bold text-emerald-700">₹{rec.genericStripMrp.toFixed(0)}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-center">
                      <div className="text-[10px] text-blue-600 uppercase font-bold mb-0.5">Save/mo</div>
                      <div className="text-sm font-bold text-blue-700">₹{rec.monthlySavings.toFixed(0)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-emerald-500">science</span>
                      f2 = {rec.similarityFactorF2}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-blue-500">verified</span>
                      Bioeq {rec.bioequivalenceConfidence}%
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-indigo-500">savings</span>
                      {rec.savingsPercent}% savings
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{rec.clinicalRationale}</p>

                  <button
                    onClick={() =>
                      onAddToCart({
                        name: rec.recommendedGeneric,
                        price: rec.genericStripMrp,
                        originalPrice: rec.brandedStripMrp,
                        savings: rec.brandedStripMrp - rec.genericStripMrp
                      })
                    }
                    className="w-full py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Chronic Care Savings Packs ────────────────────────────────────── */}
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
            <div
              key={pack.id}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
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
                  {pack.medicines.join(' + ')}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 line-through block">
                    ₹{pack.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-lg font-bold text-slate-900 font-code-mono">
                    ₹{pack.estimatedMonthlyPrice.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">/month</span>
                </div>
                <button
                  onClick={() =>
                    onAddToCart({
                      name: pack.title,
                      price: pack.estimatedMonthlyPrice,
                      originalPrice: pack.originalPrice,
                      savings: pack.originalPrice - pack.estimatedMonthlyPrice
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

      {/* ── 3 Pillars of Bioequivalence ───────────────────────────────────── */}
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
            <h4 className="font-bold text-sm text-slate-900 mb-1">WHO-GMP &amp; CDSCO Verified</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Only batches from licensed Indian and global manufacturing plants meeting stringent Schedule M good manufacturing practices.
            </p>
          </div>
        </div>
      </div>

      {/* ── Mandatory Clinical Advisory ───────────────────────────────────── */}
      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <span className="material-symbols-outlined text-amber-700 text-lg shrink-0 mt-0.5">info</span>
        <div>
          <strong className="font-bold">Mandatory Clinical &amp; Regulatory Advisory:</strong>
          <p className="mt-0.5 leading-relaxed text-amber-800">
            Always consult your prescribing physician before altering chronic medical regimens or narrow therapeutic index medications.
            SastaRx provides verified generic alternatives under CDSCO National Drug Guidelines for informational and patient affordability purposes.
          </p>
        </div>
      </div>
    </div>
  );
};
