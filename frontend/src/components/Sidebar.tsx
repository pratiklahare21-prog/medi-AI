import React from 'react';
import { OpsNavigationTab, UserAccount } from '../types';

interface SidebarProps {
  currentTab: OpsNavigationTab;
  onTabChange: (tab: OpsNavigationTab) => void;
  accuracyDisputeCount: number;
  priceAlertsCount?: number;
  onOpenPriceAlerts?: () => void;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  accuracyDisputeCount,
  priceAlertsCount = 0,
  onOpenPriceAlerts,
  currentUser,
  onLogout
}) => {
  const navItems = [
    {
      id: 'dashboard-and-analytics' as OpsNavigationTab,
      label: 'Dashboard',
      icon: '📊'
    },
    {
      id: 'medicine-and-salt-catalog' as OpsNavigationTab,
      label: 'Medicine Catalog',
      icon: '💊'
    },
    {
      id: 'pricing-feeds-and-partners' as OpsNavigationTab,
      label: 'Pricing Feeds',
      icon: '💰'
    },
    {
      id: 'accuracy-reports-and-disputes' as OpsNavigationTab,
      label: 'Disputes',
      icon: '⚠️',
      badge: accuracyDisputeCount > 0 ? accuracyDisputeCount : null
    },
    {
      id: 'multi-tenant-config-and-audit-logs' as OpsNavigationTab,
      label: 'Audit Logs',
      icon: '🔒'
    }
  ];

  const advancedFeatures = [
    {
      id: 'medicine-comparison' as OpsNavigationTab,
      label: 'Comparison',
      icon: '⚖️'
    },
    {
      id: 'savings-dashboard' as OpsNavigationTab,
      label: 'Savings',
      icon: '💵'
    },
    {
      id: 'super-admin-panel' as OpsNavigationTab,
      label: 'Admin Panel',
      icon: '👤'
    }
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Main Menu
          </h2>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Advanced Features */}
        <div className="mt-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Advanced
          </h2>
          {advancedFeatures.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer - User Info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.name}</p>
            <p className="text-xs text-gray-500 truncate">{currentUser?.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};
