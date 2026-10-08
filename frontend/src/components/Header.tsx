import React, { useState } from 'react';
import { AppViewMode, TenantInfo, PriceAlert, UserAccount } from '../types';
import { LanguageSelector } from './LanguageSelector';

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
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  onOpenAuth?: () => void;
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
  onOpenPriceAlerts,
  currentUser,
  onLogout,
  onOpenAuth
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      {/* Left: Logo & Brand */}
      <div className="flex items-center gap-6">
        <div 
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => onModeChange('clinical-ops')}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-md">
            💊
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-gray-900">
              medi <span className="text-blue-600">AI</span>
            </span>
            <span className="text-xs text-gray-500">
              {currentMode === 'patient-portal' ? 'Patient Portal' : 'Clinical Operations'}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:block w-96">
          <input
            type="text"
            placeholder="Search medicines, salts, or insights..."
            value={globalSearchQuery}
            onChange={(e) => onGlobalSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Mode Switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => onModeChange('clinical-ops')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              currentMode === 'clinical-ops'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Clinical Ops
          </button>
          
          <button
            onClick={() => onModeChange('patient-portal')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              currentMode === 'patient-portal'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Patient Portal
          </button>
        </div>

        {/* Language Selector */}
        <LanguageSelector />

        {/* Notifications - Price Alerts */}
        {priceAlerts && priceAlerts.filter(a => a.status === 'Active' || a.status === 'Triggered').length > 0 && (
          <button
            onClick={onOpenPriceAlerts}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Price Alerts"
          >
            <span className="text-xl">🔔</span>
            {priceAlerts.some(a => a.status === 'Triggered') && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
        )}

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-gray-900">{currentUser?.name}</span>
              <span className="text-xs text-gray-500">{currentUser?.role}</span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <>
              {/* Backdrop to close dropdown */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setProfileDropdownOpen(false)}
              ></div>
              
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500">{currentUser?.email}</p>
                </div>
                
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onOpenAuditLogs();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  📋 Audit Logs
                </button>
                
                {anomalyCount > 0 && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenTriage();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>⚠️ Disputes</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                      {anomalyCount}
                    </span>
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout?.();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1"
                >
                  🚪 Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
