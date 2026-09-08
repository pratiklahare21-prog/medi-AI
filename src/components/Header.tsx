import React, { useState } from 'react';
import { AppViewMode, TenantInfo, PriceAlert } from '../types';

interface HeaderProps {
  currentMode: AppViewMode;
  onModeChange: (mode: AppViewMode) => void;
  currentTenant: TenantInfo;
  onTenantChange: (tenant: TenantInfo) => void;
  availableTenants: TenantInfo[];
  globalSearchQuery: string;
  onGlobalSearchChange: (query: string) => void;
  onOpenAuditLogs: () => void;
  onOpenTriage: () => void;
  anomalyCount: number;
  priceAlerts?: PriceAlert[];
  onOpenPriceAlerts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  currentTenant,
  onTenantChange,
  availableTenants,
  globalSearchQuery,
  onGlobalSearchChange,
  onOpenAuditLogs,
  onOpenTriage,
  anomalyCount,
  priceAlerts = [],
  onOpenPriceAlerts
}) => {
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0F172A] text-white flex items-center justify-between px-4 border-b border-[#334155] shadow-sm">
      {/* Left: Logo & Multi-Tenant Switcher */}
      <div className="flex items-center gap-4 min-w-0">
        <div 
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => onModeChange('clinical-ops')}
          title="Return to Clinical Ops Dashboard"
        >
          <img 
            alt="medi AI SastaRx Logo" 
            className="h-8 w-auto object-contain rounded"
            src="https://lh3.googleusercontent.com/aida/AEtjO1XpvQ1G8AkW5QIgQDx3Bhkh0XM_nkZn9Vf1IXJlcPV0Bp16jNkXDo7HK6kQiBzQNcMizuSF16MpltHNWwsOtCDDg0jD-8BGnB7rrOrKBnaHR1cpUiSzZHhvaG7nseDyrKe8ERGm7in5OEQ-oH-Wv6XEM9T1Qu4p_wymsaSJOzbk_DPihvNmPAXyI1OgsCE-YsgVDrND245iAnTxEzrYfDUtgp5OHGXUNNFn_415xGdMDLMgoNE1LdCLj0s" 
          />
          <div className="flex flex-col">
            <span className="font-headline-sm text-base text-white tracking-tight leading-none">
              medi <span className="text-[#3B82F6]">AI</span>
            </span>
            <span className="font-code-mono text-[10px] text-[#93C5FD] uppercase tracking-wider">
              {currentMode === 'patient-portal' ? 'SastaRx Patient' : 'SastaRx Ops'}
            </span>
          </div>
        </div>

        <div className="hidden md:block h-6 w-px bg-[#334155]"></div>

        {/* Multi-Tenant Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
            className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#273549] py-1 px-2.5 rounded border border-[#334155] transition-colors text-left"
            title="Switch Tenant Organization"
          >
            <div className="w-5 h-5 rounded bg-[#2563EB] text-white flex items-center justify-center font-code-mono text-[10px] font-bold">
              {currentTenant.shortCode}
            </div>
            <div className="flex flex-col">
              <span className="font-title-md text-xs text-white font-medium leading-tight">
                {currentTenant.name}
              </span>
              <span className="font-code-mono text-[10px] text-[#94A3B8] leading-tight">
                Tenant #{currentTenant.tenantCode}
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-1 ml-1.5">
              <span className="px-1.5 py-0.2 rounded bg-white/10 text-[#93C5FD] font-code-mono text-[10px] border border-[#334155]">
                Schema: Isolated RLS
              </span>
              <span className="px-1.5 py-0.2 rounded bg-white/10 text-[#93C5FD] font-code-mono text-[10px] border border-[#334155]">
                {currentTenant.region}
              </span>
            </div>
            <span className="material-symbols-outlined text-[#94A3B8] text-sm">expand_more</span>
          </button>

          {/* Tenant Dropdown */}
          {tenantDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-72 bg-[#1E293B] border border-[#334155] rounded-lg shadow-2xl p-2 z-50">
              <div className="px-2 py-1 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider border-b border-[#334155]">
                Switch Healthcare Tenant Partition
              </div>
              <div className="flex flex-col gap-1 mt-1">
                {availableTenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onTenantChange(t);
                      setTenantDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between p-2 rounded text-left transition-colors ${
                      t.id === currentTenant.id
                        ? 'bg-[#2563EB] text-white font-medium'
                        : 'hover:bg-[#334155] text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-slate-900/40 text-xs font-bold flex items-center justify-center">
                        {t.shortCode}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">{t.name}</span>
                        <span className="text-[10px] opacity-75 font-code-mono">#{t.tenantCode} · {t.schema}</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 font-code-mono">
                      {t.environment}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-1 border-t border-[#334155] text-[10px] text-slate-400 px-2 flex justify-between">
                <span>Row-Level Security: Enforced</span>
                <span className="text-emerald-400">Zero Leakage</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-sm xl:max-w-md mx-3 hidden md:block">
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-2.5 text-[#94A3B8] text-base">search</span>
          <input
            value={globalSearchQuery}
            onChange={(e) => onGlobalSearchChange(e.target.value)}
            className="w-full h-8 pl-8 pr-12 bg-[#1E293B] border border-[#334155] rounded text-xs text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] font-body-sm transition-colors"
            placeholder="Search active salt, formulation, INN code or brand..."
            type="text"
          />
          <span className="absolute right-2 px-1.5 py-0.5 rounded bg-[#0F172A] border border-[#334155] text-[10px] font-code-mono text-[#94A3B8]">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right: Mode Switchers, Gateway status, Notifications & Profile */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* App Perspective View Switcher Tabs */}
        <div className="flex items-center bg-[#1E293B] p-0.5 rounded border border-[#334155] text-xs">
          <button
            onClick={() => onModeChange('clinical-ops')}
            className={`px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 ${
              currentMode === 'clinical-ops'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Clinical Operations Suite (Desktop Admin View)"
          >
            <span className="material-symbols-outlined text-sm">clinical_notes</span>
            <span className="hidden sm:inline">Clinical Ops</span>
          </button>
          
          <button
            onClick={() => onModeChange('patient-portal')}
            className={`px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 ${
              currentMode === 'patient-portal'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Patient Generic Discovery & OCR Scanner"
          >
            <span className="material-symbols-outlined text-sm">person_search</span>
            <span className="hidden sm:inline">Patient Portal</span>
          </button>

          <button
            onClick={() => onModeChange('system-architecture')}
            className={`px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 ${
              currentMode === 'system-architecture'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Multi-Tenant SaaS System Architecture Diagram (Image 1)"
          >
            <span className="material-symbols-outlined text-sm">account_tree</span>
            <span className="hidden lg:inline">Architecture</span>
          </button>
        </div>

        {/* API Gateway Operational badge */}
        <div className="hidden xl:flex items-center gap-1 px-2 py-1 rounded bg-emerald-950/50 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-code-mono text-[11px] text-emerald-300">
            Gateway: 98.4% Hit
          </span>
        </div>

        {/* Price Alerts Watchlist Button */}
        {onOpenPriceAlerts && (
          <button
            onClick={onOpenPriceAlerts}
            className="relative p-1.5 rounded hover:bg-[#1E293B] text-[#94A3B8] hover:text-white transition-colors flex items-center"
            title="Price Drop Watchlist & Threshold Alerts"
          >
            <span className="material-symbols-outlined text-xl">
              {priceAlerts.some((a) => a.status === 'Triggered') ? 'notifications_active' : 'add_alert'}
            </span>
            {priceAlerts.some((a) => a.status === 'Triggered') ? (
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-[#0F172A] animate-ping"></span>
            ) : priceAlerts.length > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 px-1 py-0.2 bg-[#2563EB] text-white rounded-full text-[9px] font-code-mono font-bold">
                {priceAlerts.length}
              </span>
            ) : null}
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-1.5 rounded hover:bg-[#1E293B] text-[#94A3B8] hover:text-white transition-colors"
            title="System alerts & triage notifications"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {(anomalyCount > 0 || priceAlerts.some((a) => a.status === 'Triggered')) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-[#0F172A]"></span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#1E293B] border border-[#334155] rounded-lg shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#334155]">
                <span className="text-xs font-semibold text-white">System & Price Feed Alerts</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-code-mono">
                  {anomalyCount + priceAlerts.filter((a) => a.status === 'Triggered').length} Action Required
                </span>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                {/* Triggered Price Alerts */}
                {priceAlerts
                  .filter((a) => a.status === 'Triggered')
                  .map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        if (onOpenPriceAlerts) onOpenPriceAlerts();
                        setNotificationsOpen(false);
                      }}
                      className="p-2 rounded bg-emerald-950/50 border border-emerald-500/40 hover:bg-emerald-900/40 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-emerald-400">trending_down</span>
                          Price Drop: {alert.medicineName}
                        </div>
                        <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded font-code-mono">
                          Triggered
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-200 mt-1">
                        Generic dropped to ₹{(alert.triggeredPrice || alert.targetThresholdPrice).toFixed(2)} (Target was ₹{alert.targetThresholdPrice.toFixed(2)}).
                      </p>
                      <div className="flex justify-between items-center mt-1.5 text-[10px] text-emerald-400 font-code-mono">
                        <span>Save ₹{(alert.brandedMrp - (alert.triggeredPrice || alert.targetThresholdPrice)).toFixed(2)} vs MRP</span>
                        <span className="underline font-bold">Open Watchlist &rarr;</span>
                      </div>
                    </div>
                  ))}

                <div 
                  onClick={() => {
                    onOpenTriage();
                    setNotificationsOpen(false);
                  }}
                  className="p-2 rounded bg-amber-950/40 border border-amber-500/30 hover:bg-amber-900/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Teneligliptin 20mg Discrepancy
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    3 clinical reports flagged bio-ratio mismatch from Jan Aushadhi feed #JA-804.
                  </p>
                  <div className="flex justify-between items-center mt-2 text-[10px] text-amber-400 font-code-mono">
                    <span>SLA: 1h 40m</span>
                    <span className="underline font-bold">Review in Triage &rarr;</span>
                  </div>
                </div>

                <div 
                  onClick={() => {
                    onOpenAuditLogs();
                    setNotificationsOpen(false);
                  }}
                  className="p-2 rounded bg-slate-800/80 border border-slate-700 hover:bg-slate-700/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-slate-200 text-xs font-medium">
                    <span className="material-symbols-outlined text-sm text-blue-400">lock_clock</span>
                    HMAC-SHA256 Audit Log Generated
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    124 new prescription equivalence queries securely anchored in tenant schema.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-[#334155] hidden sm:block"></div>

        {/* Profile Card */}
        <div className="flex items-center gap-2 pl-0.5">
          <img
            alt="Dr. Sarah Jenkins"
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-600 shrink-0"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6Bi5RgveOWVr-hDQZHdfJddZ0PvEIqsO8Wxttzs7x14bVPOiLwwcOiH8nOG7s0jRLvN60FWCC39DhheMdjueMk1QRJDHo1NCwIgkaqlUeukGkxKT7ec3ixuOmkTnEUOfQh5w0WAvBgjXu1EJV489T6Q6E4kr-VcTDb5hh49mO-Mu2PvgIsNAS8qyUz8clLbiFr-FPLKwiwrIIuel3oQv3kl3m33kDudYmFxtFoiIi1_3N1U-ClOAI"
          />
          <div className="hidden xl:flex flex-col text-left">
            <span className="font-title-md text-xs text-white leading-tight">
              Dr. Sarah Jenkins
            </span>
            <span className="font-code-mono text-[10px] text-[#94A3B8] leading-tight">
              Lead Ops Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
