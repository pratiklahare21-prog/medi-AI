import React, { useState } from 'react';
import { PriceAlert, MedicineCatalogEntry } from '../types';

interface PriceAlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: PriceAlert[];
  catalog?: MedicineCatalogEntry[];
  onOpenSetAlert: (med?: MedicineCatalogEntry | null) => void;
  onDeleteAlert: (alertId: string) => Promise<any> | void;
  onTogglePauseAlert: (alertId: string) => Promise<any> | void;
  onSimulatePriceDrop?: (alertId: string) => void;
  onSimulateDrop?: (alertId: string, simulatedPrice: number) => Promise<any> | void;
  onEditAlert?: (alert: PriceAlert) => void;
  onAddToCart?: (item: { name: string; price: number; originalPrice: number; savings: number }) => void;
}

export const PriceAlertsDrawer: React.FC<PriceAlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  catalog = [],
  onOpenSetAlert,
  onDeleteAlert,
  onTogglePauseAlert,
  onSimulatePriceDrop,
  onSimulateDrop,
  onEditAlert,
  onAddToCart
}) => {
  const [filterTab, setFilterTab] = useState<'All' | 'Active' | 'Triggered' | 'Paused'>('All');
  const [testSimulatedAlertId, setTestSimulatedAlertId] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeCount = alerts.filter((a) => a.status === 'Active').length;
  const triggeredCount = alerts.filter((a) => a.status === 'Triggered').length;
  const pausedCount = alerts.filter((a) => a.status === 'Paused').length;

  const filteredAlerts = alerts.filter((a) => {
    if (filterTab === 'Active') return a.status === 'Active';
    if (filterTab === 'Triggered') return a.status === 'Triggered';
    if (filterTab === 'Paused') return a.status === 'Paused';
    return true;
  });

  const handleSimulate = (alertId: string) => {
    if (onSimulatePriceDrop) {
      onSimulatePriceDrop(alertId);
    } else if (onSimulateDrop) {
      const alert = alerts.find(a => a.id === alertId);
      const dropPrice = alert ? Math.max(1, alert.targetThresholdPrice - 5) : 50;
      onSimulateDrop(alertId, dropPrice);
    }
    setTestSimulatedAlertId(alertId);
    setTimeout(() => setTestSimulatedAlertId(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center shadow-2xs">
              <span className="material-symbols-outlined text-xl">notifications_active</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-base font-bold text-slate-900">
                  Medicine Price Drop Watchlist & Alerts
                </h3>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-[#2563EB] text-[10px] font-code-mono font-bold">
                  {alerts.length} Monitored
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-body-sm">
                Real-time price threshold surveillance across 14 partner feeds & Jan Aushadhi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenSetAlert(null)}
              className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-base">add_alert</span>
              <span>New Price Alert</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Top Summary Banner */}
        <div className="p-4 bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Alerts</span>
            <span className="text-lg font-bold text-slate-900 font-code-mono">{alerts.length}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-blue-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-blue-700 block">Active Watching</span>
            <span className="text-lg font-bold text-[#2563EB] font-code-mono">{activeCount}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-emerald-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Triggered Drops</span>
            <span className="text-lg font-bold text-emerald-700 font-code-mono">{triggeredCount}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Paused</span>
            <span className="text-lg font-bold text-slate-600 font-code-mono">{pausedCount}</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600">
            {(['All', 'Active', 'Triggered', 'Paused'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  filterTab === tab
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'hover:text-slate-900 text-slate-600'
                }`}
              >
                {tab} {tab === 'All' ? `(${alerts.length})` : tab === 'Active' ? `(${activeCount})` : tab === 'Triggered' ? `(${triggeredCount})` : `(${pausedCount})`}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 font-code-mono hidden sm:block">
            Feed Engine: 15-min Polling Cadence
          </div>
        </div>

        {/* Alert List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">notifications_off</span>
              <p className="text-sm font-semibold text-slate-700">No price alerts found in this view</p>
              <p className="text-xs text-slate-400 mt-1">Set a price alert on any medicine compound in the catalog.</p>
              <button
                onClick={() => onOpenSetAlert(null)}
                className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
              >
                + Set First Price Alert
              </button>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const med = catalog.find((m) => m.id === alert.medicineId);
              const isTriggered = alert.status === 'Triggered';
              const isPaused = alert.status === 'Paused';
              const currentPrice = med ? med.lowestGenericPrice : alert.currentLowestPrice;
              const isTargetMet = currentPrice <= alert.targetThresholdPrice;
              const dropNeeded = Math.max(0, currentPrice - alert.targetThresholdPrice);

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isTriggered
                      ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-400/30'
                      : isPaused
                      ? 'bg-slate-50 border-slate-200 opacity-80'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isTriggered
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPaused
                            ? 'bg-slate-200 text-slate-600'
                            : 'bg-blue-100 text-[#2563EB]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {isTriggered ? 'verified' : isPaused ? 'pause' : 'notifications'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{alert.medicineName}</h4>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                              isTriggered
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isPaused
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-blue-50 text-[#2563EB] border border-blue-200'
                            }`}
                          >
                            {alert.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-code-mono">{alert.activeSalt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-code-mono border border-slate-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">
                          {alert.channel === 'In-App' ? 'notifications' : alert.channel === 'SMS & WhatsApp' ? 'chat' : 'mail'}
                        </span>
                        {alert.channel}
                      </span>
                      <span className="text-[10px] text-slate-400 font-code-mono">
                        {alert.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Benchmark & Target Visual Comparison */}
                  <div className="mt-3 p-3 rounded-lg bg-slate-50/80 border border-slate-200/80 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Innovator MRP</span>
                      <span className="font-code-mono font-bold text-slate-700">₹{alert.brandedMrp.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Current Market Low</span>
                      <span className="font-code-mono font-bold text-slate-900">₹{currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="bg-blue-50/80 p-1 rounded border border-blue-200/80">
                      <span className="text-[10px] text-blue-700 font-bold uppercase block">Alert Threshold</span>
                      <span className="font-code-mono font-bold text-[#2563EB]">₹{alert.targetThresholdPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Triggered or Status Banner */}
                  {isTriggered ? (
                    <div className="mt-3 p-2.5 rounded-lg bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-emerald-700 text-base">check_circle</span>
                        <span>
                          <strong>Threshold Met!</strong> Generic dropped to{' '}
                          <strong className="font-code-mono">₹{(alert.triggeredPrice || currentPrice).toFixed(2)}</strong>{' '}
                          {alert.triggeredBrand ? `(${alert.triggeredBrand})` : ''} — saving ₹{(alert.brandedMrp - (alert.triggeredPrice || currentPrice)).toFixed(2)} vs MRP.
                        </span>
                      </div>
                      {onAddToCart && (
                        <button
                          onClick={() => {
                            onAddToCart({
                              name: alert.triggeredBrand || `${alert.activeSalt} Generic`,
                              price: alert.triggeredPrice || currentPrice,
                              originalPrice: alert.brandedMrp,
                              savings: alert.brandedMrp - (alert.triggeredPrice || currentPrice)
                            });
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-2xs"
                        >
                          + Add to Cart
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-code-mono">
                      <span>
                        Drop needed: <strong className="text-slate-800">₹{dropNeeded.toFixed(2)}</strong> (
                        {Math.round((dropNeeded / currentPrice) * 100)}% discount from current generic)
                      </span>
                      <span>Target recipient: {alert.recipientTarget}</span>
                    </div>
                  )}

                  {alert.notes && (
                    <p className="text-[11px] text-slate-500 italic mt-1.5">
                      "{alert.notes}"
                    </p>
                  )}

                  {/* Actions Row */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {!isTriggered && (
                        <button
                          onClick={() => handleSimulate(alert.id)}
                          className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Simulate partner feed price reduction below threshold to test trigger"
                        >
                          <span className="material-symbols-outlined text-xs text-amber-700">bolt</span>
                          <span>Simulate Price Drop</span>
                        </button>
                      )}
                      {testSimulatedAlertId === alert.id && (
                        <span className="text-[10px] text-emerald-700 font-bold animate-pulse">
                          Triggered! Notification dispatched.
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onTogglePauseAlert(alert.id)}
                        className="px-2 py-1 rounded text-slate-600 hover:bg-slate-100 border border-slate-200 text-[11px] font-medium cursor-pointer transition-colors"
                      >
                        {isPaused ? 'Resume' : 'Pause'}
                      </button>
                      <button
                        onClick={() => onEditAlert(alert)}
                        className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                        title="Edit Alert Threshold"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteAlert(alert.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                        title="Delete Alert"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-code-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Automatic webhook alerts active across Netmeds, Tata 1mg, Apollo & PMBI feeds
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs cursor-pointer shadow-sm"
          >
            Close Watchlist
          </button>
        </div>
      </div>
    </div>
  );
};
