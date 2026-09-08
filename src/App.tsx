import React, { useState } from 'react';
import { 
  AppViewMode, 
  OpsNavigationTab, 
  TenantInfo, 
  MedicineCatalogEntry, 
  PricingPartnerFeed, 
  AccuracyDisputeItem, 
  AuditLogItem, 
  LinkedGenericCompound,
  PriceAlert 
} from './types';
import { 
  INITIAL_TENANTS, 
  INITIAL_CATALOG, 
  INITIAL_FEEDS, 
  INITIAL_DISPUTES, 
  INITIAL_AUDIT_LOGS, 
  CHRONIC_PACKS,
  INITIAL_PRICE_ALERTS 
} from './data/mockData';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CatalogView } from './components/CatalogView';
import { PricingFeedsView } from './components/PricingFeedsView';
import { DisputesTriageView } from './components/DisputesTriageView';
import { ArchitectureView } from './components/ArchitectureView';
import { PatientPortalView } from './components/PatientPortalView';
import { MultiTenantConfigView } from './components/MultiTenantConfigView';

import { BioavailabilityModal } from './components/BioavailabilityModal';
import { AddMedicineModal } from './components/AddMedicineModal';
import { LinkGenericModal } from './components/LinkGenericModal';
import { AuditLogModal } from './components/AuditLogModal';
import { SetPriceAlertModal } from './components/SetPriceAlertModal';
import { PriceAlertsDrawer } from './components/PriceAlertsDrawer';

export default function App() {
  const [viewMode, setViewMode] = useState<AppViewMode>('clinical-ops');
  const [opsTab, setOpsTab] = useState<OpsNavigationTab>('dashboard-and-analytics');
  const [currentTenant, setCurrentTenant] = useState<TenantInfo>(INITIAL_TENANTS[0]);
  const [globalSearch, setGlobalSearch] = useState('');

  // Domain state
  const [catalog, setCatalog] = useState<MedicineCatalogEntry[]>(INITIAL_CATALOG);
  const [feeds, setFeeds] = useState<PricingPartnerFeed[]>(INITIAL_FEEDS);
  const [disputes, setDisputes] = useState<AccuracyDisputeItem[]>(INITIAL_DISPUTES);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(INITIAL_PRICE_ALERTS);

  // Cart state for Patient Portal
  const [cartItems, setCartItems] = useState<Array<{ name: string; price: number; originalPrice: number; savings: number }>>([]);

  // Modals state
  const [bioavailabilityMed, setBioavailabilityMed] = useState<MedicineCatalogEntry | null>(null);
  const [addMedicineOpen, setAddMedicineOpen] = useState(false);
  const [linkGenericMed, setLinkGenericMed] = useState<MedicineCatalogEntry | null>(null);
  const [auditLogsModalOpen, setAuditLogsModalOpen] = useState(false);
  const [alertModalMed, setAlertModalMed] = useState<MedicineCatalogEntry | null>(null);
  const [priceAlertsDrawerOpen, setPriceAlertsDrawerOpen] = useState(false);

  // Helper to append cryptographic audit log
  const logAction = (action: string, details: string) => {
    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}`,
      action,
      actor: 'Dr. Sarah Jenkins',
      role: 'Lead Ops Admin',
      targetEntity: details,
      tenantId: currentTenant.tenantCode,
      tenantName: currentTenant.name,
      timestamp: 'Just now',
      hashSignature: `HMAC-SHA256: ${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      status: 'Audited'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Price Alert handlers
  const handleSaveAlert = (alertData: Omit<PriceAlert, 'id' | 'createdAt'> & { id?: string }) => {
    if (alertData.id) {
      // Update existing
      setPriceAlerts(prev =>
        prev.map(a => (a.id === alertData.id ? { ...a, ...alertData } : a))
      );
      logAction(
        'UPDATE_PRICE_ALERT',
        `Updated price drop alert threshold for ${alertData.medicineName} to ₹${alertData.targetThresholdPrice}`
      );
    } else {
      // Create new
      const newAlert: PriceAlert = {
        ...alertData,
        id: `alert-${Date.now()}`,
        createdAt: 'Just now'
      };
      setPriceAlerts(prev => [newAlert, ...prev]);
      logAction(
        'CREATE_PRICE_ALERT',
        `Configured new price drop alert for ${alertData.medicineName} (Threshold: ₹${alertData.targetThresholdPrice})`
      );
    }
  };

  const handleDeleteAlert = (alertId: string) => {
    const toDelete = priceAlerts.find(a => a.id === alertId);
    setPriceAlerts(prev => prev.filter(a => a.id !== alertId));
    if (toDelete) {
      logAction('DELETE_PRICE_ALERT', `Removed price alert for ${toDelete.medicineName}`);
    }
  };

  const handleTogglePauseAlert = (alertId: string) => {
    setPriceAlerts(prev =>
      prev.map(a => {
        if (a.id !== alertId) return a;
        const newStatus = a.status === 'Paused' ? 'Active' : 'Paused';
        logAction(
          newStatus === 'Paused' ? 'PAUSE_PRICE_ALERT' : 'RESUME_PRICE_ALERT',
          `Changed alert status to ${newStatus} for ${a.medicineName}`
        );
        return { ...a, status: newStatus };
      })
    );
  };

  const handleSimulatePriceDrop = (alertId: string, simulatedPrice: number) => {
    setPriceAlerts(prev =>
      prev.map(a => {
        if (a.id !== alertId) return a;
        logAction(
          'TRIGGER_PRICE_ALERT_EVENT',
          `Market feed update: generic dropped to ₹${simulatedPrice} (below ₹${a.targetThresholdPrice} threshold) for ${a.medicineName}`
        );
        return {
          ...a,
          status: 'Triggered',
          triggeredPrice: simulatedPrice,
          triggeredAt: 'Just now'
        };
      })
    );

    // Also update lowestGenericPrice on corresponding medicine in catalog so table reflects the drop!
    const targetAlert = priceAlerts.find(a => a.id === alertId);
    if (targetAlert) {
      setCatalog(prev =>
        prev.map(med => {
          if (med.id !== targetAlert.medicineId) return med;
          const newSavings = +(med.brandedMrp - simulatedPrice).toFixed(2);
          const newSavingsPercent = Math.round((newSavings / med.brandedMrp) * 100);
          return {
            ...med,
            lowestGenericPrice: simulatedPrice,
            savingsAmount: newSavings,
            savingsPercent: newSavingsPercent
          };
        })
      );
    }
  };

  // Handlers
  const handleToggleGenericInRx = (medId: string, genericId: string) => {
    setCatalog(prev =>
      prev.map(med => {
        if (med.id !== medId || !med.genericsList) return med;
        const updatedGenerics = med.genericsList.map(gen => {
          if (gen.id !== genericId) return gen;
          const nextState = !gen.includedInPatientRx;
          logAction(
            nextState ? 'ENABLE_FORMULARY_RX' : 'DISABLE_FORMULARY_RX',
            `${gen.name} status updated for innovator ${med.brandName}`
          );
          return { ...gen, includedInPatientRx: nextState };
        });
        return { ...med, genericsList: updatedGenerics };
      })
    );
  };

  const handleAddMedicine = (newMed: MedicineCatalogEntry) => {
    setCatalog(prev => [newMed, ...prev]);
    logAction('REGISTER_MEDICINE_ENTRY', `Added new compound ${newMed.brandName} (${newMed.activeSalt})`);
  };

  const handleLinkGeneric = (medId: string, newGeneric: LinkedGenericCompound) => {
    setCatalog(prev =>
      prev.map(med => {
        if (med.id !== medId) return med;
        const existing = med.genericsList || [];
        logAction('LINK_GENERIC_COMPOUND', `Linked generic ${newGeneric.name} to ${med.brandName}`);
        return {
          ...med,
          verifiedGenericsCount: med.verifiedGenericsCount + 1,
          genericsList: [...existing, newGeneric]
        };
      })
    );
  };

  const handleRetryFeed = (feedId: string) => {
    setFeeds(prev =>
      prev.map(f => {
        if (f.id !== feedId) return f;
        logAction('TRIGGER_FEED_RESYNC', `Forced manual scraper resync for feed ${f.name}`);
        return {
          ...f,
          status: 'Syncing',
          syncProgress: 42,
          notes: 'Manual scraper retry triggered. Resolving TLS session...'
        };
      })
    );

    setTimeout(() => {
      setFeeds(prev =>
        prev.map(f => {
          if (f.id !== feedId) return f;
          return {
            ...f,
            status: 'Healthy',
            syncProgress: undefined,
            updatedAgo: 'Just now',
            notes: 'Successfully recovered after forced retry. 2,420 SKUs parsed.'
          };
        })
      );
    }, 2000);
  };

  const handleResolveDispute = (id: string, action: string) => {
    setDisputes(prev => prev.filter(d => d.id !== id));
    logAction('RESOLVE_ACCURACY_DISPUTE', `Resolved dispute #${id} with decision: ${action}`);
  };

  const handleAddToCart = (item: { name: string; price: number; originalPrice: number; savings: number }) => {
    setCartItems(prev => [...prev, item]);
  };

  const totalCartSavings = cartItems.reduce((acc, curr) => acc + curr.savings, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-body-md antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Universal Fixed Header */}
      <Header
        currentMode={viewMode}
        onModeChange={setViewMode}
        currentTenant={currentTenant}
        onTenantChange={(t) => {
          setCurrentTenant(t);
          logAction('SWITCH_TENANT_PARTITION', `Switched active context to ${t.name} (${t.schema})`);
        }}
        availableTenants={INITIAL_TENANTS}
        globalSearchQuery={globalSearch}
        onGlobalSearchChange={(q) => {
          setGlobalSearch(q);
          if (q.trim() && viewMode === 'clinical-ops' && opsTab !== 'medicine-and-salt-catalog') {
            setOpsTab('medicine-and-salt-catalog');
          }
        }}
        onOpenAuditLogs={() => setAuditLogsModalOpen(true)}
        onOpenTriage={() => {
          setViewMode('clinical-ops');
          setOpsTab('accuracy-reports-and-disputes');
        }}
        anomalyCount={disputes.length}
        priceAlerts={priceAlerts}
        onOpenPriceAlerts={() => setPriceAlertsDrawerOpen(true)}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex pt-14">
        {/* Ops Sidebar (Visible when in clinical-ops mode) */}
        {viewMode === 'clinical-ops' && (
          <Sidebar
            currentTab={opsTab}
            onTabChange={setOpsTab}
            accuracyDisputeCount={disputes.length}
            priceAlertsCount={priceAlerts.length}
            onOpenPriceAlerts={() => setPriceAlertsDrawerOpen(true)}
          />
        )}

        {/* View Content Area */}
        <main
          className={`flex-1 transition-all ${
            viewMode === 'clinical-ops' ? 'md:ml-64 p-4 lg:p-6' : 'p-4 lg:p-8 max-w-7xl mx-auto w-full'
          }`}
        >
          {/* 1. CLINICAL OPS VIEWS */}
          {viewMode === 'clinical-ops' && (
            <>
              {opsTab === 'dashboard-and-analytics' && (
                <DashboardView
                  tenant={currentTenant}
                  catalog={catalog}
                  feeds={feeds}
                  onOpenTriage={() => setOpsTab('accuracy-reports-and-disputes')}
                  onOpenAuditLogs={() => setAuditLogsModalOpen(true)}
                  onOpenAddMedicine={() => setAddMedicineOpen(true)}
                  onSwitchToCatalog={() => setOpsTab('medicine-and-salt-catalog')}
                  onSwitchToArchitecture={() => setViewMode('system-architecture')}
                  onRetryFeed={handleRetryFeed}
                  onExportAudit={() => {
                    logAction('EXPORT_COMPLIANCE_AUDIT', 'Exported JSON audit log bundle');
                    alert('Compliance Audit Bundle (HMAC-SHA256 Signed JSON) successfully downloaded.');
                  }}
                  onImportFeed={() => {
                    alert('Opening Pharmacy Pricing Feed Ingestion Wizard. Supported formats: Jan Aushadhi CSV, Apollo Feed v2 JSON.');
                  }}
                />
              )}

              {opsTab === 'medicine-and-salt-catalog' && (
                <CatalogView
                  catalog={catalog}
                  alerts={priceAlerts}
                  onToggleGenericInRx={handleToggleGenericInRx}
                  onOpenBioavailabilityCurve={(med) => setBioavailabilityMed(med)}
                  onOpenAddMedicine={() => setAddMedicineOpen(true)}
                  onOpenLinkGeneric={(med) => setLinkGenericMed(med)}
                  onOpenSetAlert={(med) => setAlertModalMed(med)}
                  onOpenAlertsManager={() => setPriceAlertsDrawerOpen(true)}
                  onExportCatalog={() => {
                    logAction('EXPORT_CATALOG', 'Exported verified formulations catalog (CSV)');
                    alert('Verified Formulary Catalog downloaded.');
                  }}
                  onImportCsv={() => {
                    setAddMedicineOpen(true);
                  }}
                />
              )}

              {opsTab === 'pricing-feeds-and-partners' && (
                <PricingFeedsView
                  feeds={feeds}
                  onRetryFeed={handleRetryFeed}
                  onRefreshAll={() => {
                    feeds.forEach(f => handleRetryFeed(f.id));
                  }}
                />
              )}

              {opsTab === 'accuracy-reports-and-disputes' && (
                <DisputesTriageView
                  disputes={disputes}
                  onResolveDispute={handleResolveDispute}
                />
              )}

              {opsTab === 'multi-tenant-config-and-audit-logs' && (
                <MultiTenantConfigView
                  currentTenant={currentTenant}
                  availableTenants={INITIAL_TENANTS}
                  auditLogs={auditLogs}
                  onSelectTenant={(t) => {
                    setCurrentTenant(t);
                    logAction('SWITCH_TENANT_PARTITION', `Switched active context to ${t.name} (${t.schema})`);
                  }}
                />
              )}
            </>
          )}

          {/* 2. PATIENT DISCOVERY PORTAL */}
          {viewMode === 'patient-portal' && (
            <PatientPortalView
              catalog={catalog}
              chronicPacks={CHRONIC_PACKS}
              alerts={priceAlerts}
              onAddToCart={handleAddToCart}
              onOpenSetAlert={(med) => setAlertModalMed(med)}
              onOpenAlertsManager={() => setPriceAlertsDrawerOpen(true)}
              cartCount={cartItems.length}
              totalSaved={totalCartSavings}
            />
          )}

          {/* 3. MULTI-TENANT SAAS SYSTEM ARCHITECTURE (IMAGE 1) */}
          {viewMode === 'system-architecture' && (
            <ArchitectureView />
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <BioavailabilityModal
        medicine={bioavailabilityMed}
        onClose={() => setBioavailabilityMed(null)}
      />

      <AddMedicineModal
        isOpen={addMedicineOpen}
        onClose={() => setAddMedicineOpen(false)}
        onAdd={handleAddMedicine}
      />

      <LinkGenericModal
        medicine={linkGenericMed}
        onClose={() => setLinkGenericMed(null)}
        onLink={handleLinkGeneric}
      />

      <AuditLogModal
        isOpen={auditLogsModalOpen}
        onClose={() => setAuditLogsModalOpen(false)}
        logs={auditLogs}
      />

      {/* Price Alert Creation & Config Modal */}
      {alertModalMed && (
        <SetPriceAlertModal
          isOpen={!!alertModalMed}
          medicine={alertModalMed}
          existingAlert={priceAlerts.find(a => a.medicineId === alertModalMed.id)}
          onClose={() => setAlertModalMed(null)}
          onSave={handleSaveAlert}
        />
      )}

      {/* Price Alerts Watchlist Drawer */}
      <PriceAlertsDrawer
        isOpen={priceAlertsDrawerOpen}
        alerts={priceAlerts}
        onClose={() => setPriceAlertsDrawerOpen(false)}
        onOpenSetAlert={(med) => setAlertModalMed(med)}
        onDeleteAlert={handleDeleteAlert}
        onTogglePauseAlert={handleTogglePauseAlert}
        onSimulateDrop={handleSimulatePriceDrop}
      />

      {/* Global Compact Status Footer */}
      <footer className="fixed bottom-0 left-0 right-0 h-8 bg-slate-900 border-t border-slate-800 text-slate-400 flex items-center justify-between px-4 z-40 text-[11px] font-code-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            CDSCO National Registry: Synchronized
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">
            Schema: {currentTenant.schema}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-slate-400">
            DISHA / HIPAA RLS: <strong className="text-emerald-400">Enforced</strong>
          </span>
          <span className="hidden sm:inline text-slate-500">
            v2.4.0-prod
          </span>
        </div>
      </footer>
    </div>
  );
}
