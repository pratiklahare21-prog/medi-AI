import React from 'react';
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
}) => {
  const topMedicines = catalog.slice(0, 4);
  const activeFeedsCount = feeds.filter(f => f.status === 'Live').length;
  const avgSavings = Math.round(catalog.reduce((acc, m) => acc + m.savingsPercent, 0) / catalog.length);

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your clinical operations overview</p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Medicines</p>
              <p className="text-4xl font-bold text-gray-900">{catalog.length}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-3xl">
              💊
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Active Feeds</p>
              <p className="text-4xl font-bold text-gray-900">{activeFeedsCount}</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-3xl">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Avg Savings</p>
              <p className="text-4xl font-bold text-gray-900">{avgSavings}%</p>
            </div>
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-3xl">
              💰
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={onOpenAddMedicine}
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left"
          >
            <span className="text-3xl">➕</span>
            <div>
              <p className="font-semibold text-gray-900">Add Medicine</p>
              <p className="text-sm text-gray-600">New catalog entry</p>
            </div>
          </button>

          <button
            onClick={onSwitchToCatalog}
            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-left"
          >
            <span className="text-3xl">📋</span>
            <div>
              <p className="font-semibold text-gray-900">View Catalog</p>
              <p className="text-sm text-gray-600">Browse medicines</p>
            </div>
          </button>

          <button
            onClick={onOpenTriage}
            className="flex items-center gap-3 p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors text-left"
          >
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="font-semibold text-gray-900">View Disputes</p>
              <p className="text-sm text-gray-600">Review pending</p>
            </div>
          </button>

          <button
            onClick={onOpenAuditLogs}
            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
          >
            <span className="text-3xl">📊</span>
            <div>
              <p className="font-semibold text-gray-900">Audit Logs</p>
              <p className="text-sm text-gray-600">View history</p>
            </div>
          </button>
        </div>
      </div>

      {/* Top Medicines */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Generic Alternatives</h2>
        <div className="space-y-3">
          {topMedicines.map((med) => (
            <div 
              key={med.id}
              className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={onSwitchToCatalog}
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-lg">{med.brandName}</p>
                <p className="text-sm text-gray-600 mt-1">{med.salt} • {med.formulation}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">
                  {med.savingsPercent}%
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  ₹{med.genericPrice} vs ₹{med.price}
                </p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onSwitchToCatalog}
          className="w-full mt-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors"
        >
          View All Medicines →
        </button>
      </div>

      {/* Price Trends */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Price Trends</h2>
        <PriceTrendSection />
      </div>
    </div>
  );
};
