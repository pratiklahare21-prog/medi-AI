import React, { useState } from 'react';
import { MedicineCatalogEntry, PriceAlert } from '../types';

interface CatalogViewProps {
  catalog: MedicineCatalogEntry[];
  alerts: PriceAlert[];
  onToggleGenericInRx: (medId: string, genericId: string) => void;
  onOpenBioavailabilityCurve: (med: MedicineCatalogEntry) => void;
  onOpenAddMedicine: () => void;
  onOpenLinkGeneric: (med: MedicineCatalogEntry) => void;
  onOpenSetAlert: (med: MedicineCatalogEntry) => void;
  onOpenAlertsManager: () => void;
  onExportCatalog: () => void;
  onImportCsv: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  catalog,
  alerts,
  onToggleGenericInRx,
  onOpenBioavailabilityCurve,
  onOpenAddMedicine,
  onOpenLinkGeneric,
  onOpenSetAlert,
  onOpenAlertsManager,
  onExportCatalog,
  onImportCsv
}) => {
  const [searchQuery, setSearchQuery] = useState('Sitagliptin 100mg');
  const [selectedCategory, setSelectedCategory] = useState('Anti-diabetic & Incretins');
  const [selectedVerification, setSelectedVerification] = useState('All Verifications (100% Bioeq)');
  const [selectedManufacturer, setSelectedManufacturer] = useState('All Pharma Brands');
  const [selectedTenantScope, setSelectedTenantScope] = useState('Apollo Health (TN-4092) Scope');
  const [expandedIds, setExpandedIds] = useState<string[]>(['med-01']);
  const [selectedIds, setSelectedIds] = useState<string[]>(['med-01']);
  const [viewMode, setViewMode] = useState<'auto' | 'cards' | 'table'>('auto');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCatalog.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCatalog.map(m => m.id));
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories (Global)');
    setSelectedVerification('All Verifications (100% Bioeq)');
    setSelectedManufacturer('All Pharma Brands');
    setSelectedTenantScope('Apollo Health (TN-4092) Scope');
  };

  const handleBulkAction = (action: string) => {
    setActionSuccessMsg(`Executed "${action}" on ${selectedIds.length} compound(s). Verified via HMAC-SHA256.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Filter items
  const filteredCatalog = catalog.filter((med) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBrand = med.brandName.toLowerCase().includes(q);
      const matchSalt = med.activeSalt.toLowerCase().includes(q);
      const matchAtc = med.atcCode.toLowerCase().includes(q);
      if (!matchBrand && !matchSalt && !matchAtc) return false;
    }
    if (selectedCategory !== 'All Categories (Global)' && med.therapeuticCategory !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Toast alert for actions */}
      {actionSuccessMsg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-sm animate-in fade-in">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
            {actionSuccessMsg}
          </span>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-slate-500 font-body-sm text-xs mb-1">
            <span className="hover:text-[#2563EB] cursor-pointer transition-colors">Catalog</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-slate-900 font-semibold">Verified Formulations</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-[#2563EB] font-code-mono text-[10px] font-semibold ml-1">
              FR-ADM-01
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline-md text-xl lg:text-2xl text-slate-900 tracking-tight font-bold">
              Medicine & Salt Equivalence Catalog
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-code-mono text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              CDSCO & WHO-GMP Mapped
            </div>
          </div>
        </div>

        {/* Global CTA Group */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button 
            onClick={onOpenAlertsManager}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-all cursor-pointer relative"
            title="Open Price Drop Thresholds & Notification Watchlist"
          >
            <span className="material-symbols-outlined text-base text-amber-500">notifications_active</span>
            <span>Price Alerts ({alerts.length})</span>
            {alerts.some(a => a.status === 'Triggered') && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            )}
          </button>
          <button 
            onClick={onExportCatalog}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-slate-500">file_download</span>
            <span>Download Catalog Template</span>
          </button>
          <button 
            onClick={onImportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-slate-500">upload_file</span>
            <span>Bulk Import (CSV)</span>
          </button>
          <button 
            onClick={onOpenAddMedicine}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#2563EB] text-white hover:bg-blue-700 transition-all text-xs font-semibold shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>+ Add Medicine Entry</span>
          </button>
        </div>
      </div>

      {/* Metric Strip / High-Level Catalog Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-xs text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Total Branded Drugs
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display-lg text-2xl text-slate-900 font-bold">6,420</span>
              <span className="text-emerald-700 font-code-mono text-[11px] font-semibold">+18 this wk</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
            <span className="material-symbols-outlined text-xl">pill</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-xs text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Verified Generics
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display-lg text-2xl text-slate-900 font-bold">18,430</span>
              <span className="text-emerald-700 font-code-mono text-[11px] font-semibold">2.87x multiplier</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <span className="material-symbols-outlined text-xl">verified</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-xs text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Active Salts Indexed
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display-lg text-2xl text-slate-900 font-bold">1,890</span>
              <span className="text-slate-500 font-code-mono text-[11px]">INN/USAN Standard</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
            <span className="material-symbols-outlined text-xl">biotech</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-amber-200 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-xs text-[11px] uppercase tracking-wider text-amber-800 font-bold">
              Pending AI Reviews
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display-lg text-2xl text-amber-700 font-bold">14</span>
              <span className="text-amber-800 font-code-mono text-[11px] font-semibold">Queue SLA &lt; 2h</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <span className="material-symbols-outlined text-xl">model_training</span>
          </div>
        </div>
      </div>

      {/* Search & Dynamic Filter Matrix */}
      <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs mb-4 flex flex-col gap-3.5">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Universal Input */}
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">manage_search</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-10 pr-28 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] font-body-md"
              placeholder="Search by Brand Name, Active Salt Composition, ATC Code, or Strength..."
              type="text"
            />
            <div className="absolute right-2.5 top-2 flex items-center gap-1 pointer-events-none">
              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-code-mono text-[10px] text-slate-500 shadow-2xs">
                ATC A10BH01
              </span>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            <button 
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-3 py-2 rounded bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span>Reset Filters</span>
            </button>
            <button 
              onClick={() => handleBulkAction('Run Index Query')}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded bg-[#2563EB] text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-base">search</span>
              <span>Run Index Query</span>
            </button>
          </div>
        </div>

        {/* Dropdown Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Therapeutic Category */}
          <div className="flex flex-col gap-1">
            <label className="font-label-xs text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Therapeutic Category
            </label>
            <div className="relative">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-8 pl-2.5 pr-8 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-[#2563EB] appearance-none font-body-sm"
              >
                <option>All Categories (Global)</option>
                <option>Anti-diabetic & Incretins</option>
                <option>Cardiovascular (Hypertension/Lipids)</option>
                <option>Gastrointestinal & Proton Inhibitors</option>
                <option>Anti-infective & Antibiotic</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2 text-slate-400 text-base pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Equivalence Status */}
          <div className="flex flex-col gap-1">
            <label className="font-label-xs text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Equivalence Verification
            </label>
            <div className="relative">
              <select 
                value={selectedVerification}
                onChange={(e) => setSelectedVerification(e.target.value)}
                className="w-full h-8 pl-2.5 pr-8 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-[#2563EB] appearance-none font-body-sm"
              >
                <option>All Verifications (100% Bioeq)</option>
                <option>Verified 100% Bioequivalent</option>
                <option>Under AI Clinical Review</option>
                <option>Bio-Dispute / Variance Flagged</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2 text-slate-400 text-base pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Manufacturer */}
          <div className="flex flex-col gap-1">
            <label className="font-label-xs text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Origin / Manufacturer
            </label>
            <div className="relative">
              <select 
                value={selectedManufacturer}
                onChange={(e) => setSelectedManufacturer(e.target.value)}
                className="w-full h-8 pl-2.5 pr-8 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-[#2563EB] appearance-none font-body-sm"
              >
                <option>All Pharma Brands</option>
                <option>Merck Sharp & Dohme (MSD)</option>
                <option>Glenmark Pharmaceuticals</option>
                <option>Sun Pharma Industries</option>
                <option>AstraZeneca India</option>
                <option>Alkem Laboratories</option>
                <option>USV Private Limited</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2 text-slate-400 text-base pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Tenant Scope */}
          <div className="flex flex-col gap-1">
            <label className="font-label-xs text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Tenant Scope & RLS
            </label>
            <div className="relative">
              <select 
                value={selectedTenantScope}
                onChange={(e) => setSelectedTenantScope(e.target.value)}
                className="w-full h-8 pl-2.5 pr-8 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-[#2563EB] appearance-none font-body-sm"
              >
                <option>Apollo Health (TN-4092) Scope</option>
                <option>Global Master SastaRx Base</option>
                <option>Tenant Custom Formularies</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2 text-slate-400 text-base pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Selection & View Switcher Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 py-2.5 rounded-t-lg bg-[#EFF6FF] border border-slate-200 text-xs gap-3">
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-1.5">
            <input 
              checked={selectedIds.length > 0 && selectedIds.length === filteredCatalog.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-slate-300 cursor-pointer" 
              type="checkbox" 
            />
            <span className="font-semibold text-slate-900 whitespace-nowrap">
              {selectedIds.length} drug{selectedIds.length === 1 ? '' : 's'} selected
            </span>
          </div>
          <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>
          <div className="flex items-center flex-wrap gap-1.5">
            <button 
              onClick={() => handleBulkAction('Export Selected')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold"
            >
              <span className="material-symbols-outlined text-sm">file_upload</span>
              <span className="hidden sm:inline">Export Selected</span>
              <span className="sm:hidden">Export</span>
            </button>
            <button 
              onClick={() => handleBulkAction('Re-evaluate AI Equivalence')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold"
            >
              <span className="material-symbols-outlined text-sm">sync</span>
              <span className="hidden sm:inline">Re-evaluate</span>
            </button>
            <button 
              onClick={() => handleBulkAction('Mark Inactive in Formulary')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold hover:bg-red-100"
            >
              <span className="material-symbols-outlined text-sm">block</span>
              <span className="hidden sm:inline">Deactivate</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          <div className="text-slate-500 font-code-mono text-[11px]">
            {filteredCatalog.length} compounds
          </div>

          {/* View Mode Switcher (Auto Responsive / Cards / Table) */}
          <div className="flex items-center bg-white border border-slate-300 rounded p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode('auto')}
              title="Responsive layout (Cards on mobile, Table on desktop)"
              className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'auto'
                  ? 'bg-[#2563EB] text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              <span className="hidden sm:inline">Auto</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              title="Cards format"
              className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-[#2563EB] text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-xs">view_agenda</span>
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Dense clinical table"
              className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#2563EB] text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-xs">table_rows</span>
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Stackable Cards Layout (visible on small mobile screens or when Cards view is active) */}
      {(viewMode === 'cards' || viewMode === 'auto') && (
        <div className={`flex flex-col gap-3.5 my-3 ${viewMode === 'auto' ? 'md:hidden' : ''}`}>
          {filteredCatalog.map((med) => {
            const isExpanded = expandedIds.includes(med.id);
            const isSelected = selectedIds.includes(med.id);
            const medAlert = alerts.find(a => a.medicineId === med.id);

            return (
              <div 
                key={`mobile-${med.id}`}
                className={`p-4 rounded-xl bg-white border transition-all shadow-2xs flex flex-col gap-3.5 ${
                  isSelected ? 'border-[#2563EB] ring-2 ring-[#2563EB]/15' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top Section: Checkbox, Medicine Identity, Regulatory & Price Alert Badges */}
                <div className="flex items-start justify-between gap-2.5 pb-3 border-b border-slate-100">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="pt-0.5">
                      <input 
                        checked={isSelected}
                        onChange={() => toggleSelect(med.id)}
                        className="w-5 h-5 rounded text-[#2563EB] focus:ring-[#2563EB] border-slate-300 cursor-pointer"
                        type="checkbox"
                        aria-label={`Select ${med.brandName}`}
                      />
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0" title={med.dosageForm}>
                      <span className="material-symbols-outlined text-xl">medication</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className="font-headline-sm text-base font-bold text-slate-900 leading-tight">
                          {med.brandName}
                        </h4>
                        {medAlert && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-code-mono font-bold inline-flex items-center gap-1 ${
                              medAlert.status === 'Triggered'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                                : medAlert.status === 'Paused'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-blue-50 text-[#2563EB] border border-blue-200'
                            }`}
                            title={`Price Alert: ${medAlert.status} (Threshold: ₹${medAlert.targetThresholdPrice.toFixed(2)})`}
                          >
                            <span className="material-symbols-outlined text-[12px]">
                              {medAlert.status === 'Triggered' ? 'campaign' : 'notifications'}
                            </span>
                            Alert &lt;₹{medAlert.targetThresholdPrice}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-700">{med.manufacturer}</span> · <span className="font-code-mono text-[11px]">{med.formulationType}</span>
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-semibold shrink-0">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    {med.regulatoryStatus}
                  </span>
                </div>

                {/* Active Salt & Composition Details */}
                <div className="p-3 rounded-lg bg-slate-50/90 border border-slate-200/80 text-xs">
                  <div className="flex items-center justify-between text-slate-900 font-semibold mb-1">
                    <span className="text-xs font-bold text-slate-900">{med.activeSalt} {med.saltStrength}</span>
                    <span className="font-code-mono text-[10px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {med.atcCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-code-mono leading-relaxed">
                    {med.compositionDetails}
                  </p>
                  <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Category:</span>
                    <span className="font-medium text-slate-700">{med.therapeuticCategory}</span>
                  </div>
                </div>

                {/* Price & Savings Comparison Grid */}
                <div className="p-3 rounded-lg bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 border border-slate-200 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-label-xs">
                        Innovator Brand MRP
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg font-bold font-code-mono text-slate-800">
                          ₹{med.brandedMrp.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-code-mono">retail</span>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-label-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Lowest Generic
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg font-bold font-code-mono text-emerald-700">
                          ₹{med.lowestGenericPrice.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-medium truncate max-w-[110px]" title={med.lowestGenericBrand}>
                          {med.lowestGenericBrand}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Savings Pill & Course Interval */}
                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-code-mono text-xs font-bold">
                        {med.savingsPercent}% OFF
                      </span>
                      <span className="text-xs font-bold text-emerald-800 font-code-mono">
                        Save ₹{med.savingsAmount.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-code-mono text-right">
                      {med.savingsIntervalText}
                    </span>
                  </div>
                </div>

                {/* Generics Accordion Trigger (Touch Target >= 44px) */}
                <button
                  onClick={() => toggleExpand(med.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-xs font-semibold transition-all min-h-[44px] cursor-pointer ${
                    isExpanded
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-emerald-600">hub</span>
                    <span>{med.verifiedGenericsCount} Bioequivalent Generics</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-code-mono font-bold">
                      f2 &gt; 65
                    </span>
                  </div>
                  <span className={`material-symbols-outlined text-base transition-transform duration-200 ${isExpanded ? 'rotate-180 text-emerald-700' : 'text-slate-400'}`}>
                    expand_more
                  </span>
                </button>

                {/* Mobile Expanded Generics Details */}
                {isExpanded && (
                  <div className="pt-2 pb-1 space-y-2.5 border-t border-slate-100 animate-in fade-in duration-200">
                    <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-0.5">
                        <span className="material-symbols-outlined text-sm text-[#2563EB]">verified_user</span>
                        <span>Bioequivalence Matrix & Reference Standard</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Standard: <strong className="text-slate-800">{med.pharmacopeiaStandard || 'IP / USP Reference Standard'}</strong> · {med.dissolutionNote || 'Dissolution profile similarity f2 > 65 across 3 media pH buffers.'}
                      </p>
                    </div>

                    {/* List of Generic Alternatives (Stackable Sub-Cards for Mobile) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider px-1">
                        <span>Formulary Equivalents</span>
                        <span className="font-code-mono text-[10px] text-emerald-700 font-bold">{med.genericsList?.length || 0} Listed</span>
                      </div>

                      {med.genericsList && med.genericsList.length > 0 ? (
                        med.genericsList.map((gen) => (
                          <div 
                            key={`mob-gen-${gen.id}`}
                            className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                                  <span className="font-bold text-slate-900 text-xs">{gen.name}</span>
                                </div>
                                <span className="text-[11px] text-slate-500 block mt-0.5">{gen.manufacturer}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-code-mono font-semibold border shrink-0 ${
                                gen.formularyStatus === 'Tier 1 Primary'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                  : gen.formularyStatus === 'Preferred'
                                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                                  : 'bg-slate-100 border-slate-300 text-slate-700'
                              }`}>
                                {gen.formularyStatus}
                              </span>
                            </div>

                            <div className="text-[10px] font-code-mono text-slate-600 bg-white p-1.5 rounded border border-slate-200/70">
                              {gen.compositionMatch}
                            </div>

                            {/* Price and Rx Toggle */}
                            <div className="flex items-center justify-between pt-1 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-400 block font-label-xs uppercase">Strip MRP</span>
                                <span className="font-bold font-code-mono text-slate-900">₹{gen.genericStripMrp.toFixed(2)}</span>
                                <span className="text-emerald-700 text-[10px] font-code-mono font-semibold ml-1.5">
                                  ({gen.patientSavingsPercent}% Save ₹{gen.patientSavingsAmount.toFixed(2)})
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium text-slate-700">Include in Rx</span>
                                <label className="relative inline-flex items-center cursor-pointer min-h-[36px]">
                                  <input 
                                    type="checkbox"
                                    checked={gen.includedInPatientRx}
                                    onChange={() => onToggleGenericInRx(med.id, gen.id)}
                                    className="sr-only peer"
                                    aria-label={`Include ${gen.name} in Patient Rx`}
                                  />
                                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2.5px] after:left-[2.5px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                          {med.verifiedGenericsCount} bioequivalent generics linked in regulatory database. Click "Link New Generic Salt" to add custom formulary items.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons Row on Mobile (Touch targets >= 44px) */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onOpenSetAlert(med)}
                    className={`flex-1 min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border cursor-pointer ${
                      medAlert?.status === 'Triggered'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : medAlert
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base text-amber-600">
                      {medAlert?.status === 'Triggered' ? 'notifications_active' : 'add_alert'}
                    </span>
                    <span>{medAlert ? `Alert (₹${medAlert.targetThresholdPrice})` : 'Set Price Alert'}</span>
                  </button>

                  <button
                    onClick={() => onOpenBioavailabilityCurve(med)}
                    className="min-h-[44px] px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="View Bioavailability Curve"
                  >
                    <span className="material-symbols-outlined text-base text-[#2563EB]">science</span>
                    <span className="hidden sm:inline">Bioavailability</span>
                  </button>

                  <button
                    onClick={() => onOpenLinkGeneric(med)}
                    className="min-h-[44px] px-3 py-2 rounded-lg bg-[#2563EB] text-white hover:bg-blue-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer"
                    title="Link New Generic Salt"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span>Link Salt</span>
                  </button>

                  <button
                    onClick={() => handleBulkAction(`Deactivate ${med.brandName}`)}
                    className="min-h-[44px] w-11 rounded-lg bg-white border border-slate-300 text-slate-400 hover:text-red-700 hover:border-red-300 flex items-center justify-center transition-colors cursor-pointer"
                    title="Deactivate Formulary Node"
                    aria-label="Deactivate"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* High-Density Clinical Bioequivalence Table (Visible on md+ or when viewMode === 'table') */}
      {(viewMode === 'table' || viewMode === 'auto') && (
        <div className={`overflow-x-auto rounded-b-lg border border-slate-200 bg-white shadow-2xs mb-4 ${viewMode === 'auto' ? 'hidden md:block' : ''}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 h-9 font-label-xs text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="w-10 px-4 text-center">
                  <input 
                    checked={selectedIds.length > 0 && selectedIds.length === filteredCatalog.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-slate-300 cursor-pointer" 
                    type="checkbox" 
                  />
                </th>
                <th className="py-2 px-3 font-semibold">Drug Name & Brand</th>
                <th className="py-2 px-3 font-semibold">Active Salt & Strength</th>
                <th className="py-2 px-3 font-semibold text-center">Generic Links</th>
                <th className="py-2 px-3 font-semibold text-right">Branded MRP</th>
                <th className="py-2 px-3 font-semibold text-right">Lowest Generic</th>
                <th className="py-2 px-3 font-semibold text-right">Potential Savings</th>
                <th className="py-2 px-3 font-semibold text-center">Regulatory Status</th>
                <th className="py-2 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-table-data text-xs divide-y divide-slate-100">
              {filteredCatalog.map((med) => {
                const isExpanded = expandedIds.includes(med.id);
                const isSelected = selectedIds.includes(med.id);
                const medAlert = alerts.find(a => a.medicineId === med.id);

                return (
                  <React.Fragment key={med.id}>
                    <tr className={`${isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50/70'} transition-colors`}>
                      <td className="px-4 text-center">
                        <input 
                          checked={isSelected}
                          onChange={() => toggleSelect(med.id)}
                          className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-slate-300 cursor-pointer" 
                          type="checkbox" 
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]" title={med.dosageForm}>
                            <span className="material-symbols-outlined text-base">medication</span>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900">{med.brandName}</span>
                              {medAlert && (
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-code-mono font-bold flex items-center gap-0.5 ${
                                    medAlert.status === 'Triggered'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : medAlert.status === 'Paused'
                                      ? 'bg-slate-100 text-slate-600'
                                      : 'bg-blue-50 text-[#2563EB] border border-blue-200'
                                  }`}
                                  title={`Price Alert: ${medAlert.status} (Threshold: ₹${medAlert.targetThresholdPrice.toFixed(2)})`}
                                >
                                  <span className="material-symbols-outlined text-[10px]">
                                    {medAlert.status === 'Triggered' ? 'campaign' : 'notifications'}
                                  </span>
                                  Alert &lt;₹{medAlert.targetThresholdPrice}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-code-mono text-slate-500">{med.manufacturer}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{med.activeSalt} {med.saltStrength}</span>
                          <span className="text-[10px] text-slate-500 font-code-mono">{med.compositionDetails}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button 
                          onClick={() => toggleExpand(med.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer border transition-colors ${
                            isExpanded 
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          <span>{med.verifiedGenericsCount} Verified Generics</span>
                          <span className={`material-symbols-outlined text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            expand_more
                          </span>
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-right font-code-mono font-medium text-slate-600">
                        ₹{med.brandedMrp.toFixed(2)}
                        <span className="block text-[10px] text-slate-400">{med.formulationType}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-code-mono font-bold text-slate-900">
                        ₹{med.lowestGenericPrice.toFixed(2)}
                        <span className="block text-[10px] text-emerald-700 font-medium">{med.lowestGenericBrand}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-code-mono text-[11px] font-bold">
                            {med.savingsPercent}% Save ₹{med.savingsAmount.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">{med.savingsIntervalText}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-semibold">
                          <span className="material-symbols-outlined text-xs">verified</span>
                          {med.regulatoryStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button 
                            onClick={() => onOpenSetAlert(med)}
                            className={`p-1 rounded transition-colors ${
                              medAlert?.status === 'Triggered'
                                ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-400'
                                : medAlert
                                ? 'bg-blue-100 text-[#2563EB]'
                                : 'hover:bg-slate-100 text-slate-400 hover:text-[#2563EB]'
                            }`}
                            title={
                              medAlert?.status === 'Triggered'
                                ? `Price Alert Triggered! Generic dropped to ₹${medAlert.triggeredPrice || med.lowestGenericPrice} (Threshold: ₹${medAlert.targetThresholdPrice})`
                                : medAlert
                                ? `Price Alert Active (Threshold: ₹${medAlert.targetThresholdPrice.toFixed(2)})`
                                : `Set Price Drop Alert for ${med.brandName}`
                            }
                          >
                            <span className="material-symbols-outlined text-lg">
                              {medAlert?.status === 'Triggered' ? 'notifications_active' : medAlert ? 'notifications' : 'add_alert'}
                            </span>
                          </button>
                          <button 
                            onClick={() => toggleExpand(med.id)}
                            className="p-1 rounded hover:bg-blue-50 text-[#2563EB] transition-colors" 
                            title="Manage Equivalence Links"
                          >
                            <span className="material-symbols-outlined text-lg">hub</span>
                          </button>
                          <button 
                            onClick={() => onOpenBioavailabilityCurve(med)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors" 
                            title="View Bioavailability Curve"
                          >
                            <span className="material-symbols-outlined text-lg">science</span>
                          </button>
                          <button 
                            onClick={() => handleBulkAction(`Deactivate ${med.brandName}`)}
                            className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-700 transition-colors" 
                            title="Deactivate Formulary Node"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED BIOEQUIVALENCE MAPPING DRAWER */}
                    {isExpanded && (
                      <tr className="bg-[#F8FAFC]">
                        <td colSpan={9} className="p-4 lg:p-5">
                          <div className="rounded-lg bg-white border border-slate-300 p-4 lg:p-5 shadow-xs">
                            {/* Header of Equivalence Link */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between pb-3.5 border-b border-slate-200 gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                                  <span className="material-symbols-outlined text-xl">account_tree</span>
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-headline-sm text-sm lg:text-base font-bold text-slate-900">
                                      Bioequivalence Mapping Matrix: {med.brandName}
                                    </h4>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
                                      100% Bio-identical
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200 font-code-mono text-[10px]">
                                      ATC Code: {med.atcCode}
                                    </span>
                                  </div>
                                  <p className="font-body-sm text-xs text-slate-600 mt-1">
                                    Pharmacopeia Standard: <strong className="text-slate-900">{med.pharmacopeiaStandard || 'IP / USP Reference Standard'}</strong> · {med.dissolutionNote || 'Dissolution profile similarity f2 > 65 across 3 media pH buffers.'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => onOpenSetAlert(med)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-amber-50 border border-amber-200 hover:bg-amber-100 text-xs font-semibold text-amber-900 transition-colors shadow-2xs"
                                  title="Configure price drop notification threshold for this compound"
                                >
                                  <span className="material-symbols-outlined text-sm text-amber-600">notifications_active</span>
                                  <span>{medAlert ? `Price Alert (₹${medAlert.targetThresholdPrice})` : 'Set Price Alert'}</span>
                                </button>
                                <button 
                                  onClick={() => onOpenBioavailabilityCurve(med)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-slate-50 border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
                                >
                                  <span className="material-symbols-outlined text-sm text-[#2563EB]">science</span>
                                  <span>View Bioavailability Curve</span>
                                </button>
                                <button 
                                  onClick={() => onOpenLinkGeneric(med)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#2563EB] text-white hover:bg-blue-700 text-xs font-semibold transition-colors shadow-2xs"
                                >
                                  <span className="material-symbols-outlined text-sm">add</span>
                                  <span>Link New Generic Salt</span>
                                </button>
                              </div>
                            </div>

                            {/* Linked Generics Sub-table */}
                            <div className="mt-4 overflow-x-auto">
                              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2 flex items-center justify-between">
                                <span>Verified Bioequivalent Brand Generics (Active Formulary for {med.brandName})</span>
                                <span className="text-[10px] font-code-mono text-emerald-700">All Dissolution f2 &gt; 65</span>
                              </div>
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-200 text-slate-500 font-label-xs text-[10px] uppercase tracking-wider bg-slate-50/60">
                                    <th className="py-2 px-2.5">Generic Brand Formulation</th>
                                    <th className="py-2 px-2.5">Manufacturer</th>
                                    <th className="py-2 px-2.5">Composition Match</th>
                                    <th className="py-2 px-2.5 text-right">Generic Strip MRP</th>
                                    <th className="py-2 px-2.5 text-right">Patient Savings</th>
                                    <th className="py-2 px-2.5 text-center">Verified Match</th>
                                    <th className="py-2 px-2.5 text-center">Include in Patient Rx</th>
                                    <th className="py-2 px-2.5 text-right">Formulary Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-table-data">
                                  {med.genericsList && med.genericsList.length > 0 ? (
                                    med.genericsList.map((gen) => (
                                      <tr key={gen.id} className="hover:bg-slate-50/80">
                                        <td className="py-2.5 px-2.5 font-semibold text-slate-900">
                                          <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            {gen.name}
                                          </div>
                                        </td>
                                        <td className="py-2.5 px-2.5 text-slate-600">{gen.manufacturer}</td>
                                        <td className="py-2.5 px-2.5 font-code-mono text-[11px] text-slate-800">
                                          {gen.compositionMatch}
                                        </td>
                                        <td className="py-2.5 px-2.5 text-right font-code-mono font-bold text-slate-900">
                                          ₹{gen.genericStripMrp.toFixed(2)}
                                        </td>
                                        <td className="py-2.5 px-2.5 text-right font-code-mono font-bold text-emerald-700">
                                          {gen.patientSavingsPercent}% (₹{gen.patientSavingsAmount.toFixed(2)})
                                        </td>
                                        <td className="py-2.5 px-2.5 text-center">
                                          <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                                        </td>
                                        <td className="py-2.5 px-2.5 text-center">
                                          <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                              type="checkbox"
                                              checked={gen.includedInPatientRx}
                                              onChange={() => onToggleGenericInRx(med.id, gen.id)}
                                              className="sr-only peer"
                                            />
                                            <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                                          </label>
                                        </td>
                                        <td className="py-2.5 px-2.5 text-right">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-code-mono font-semibold border ${
                                            gen.formularyStatus === 'Tier 1 Primary'
                                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                              : gen.formularyStatus === 'Preferred'
                                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                                              : 'bg-slate-100 border-slate-300 text-slate-700'
                                          }`}>
                                            {gen.formularyStatus}
                                          </span>
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan={8} className="py-4 text-center text-slate-500 font-body-sm">
                                        {med.verifiedGenericsCount} bioequivalent generics linked in regulatory database. Click "Link New Generic Salt" to add custom formulary items.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Operational Footer Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Rows per page:</span>
            <select 
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-7 px-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 font-code-mono focus:outline-none focus:border-[#2563EB]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
          <span className="text-xs text-slate-500 font-code-mono">
            Showing 1 – {Math.min(filteredCatalog.length, pageSize)} of 6,420 entries (Page {currentPage} of 642)
          </span>
        </div>

        {/* Pager Controls */}
        <div className="flex items-center gap-1">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className="p-1 rounded border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-sm">first_page</span>
          </button>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="p-1 rounded border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          
          <span className="px-2.5 py-0.5 rounded bg-[#2563EB] text-white font-code-mono text-xs font-semibold">
            {currentPage}
          </span>
          <button 
            onClick={() => setCurrentPage(2)}
            className="px-2.5 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-50 font-code-mono text-xs text-slate-700"
          >
            2
          </button>
          <button 
            onClick={() => setCurrentPage(3)}
            className="px-2.5 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-50 font-code-mono text-xs text-slate-700"
          >
            3
          </button>
          <span className="text-slate-400 px-1 text-xs">...</span>
          <button 
            onClick={() => setCurrentPage(642)}
            className="px-2.5 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-50 font-code-mono text-xs text-slate-700"
          >
            642
          </button>

          <button 
            onClick={() => setCurrentPage(prev => Math.min(642, prev + 1))}
            className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
          <button 
            onClick={() => setCurrentPage(642)}
            className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-sm">last_page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
