import React from 'react';
import { OpsNavigationTab } from '../types';

interface SidebarProps {
  currentTab: OpsNavigationTab;
  onTabChange: (tab: OpsNavigationTab) => void;
  accuracyDisputeCount: number;
  priceAlertsCount?: number;
  onOpenPriceAlerts?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  accuracyDisputeCount,
  priceAlertsCount = 0,
  onOpenPriceAlerts
}) => {
  const navItems = [
    {
      id: 'dashboard-and-analytics' as OpsNavigationTab,
      label: 'Dashboard & Analytics',
      icon: 'dashboard',
      badge: null
    },
    {
      id: 'medicine-and-salt-catalog' as OpsNavigationTab,
      label: 'Medicine & Salt Catalog',
      icon: 'medication',
      badge: {
        text: '98.6% Equiv',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }
    },
    {
      id: 'pricing-feeds-and-partners' as OpsNavigationTab,
      label: 'Pricing Feeds & Partners',
      icon: 'payments',
      badge: {
        text: '3 Stale',
        bg: 'bg-amber-50 text-amber-700 border-amber-200'
      }
    },
    {
      id: 'accuracy-reports-and-disputes' as OpsNavigationTab,
      label: 'Accuracy & Disputes',
      icon: 'verified',
      badge: {
        text: `${accuracyDisputeCount} Open`,
        bg: 'bg-red-50 text-red-700 border-red-200'
      }
    },
    {
      id: 'multi-tenant-config-and-audit-logs' as OpsNavigationTab,
      label: 'Tenant Config & Audit',
      icon: 'shield_person',
      badge: null
    }
  ];

  return (
    <aside className="fixed left-0 top-14 bottom-8 w-64 bg-white border-r border-slate-200 z-40 flex flex-col justify-between select-none">
      <div className="flex flex-col pt-4">
        <div className="px-4 pb-2 mb-1 border-b border-slate-100 flex items-center justify-between">
          <span className="font-label-xs text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Clinical Operations Suite
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Synced"></span>
        </div>

        <nav className="flex flex-col gap-1 px-2.5 mt-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center justify-between px-3 py-2 rounded text-left transition-all text-xs font-medium ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`material-symbols-outlined text-lg ${isActive ? 'text-white' : 'text-slate-500'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded border text-[10px] font-code-mono font-semibold shrink-0 ${
                      isActive ? 'bg-white/20 text-white border-white/30' : `${item.badge.bg}`
                    }`}
                  >
                    {item.badge.text}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Analytical Sub-links */}
        <div className="px-2.5 mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1">
          <span className="px-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider font-code-mono">
            Analytical Models
          </span>
          <button
            onClick={() => {
              if (currentTab !== 'dashboard-and-analytics') {
                onTabChange('dashboard-and-analytics');
              }
              setTimeout(() => {
                const el = document.getElementById('price-trend-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="flex items-center justify-between px-3 py-1.5 rounded text-left text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#10B981]">ssid_chart</span>
              <span>Price Volatility Charts</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-code-mono bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              Recharts
            </span>
          </button>
        </div>
      </div>

      {/* Price Alerts Watchlist */}
      {onOpenPriceAlerts && (
        <div className="px-3 mb-2">
          <button
            onClick={onOpenPriceAlerts}
            className="w-full flex items-center justify-between p-2.5 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-900 transition-colors text-left text-xs font-semibold cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-amber-600">notifications_active</span>
              <span>Price Drop Watchlist</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 text-[10px] font-code-mono font-bold">
              {priceAlertsCount}
            </span>
          </button>
        </div>
      )}

      {/* Compliance Box */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/80 m-2 rounded-lg">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#006c4a]"></span>
          <span className="font-label-xs text-[11px] font-bold text-slate-800">
            DISHA & HIPAA Certified
          </span>
        </div>
        <p className="font-label-xs text-[11px] text-slate-500 leading-normal">
          Strict row-level security enabled. Every transaction is immutably cryptographically audited.
        </p>
      </div>
    </aside>
  );
};
