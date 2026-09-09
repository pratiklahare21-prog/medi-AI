import React, { useState } from 'react';
import { MedicineCatalogEntry, PricingPartnerFeed, TenantInfo } from '../types';
import { PriceTrendSection } from './PriceTrendSection';

interface DashboardViewProps {
  tenant: TenantInfo;
  catalog: MedicineCatalogEntry[];
  feeds: PricingPartnerFeed[];
  onOpenTriage: () => void;
  onOpenAuditLogs: () => void;
  onOpenAddMedicine: () => void;
  onSwitchToCatalog: () => void;
  onSwitchToArchitecture: () => void;
  onRetryFeed: (feedId: string) => void;
  onExportAudit: () => void;
  onImportFeed: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tenant,
  catalog,
  feeds,
  onOpenTriage,
  onOpenAuditLogs,
  onOpenAddMedicine,
  onSwitchToCatalog,
  onSwitchToArchitecture,
  onRetryFeed,
  onExportAudit,
  onImportFeed
}) => {
  const [filterHighDelta, setFilterHighDelta] = useState(false);
  const [batchValidated, setBatchValidated] = useState(false);
  const [selectedStage, setSelectedStage] = useState<'edge' | 'app' | 'data'>('app');

  const displayedMatches = filterHighDelta 
    ? catalog.filter(m => m.savingsPercent >= 70) 
    : catalog.slice(0, 4);

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Top Quick Alert Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 mb-6 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] shadow-sm">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#B45309] text-xl animate-pulse">warning</span>
          <div>
            <span className="font-title-md text-xs sm:text-sm text-[#B45309] font-bold">
              Action Required: Composition Verification Anomaly
            </span>
            <span className="font-body-sm text-xs sm:text-sm text-slate-700 ml-1.5">
              3 clinical reports flagged Teneligliptin 20mg bio-ratio mismatch from Jan Aushadhi feed #JA-804.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <span className="font-code-mono text-[11px] text-[#B45309] px-2 py-0.5 rounded bg-[#FDE68A]/60 font-semibold">
            SLA: 1h 40m
          </span>
          <button 
            onClick={onOpenTriage}
            className="px-3.5 py-1.5 rounded bg-[#B45309] text-white font-label-md text-xs hover:bg-[#92400E] transition-all shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <span>Review in Triage Queue</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Executive Control Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] font-code-mono text-[11px] font-semibold uppercase tracking-wider border border-[#BFDBFE]">
              Multi-Tenant Core
            </span>
            <span className="font-code-mono text-[11px] text-slate-500">
              Node: ind-mumbai-zone-2b
            </span>
          </div>
          <h1 className="font-display-lg text-2xl lg:text-3xl text-slate-900 tracking-tight leading-none mb-1.5 font-bold">
            Operations & Architecture Control Center
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-slate-600 flex flex-wrap items-center gap-2">
            <span>Active Partition: <strong className="text-slate-900 font-semibold">{tenant.name}</strong></span>
            <span className="font-code-mono text-[11px] px-1.5 py-0.2 rounded bg-slate-100 text-[#2563EB] font-semibold border border-slate-200">
              Schema: {tenant.schema}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1 text-xs sm:text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
              Synchronized to CDSCO National Drug Registry
            </span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="#price-trend-section"
            className="px-3 py-2 rounded bg-white border border-slate-300 text-slate-800 font-title-md text-xs hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base text-[#10B981]">ssid_chart</span>
            <span>Price Volatility Trends</span>
          </a>
          <button 
            onClick={onExportAudit}
            className="px-3 py-2 rounded bg-white border border-slate-300 text-slate-800 font-title-md text-xs hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base text-[#2563EB]">download</span>
            <span>Export Compliance Audit</span>
          </button>
          <button 
            onClick={onImportFeed}
            className="px-3 py-2 rounded bg-white border border-slate-300 text-slate-800 font-title-md text-xs hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base text-[#0D9488]">publish</span>
            <span>Import Pricing Feed (CSV/JSON)</span>
          </button>
          <button 
            onClick={onOpenAddMedicine}
            className="px-3.5 py-2 rounded bg-[#2563EB] text-white font-title-md text-xs hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5 font-semibold"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Add Medicine Entry</span>
          </button>
        </div>
      </div>

      {/* Primary System KPI Overview (5 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
        {/* Card 1 */}
        <div className="flex flex-col p-4 rounded-lg bg-white border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-label-xs text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Catalog Medicines
            </span>
            <span className="material-symbols-outlined text-[#2563EB] text-lg">medication</span>
          </div>
          <div className="font-display-lg text-2xl lg:text-3xl text-slate-900 tracking-tight font-bold mb-1">
            24,850
          </div>
          <div className="flex items-center justify-between text-xs mt-auto">
            <span className="font-code-mono text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">verified</span>
              18,420 Generics
            </span>
            <span className="font-code-mono text-[11px] text-slate-500">94.2% match</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#2563EB] h-full rounded-full" style={{ width: '94.2%' }}></div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col p-4 rounded-lg bg-white border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-label-xs text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Avg Patient Savings
            </span>
            <span className="material-symbols-outlined text-emerald-600 text-lg">savings</span>
          </div>
          <div className="font-display-lg text-2xl lg:text-3xl text-emerald-700 tracking-tight font-bold mb-1">
            ₹418 <span className="text-xs font-normal text-slate-400">/ rx</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-auto">
            <span className="font-code-mono text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-xs">trending_down</span>
              -71.4% cost delta
            </span>
            <span className="font-code-mono text-[11px] text-slate-500">vs MRP Base</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '71.4%' }}></div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col p-4 rounded-lg bg-white border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-label-xs text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Pricing Feeds
            </span>
            <span className="material-symbols-outlined text-amber-600 text-lg">sync_alt</span>
          </div>
          <div className="font-display-lg text-2xl lg:text-3xl text-slate-900 tracking-tight font-bold mb-1">
            14 <span className="text-xs font-normal text-slate-400">Partners</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-auto">
            <span className="font-code-mono text-[11px] text-amber-700 font-semibold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-xs">schedule</span>
              3 Stale Sync
            </span>
            <span className="font-code-mono text-[11px] text-emerald-600">11 Live (99.8%)</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '78.5%' }}></div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="flex flex-col p-4 rounded-lg bg-white border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-label-xs text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Accuracy Disputes
            </span>
            <span className="material-symbols-outlined text-red-600 text-lg">gavel</span>
          </div>
          <div className="font-display-lg text-2xl lg:text-3xl text-red-600 tracking-tight font-bold mb-1">
            12 <span className="text-xs font-normal text-slate-400">in Queue</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-auto">
            <span className="font-code-mono text-[11px] text-slate-600 font-medium">Triage SLA: 4.2h</span>
            <span className="font-code-mono text-[11px] text-amber-700 font-semibold">2 Critical</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-red-500 h-full rounded-full" style={{ width: '25%' }}></div>
          </div>
        </div>

        {/* Card 5 */}
        <div className="flex flex-col p-4 rounded-lg bg-white border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-label-xs text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Multi-Tenant Isolation
            </span>
            <span className="material-symbols-outlined text-[#2563EB] text-lg">shield</span>
          </div>
          <div className="font-display-lg text-2xl lg:text-3xl text-slate-900 tracking-tight font-bold mb-1">
            RLS <span className="text-xs font-normal text-emerald-600 font-semibold">Active</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-auto">
            <span className="font-code-mono text-[11px] text-emerald-700 font-semibold">0 Leak Events</span>
            <span className="font-code-mono text-[11px] text-slate-500">Shared DB</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      {/* Visual Architecture Pipeline Interactive Widget */}
      <div className="flex flex-col p-4 lg:p-5 mb-6 rounded-lg bg-white border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#2563EB] text-2xl">account_tree</span>
            <div>
              <h2 className="font-headline-sm text-base lg:text-lg text-slate-900 font-bold">
                System Architecture Pipeline (Multi-Tenant SaaS Specification)
              </h2>
              <p className="font-body-sm text-xs text-slate-500">
                Interactive runtime status across Edge, Modular Monolith AI Core, and Tenant-Isolated Schemas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-code-mono text-[11px] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> 100% Operational
            </span>
            <span className="font-code-mono text-[11px] text-slate-600 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
              Trace ID: 0x9AF2
            </span>
            <button 
              onClick={onSwitchToArchitecture}
              className="px-2.5 py-1 rounded bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] border border-[#BFDBFE] font-code-mono text-[11px] font-semibold flex items-center gap-1 transition-colors"
            >
              <span>View Full Blueprint</span>
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </button>
          </div>
        </div>

        {/* Pipeline Stages Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 relative">
          {/* Stage 1: Edge & Ingress */}
          <div 
            onClick={() => setSelectedStage('edge')}
            className={`flex flex-col p-3.5 rounded-lg border transition-all cursor-pointer ${
              selectedStage === 'edge' ? 'bg-[#F8FAFC] border-[#2563EB] ring-1 ring-[#2563EB]/20 shadow-xs' : 'bg-[#F8FAFC] border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-xs text-[11px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-[#2563EB]">public</span>
                Edge Layer
              </span>
              <span className="font-code-mono text-[11px] text-emerald-700 font-semibold">12ms Latency</span>
            </div>
            <div className="font-title-md text-xs sm:text-sm text-slate-900 font-semibold mb-2">
              WAF + Global DNS & Load Balancer
            </div>
            <div className="flex flex-col gap-1.5 font-code-mono text-[11px] text-slate-600 mb-3">
              <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100">
                <span>Rate Limiting (TLS 1.3):</span>
                <span className="text-slate-900 font-bold">Enforced (8,400 rps)</span>
              </div>
              <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100">
                <span>Static CDN Cache Hit:</span>
                <span className="text-emerald-700 font-bold">98.4%</span>
              </div>
              <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100">
                <span>External Auth:</span>
                <span className="text-slate-900 font-medium">JWT / RBAC Verified</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-200/60">
              <span className="font-label-xs text-[10px] text-slate-500">Egress Target:</span>
              <span className="font-code-mono text-[11px] text-[#2563EB] font-semibold">/api/v2/prescriptions/match</span>
            </div>
          </div>

          {/* Stage 2: Modular Monolith Application Layer */}
          <div 
            onClick={() => setSelectedStage('app')}
            className={`flex flex-col p-3.5 rounded-lg border transition-all cursor-pointer ${
              selectedStage === 'app' ? 'bg-[#F8FAFC] border-[#2563EB] ring-1 ring-[#2563EB]/20 shadow-xs' : 'bg-[#F8FAFC] border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-xs text-[11px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-[#2563EB]">psychology</span>
                App Layer (Modular Monolith)
              </span>
              <span className="font-code-mono text-[11px] text-emerald-700 font-semibold">99.98% Uptime</span>
            </div>
            <div className="font-title-md text-xs sm:text-sm text-slate-900 font-semibold mb-2">
              Medicine & AI Core Recommendation
            </div>
            <div className="flex flex-col gap-1.5 font-code-mono text-[11px] text-slate-600 mb-3">
              <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100">
                <span>Salt Matching Pipeline:</span>
                <span className="text-emerald-700 font-bold">Bioequivalent Auto-Match</span>
              </div>
              <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100">
                <span>Price Delta Normalizer:</span>
                <span className="text-[#2563EB] font-bold">Realtime Live</span>
              </div>
              <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100">
                <span>Async Queue:</span>
                <span className="text-slate-900">RabbitMQ (14 msgs)</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-200/60">
              <span className="font-label-xs text-[10px] text-slate-500">Tenant Resolver:</span>
              <span className="font-code-mono text-[11px] text-[#2563EB] font-semibold">TenantID Contextualizer</span>
            </div>
          </div>

          {/* Stage 3: Tenant Isolated Data Layer */}
          <div 
            onClick={() => setSelectedStage('data')}
            className={`flex flex-col p-3.5 rounded-lg border transition-all cursor-pointer ${
              selectedStage === 'data' ? 'bg-[#F8FAFC] border-[#2563EB] ring-1 ring-[#2563EB]/20 shadow-xs' : 'bg-[#F8FAFC] border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-xs text-[11px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-[#2563EB]">database</span>
                Data Layer (Isolated RLS)
              </span>
              <span className="font-code-mono text-[11px] text-emerald-700 font-semibold">Zero Spill Guard</span>
            </div>
            <div className="font-title-md text-xs sm:text-sm text-slate-900 font-semibold mb-2">
              Shared DB + Separate Schemas
            </div>
            <div className="flex flex-col gap-1.5 font-code-mono text-[11px] text-slate-600 mb-3">
              <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100">
                <span>PostgreSQL Schema:</span>
                <span className="text-[#2563EB] font-bold">{tenant.schema}.prescriptions</span>
              </div>
              <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100">
                <span>Redis Cache Partition:</span>
                <span className="text-emerald-700 font-bold">apollo_cache_* (4.2GB)</span>
              </div>
              <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100">
                <span>Elasticsearch Cluster:</span>
                <span className="text-slate-900 font-bold">indices_salt_catalog_v4</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-200/60">
              <span className="font-label-xs text-[10px] text-slate-500">Security Seal:</span>
              <span className="font-code-mono text-[11px] text-emerald-700 font-semibold">Row-Level Security Validated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Price Trend & Volatility Dashboard Section (Recharts) */}
      <div id="price-trend-section">
        <PriceTrendSection
          catalog={catalog}
          onOpenAddMedicine={onOpenAddMedicine}
          onSelectMedicineInCatalog={onSwitchToCatalog}
        />
      </div>

      {/* High-Priority Operations Grid (2 Columns: Matches Table & Feeds Overview) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Recent Salt Equivalence Approvals (Spans 2 columns on xl) */}
        <div className="xl:col-span-2 flex flex-col p-4 lg:p-5 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-base text-slate-900 font-bold">
                  Recent Salt Equivalence Approvals & AI Matches
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-code-mono text-[10px] font-semibold">
                  98.6% Confidence
                </span>
              </div>
              <p className="font-body-sm text-xs text-slate-500">
                Pharmacological equivalence verified with CDSCO regulatory registry
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setFilterHighDelta(!filterHighDelta)}
                className={`px-2.5 py-1 rounded font-code-mono text-[11px] border transition-colors ${
                  filterHighDelta 
                    ? 'bg-[#2563EB] text-white border-[#2563EB]' 
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                {filterHighDelta ? 'Filter: Active (>70%)' : 'Filter: High Delta'}
              </button>
              <button 
                onClick={() => setBatchValidated(true)}
                className={`px-2.5 py-1 rounded font-code-mono text-[11px] text-white transition-colors ${
                  batchValidated ? 'bg-emerald-600' : 'bg-[#2563EB] hover:bg-blue-700'
                }`}
              >
                {batchValidated ? 'Validated (4 ✓)' : 'Batch Validate (4)'}
              </button>
            </div>
          </div>

          {/* High Density Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-label-xs text-[11px] uppercase tracking-wider border-y border-slate-200">
                  <th className="py-2 px-3">Brand Prescribed</th>
                  <th className="py-2 px-3">Active Salt Composition</th>
                  <th className="py-2 px-3">Top Generic Equiv</th>
                  <th className="py-2 px-3 text-right">Price Delta</th>
                  <th className="py-2 px-3 text-center">Bioequivalence</th>
                  <th className="py-2 px-3 text-right">Action / Verifier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-table-data text-xs">
                {displayedMatches.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-title-md text-xs text-slate-900 font-semibold">
                          {m.brandName}
                        </span>
                        <span className="font-code-mono text-[11px] text-slate-500">
                          {m.manufacturer} • {m.formulationType}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-900 font-medium">
                          {m.activeSalt}
                        </span>
                        <span className="font-code-mono text-[11px] text-slate-500">
                          {m.compositionDetails}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-900">
                          {m.lowestGenericBrand}
                        </span>
                        <span className="font-code-mono text-[11px] text-emerald-700">
                          Verified Bioequivalent Match
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-code-mono text-xs font-bold text-emerald-600">
                          -{m.savingsPercent}%
                        </span>
                        <span className="font-code-mono text-[10px] text-slate-400 line-through">
                          ₹{m.brandedMrp.toFixed(2)}
                        </span>
                        <span className="font-code-mono text-xs text-slate-900 font-semibold">
                          ₹{m.lowestGenericPrice.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-code-mono text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        {m.regulatoryStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-code-mono text-[11px] text-slate-700 font-medium">
                          {m.verifierName}
                        </span>
                        <span className="font-code-mono text-[10px] text-emerald-600">
                          {m.verifiedTimeAgo}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Micro Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-code-mono text-[11px] text-slate-500">
              Displaying {displayedMatches.length} of 1,248 recent matching operations • RLS Tenant Scope Enforced
            </span>
            <button 
              onClick={onSwitchToCatalog}
              className="font-title-md text-xs text-[#2563EB] hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Open Complete Clinical Equivalency Matrix</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Right Column: Pricing Feeds & Health Warning Panel */}
        <div className="flex flex-col p-4 lg:p-5 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline-sm text-base text-slate-900 font-bold">
                Partner Pricing Feeds
              </h3>
              <p className="font-body-sm text-xs text-slate-500">
                Sync heartbeat across third-party pharmacy integrations
              </p>
            </div>
            <button 
              onClick={() => onRetryFeed('feed-04')}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
              title="Refresh Feeds"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
            </button>
          </div>

          {/* Feed List */}
          <div className="flex flex-col gap-2.5">
            {feeds.map((feed) => {
              if (feed.status === 'Stale') {
                return (
                  <div key={feed.id} className="flex flex-col p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-amber-700 text-base">warning</span>
                        <span className="font-title-md text-xs text-amber-900 font-bold">
                          {feed.name}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-code-mono text-[10px] font-bold border border-amber-300">
                        ⚠️ Stale ({feed.updatedAgo})
                      </span>
                    </div>
                    <p className="font-body-sm text-xs text-slate-700 mt-1">
                      {feed.notes}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-amber-200/60">
                      <span className="font-code-mono text-[11px] text-amber-900 font-semibold">
                        SLA Breached: +{feed.slaBreachedHours} hrs
                      </span>
                      <button 
                        onClick={() => onRetryFeed(feed.id)}
                        className="px-2.5 py-1 rounded bg-[#B45309] text-white font-code-mono text-[11px] hover:bg-[#92400E] transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-xs">restart_alt</span>
                        <span>Trigger Retry</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={feed.id} className="flex flex-col p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${feed.status === 'Healthy' ? 'bg-emerald-500' : 'bg-[#2563EB] animate-pulse'}`}></span>
                      <span className="font-title-md text-xs text-slate-900 font-bold">
                        {feed.name}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-code-mono text-[10px] font-semibold ${
                      feed.status === 'Healthy' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-blue-50 text-[#2563EB] border border-blue-200'
                    }`}>
                      {feed.status === 'Syncing' ? `Syncing (${feed.syncProgress}%)` : 'Healthy'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-code-mono text-[11px] text-slate-500 mt-1">
                    <span>{feed.skusParsed.toLocaleString()} SKUs Parsed</span>
                    <span>{feed.updatedAgo}</span>
                  </div>
                  {feed.syncProgress ? (
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#2563EB] h-full rounded-full transition-all duration-500" style={{ width: `${feed.syncProgress}%` }}></div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between font-code-mono text-[11px] text-slate-600 mt-1">
                      <span>Avg Response: <strong className="text-slate-900">{feed.avgResponseMs}ms</strong></span>
                      <span>Error Rate: <strong className="text-emerald-700">{feed.errorRatePercent.toFixed(2)}%</strong></span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-4 flex items-center justify-between font-code-mono text-[11px] text-slate-500 border-t border-slate-100">
            <span>Scheduler: Celery Beat #CRON-04</span>
            <span 
              onClick={onOpenAuditLogs}
              className="text-[#2563EB] font-semibold cursor-pointer hover:underline"
            >
              Configure Webhooks
            </span>
          </div>
        </div>
      </div>

      {/* Clinical Ops Team & Audit Trail Snippet Bar */}
      <div className="mt-6 p-4 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 overflow-hidden">
            <img 
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" 
              alt="Dr. R. Verma" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtKQH7DcQHF0mCRms8e5g9qEcGo4PO_pA3WcVIr26pWoVv32xG4LEMs45Nt68UmxcDTLh4duSt1W3zzUWI2yyVQFb5YGwD-l-4mYqpWA5YXX7T4dub2M0sysK4NzgRPpsSt1nNq9_XvBVq0gduFzG5EYK1lIRC-gwhqlMVW81zHWNrJbTJaEHaiDTaxqWJiv1-Eh32UPY6p_KlK55v-rjwy7XcI4bXjPhoAzQB6GmVfxZ08xBV3QI4" 
            />
            <img 
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" 
              alt="Dr. S. Kulkarni" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEZV1LeF0ZQC6XXEnH-nM_Ehzizray3gFUusWDFEd9jIANSQciXLmZ4DVcgRup2j7M6_SLaKndG6g-EmLrGkMhhIGJPT54KbA_TeWZRhRY2Gnso5VxXn2Izvr--nfSR353NiP4MEwd-wz9JU5QxM5dkNoJfv7DflSW010Mw5P-c4nLEC4R9ZYD-w8xcO6cQ1eejqaQshI0q5IMx2xS9PwADEywLijarCy0nnWFoT4MsJrfkzRKe4Ic" 
            />
            <img 
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" 
              alt="Dr. Sarah Jenkins" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0OWSyFdyepeAwQj2Wc2xC9PI1c1zewDP63d20KEZP1jIQ6PMJrYwq0PMR_GZz4r7h6BHt8dsW-h6p7Wq-XkNwzeeHSsSld_PoY7Mp94ijOixWdtb6J0mqd6vrQM-4T6bnin6FViSPKo6xSrcjwcsNfAVaTL8hrhs4pMe0gFQVXRUsN80g8IFfAtNGaFRhlkJmEdA6n6FL1AVi0N3Jal4KTvadiSS6q9DAX4nUXq1JPGvBII81eVmc" 
            />
          </div>
          <div className="flex flex-col">
            <span className="font-title-md text-xs sm:text-sm text-slate-900 font-semibold">
              3 Clinical Administrators On Active Duty
            </span>
            <span className="font-code-mono text-[11px] text-slate-500">
              All prescription changes cryptographically signed via HMAC-SHA256
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-code-mono text-[11px] text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>HIPAA / DISHA Compliant</span>
          </div>
          <button 
            onClick={onOpenAuditLogs}
            className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-900 font-title-md text-xs transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-[#2563EB]">history</span>
            <span>Live Audit Log Stream</span>
          </button>
        </div>
      </div>
    </div>
  );
};
