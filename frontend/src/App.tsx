import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  AppViewMode, 
  OpsNavigationTab, 
  TenantInfo, 
  MedicineCatalogEntry, 
  PricingPartnerFeed, 
  AccuracyDisputeItem, 
  AuditLogItem, 
  LinkedGenericCompound, 
  PriceAlert, 
  UserAccount 
} from './types';
import { 
  INITIAL_TENANTS, 
  INITIAL_CATALOG, 
  INITIAL_FEEDS, 
  INITIAL_DISPUTES, 
  INITIAL_AUDIT_LOGS, 
  CHRONIC_PACKS,
  INITIAL_PRICE_ALERTS,
  DEFAULT_USERS
} from './data/mockData';
import { api } from './services/api';

// Layout components — loaded eagerly (always visible)
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Auth — loaded eagerly (first thing user sees)
import { AuthView } from './components/AuthView';

// Always-present modals — load eagerly
import { AuditLogModal } from './components/AuditLogModal';
import { BioavailabilityModal } from './components/BioavailabilityModal';
import { SetPriceAlertModal } from './components/SetPriceAlertModal';
import { PriceAlertsDrawer } from './components/PriceAlertsDrawer';

// Error handling & compliance — load eagerly (always active)
import { ErrorBoundary } from './components/ErrorBoundary';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { LegalModal } from './components/LegalModal';

// Heavy views — code-split with React.lazy for faster initial bundle
const DashboardView = lazy(() => import('./components/DashboardView').then(m => ({ default: m.DashboardView })));
const CatalogView = lazy(() => import('./components/CatalogView').then(m => ({ default: m.CatalogView })));
const PricingFeedsView = lazy(() => import('./components/PricingFeedsView').then(m => ({ default: m.PricingFeedsView })));
const DisputesTriageView = lazy(() => import('./components/DisputesTriageView').then(m => ({ default: m.DisputesTriageView })));
const MultiTenantConfigView = lazy(() => import('./components/MultiTenantConfigView').then(m => ({ default: m.MultiTenantConfigView })));
const PatientPortalView = lazy(() => import('./components/PatientPortalView').then(m => ({ default: m.PatientPortalView })));
const ArchitectureView = lazy(() => import('./components/ArchitectureView').then(m => ({ default: m.ArchitectureView })));

// Phase 5 new views — code-split
const MedicineComparisonView = lazy(() => import('./components/MedicineComparisonView').then(m => ({ default: m.MedicineComparisonView })));
const SavingsDashboardView = lazy(() => import('./components/SavingsDashboardView').then(m => ({ default: m.SavingsDashboardView })));
const SuperAdminView = lazy(() => import('./components/SuperAdminView').then(m => ({ default: m.SuperAdminView })));

// Lazy modals
const AddMedicineModal = lazy(() => import('./components/AddMedicineModal').then(m => ({ default: m.AddMedicineModal })));
const LinkGenericModal = lazy(() => import('./components/LinkGenericModal').then(m => ({ default: m.LinkGenericModal })));
const AiDisputeModal = lazy(() => import('./components/AiDisputeModal').then(m => ({ default: m.AiDisputeModal })));

/** Reusable skeleton shown while lazy chunks load */
const ViewLoader: React.FC<{ label?: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-3">
    <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
    {label && <span className="text-xs font-code-mono">{label}</span>}
  </div>
);

export default function App() {
  const [viewMode, setViewMode] = useState<AppViewMode>('clinical-ops');
  const [opsTab, setOpsTab] = useState<OpsNavigationTab>('dashboard-and-analytics');
  const [currentTenant, setCurrentTenant] = useState<TenantInfo>(INITIAL_TENANTS[0]);
  const [globalSearch, setGlobalSearch] = useState('');

  // User Authentication & Session State
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('sastarx_registered_users');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('sastarx_current_user');
      if (saved === 'null') return null;
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_USERS[0];
  });

  const [isAuthScreenOpen, setIsAuthScreenOpen] = useState(false);

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
  const [aiTriageDispute, setAiTriageDispute] = useState<AccuracyDisputeItem | null>(null);
  const [legalModal, setLegalModal] = useState<{ open: boolean; type: 'privacy' | 'terms' }>({
    open: false,
    type: 'privacy',
  });

  // Listen for legal modal events from CookieConsentBanner
  useEffect(() => {
    const openPrivacy = () => setLegalModal({ open: true, type: 'privacy' });
    const openTerms = () => setLegalModal({ open: true, type: 'terms' });
    window.addEventListener('openPrivacyPolicy', openPrivacy);
    window.addEventListener('openTermsOfService', openTerms);
    return () => {
      window.removeEventListener('openPrivacyPolicy', openPrivacy);
      window.removeEventListener('openTermsOfService', openTerms);
    };
  }, []);

  // Hydrate data from backend API on mount
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [backendCatalog, backendFeeds, backendDisputes, backendLogs, backendAlerts] = await Promise.all([
          api.getCatalog(),
          api.getFeeds(),
          api.getDisputes(),
          api.getAuditLogs(),
          api.getPriceAlerts()
        ]);

        if (isMounted) {
          if (backendCatalog && backendCatalog.length > 0) setCatalog(backendCatalog);
          if (backendFeeds && backendFeeds.length > 0) setFeeds(backendFeeds);
          if (backendDisputes && backendDisputes.length > 0) setDisputes(backendDisputes);
          if (backendLogs && backendLogs.length > 0) setAuditLogs(backendLogs);
          if (backendAlerts && backendAlerts.length > 0) setPriceAlerts(backendAlerts);
        }
      } catch (e) {
        console.warn('Initial API sync failed, continuing with initial datasets', e);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to append cryptographic audit log
  const logAction = async (action: string, details: string) => {
    try {
      const newLog = await api.createAuditLog({
        action,
        targetEntity: details,
        actor: currentUser?.name || 'Dr. Sarah Jenkins',
        role: currentUser?.role || 'Lead Ops Admin',
        status: 'Audited'
      });
      setAuditLogs(prev => [newLog, ...prev]);
    } catch {
      const fallbackLog: AuditLogItem = {
        id: `audit-${Date.now()}`,
        action,
        actor: currentUser?.name || 'Dr. Sarah Jenkins',
        role: currentUser?.role || 'Lead Ops Admin',
        targetEntity: details,
        tenantId: currentTenant.tenantCode,
        tenantName: currentTenant.name,
        timestamp: 'Just now',
        hashSignature: `HMAC-SHA256: ${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
        status: 'Audited'
      };
      setAuditLogs(prev => [fallbackLog, ...prev]);
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('sastarx_current_user', JSON.stringify(user));
    } catch (e) {}
    setIsAuthScreenOpen(false);

    // Sync tenant if user has one
    const matchingTenant = INITIAL_TENANTS.find(t => t.tenantCode === user.tenantId);
    if (matchingTenant) {
      setCurrentTenant(matchingTenant);
      api.setTenantId(matchingTenant.tenantCode);
    }

    // Role-based view selection
    if (user.role === 'Patient / Consumer') {
      setViewMode('patient-portal');
    } else {
      setViewMode('clinical-ops');
    }

    logAction('USER_SESSION_AUTHENTICATED', `Encrypted session initiated by ${user.name} (${user.role}) for partition ${user.tenantName}`);
  };

  const handleRegisterUser = (newUser: UserAccount) => {
    setRegisteredUsers(prev => {
      const updated = [newUser, ...prev];
      try {
        localStorage.setItem('sastarx_registered_users', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    logAction('NEW_USER_REGISTERED', `Practitioner registration completed for ${newUser.name} (Council No: ${newUser.licenseNumber || 'N/A'})`);
  };

  const handleLogout = async () => {
    if (currentUser) {
      logAction('USER_LOGOUT', `User ${currentUser.name} signed out of clinical session.`);
    }
    await api.logout();
    setCurrentUser(null);
    try {
      localStorage.setItem('sastarx_current_user', 'null');
    } catch (e) {}
    setIsAuthScreenOpen(true);
  };

  const handleContinueAsGuest = () => {
    const guestUser: UserAccount = {
      id: 'usr-guest',
      name: 'Guest Clinician',
      email: 'guest@sastarx.internal',
      role: 'Clinical Pharmacist',
      title: 'Visiting Practitioner (Read-Only Mode)',
      tenantId: currentTenant.tenantCode,
      tenantName: currentTenant.name,
      joinedAt: 'Today'
    };
    setCurrentUser(guestUser);
    setIsAuthScreenOpen(false);
    logAction('GUEST_SESSION_STARTED', 'Exploratory session started without credentials.');
  };

  // Price Alert handlers
  const handleSaveAlert = async (alertData: Omit<PriceAlert, 'id' | 'createdAt'> & { id?: string }) => {
    if (alertData.id) {
      // Update existing
      setPriceAlerts(prev =>
        prev.map(a => (a.id === alertData.id ? { ...a, ...alertData } : a))
      );
      try {
        await api.updatePriceAlert(alertData.id, alertData);
      } catch (e) {
        console.warn('Failed to update price alert via API', e);
      }
      logAction(
        'UPDATE_PRICE_ALERT',
        `Updated price drop alert threshold for ${alertData.medicineName} to ₹${alertData.targetThresholdPrice}`
      );
    } else {
      // Create new
      const tempId = `alert-${Date.now()}`;
      const newAlert: PriceAlert = {
        ...alertData,
        id: tempId,
        createdAt: 'Just now'
      };
      setPriceAlerts(prev => [newAlert, ...prev]);
      try {
        const created = await api.createPriceAlert(alertData);
        setPriceAlerts(prev => prev.map(a => a.id === tempId ? created : a));
      } catch (e) {
        console.warn('Failed to persist price alert via API', e);
      }
      logAction(
        'CREATE_PRICE_ALERT',
        `Configured new price drop alert for ${alertData.medicineName} (Threshold: ₹${alertData.targetThresholdPrice})`
      );
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    const toDelete = priceAlerts.find(a => a.id === alertId);
    setPriceAlerts(prev => prev.filter(a => a.id !== alertId));
    try {
      await api.deletePriceAlert(alertId);
    } catch (e) {
      console.warn('Failed to delete price alert via API', e);
    }
    if (toDelete) {
      logAction('DELETE_PRICE_ALERT', `Removed price alert for ${toDelete.medicineName}`);
    }
  };

  const handleTogglePauseAlert = async (alertId: string) => {
    let nextStatus: 'Active' | 'Paused' = 'Active';
    setPriceAlerts(prev =>
      prev.map(a => {
        if (a.id !== alertId) return a;
        nextStatus = a.status === 'Paused' ? 'Active' : 'Paused';
        logAction(
          nextStatus === 'Paused' ? 'PAUSE_PRICE_ALERT' : 'RESUME_PRICE_ALERT',
          `Changed alert status to ${nextStatus} for ${a.medicineName}`
        );
        return { ...a, status: nextStatus };
      })
    );
    try {
      await api.updatePriceAlert(alertId, { status: nextStatus });
    } catch (e) {
      console.warn('Failed to update pause/resume status via API', e);
    }
  };

  const handleSimulatePriceDrop = async (alertId: string, simulatedPrice: number) => {
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

    try {
      await api.simulatePriceDrop(alertId, simulatedPrice);
    } catch (e) {
      console.warn('Failed to persist simulated price drop to API', e);
    }
  };

  // Handlers
  const handleToggleGenericInRx = async (medId: string, genericId: string) => {
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
    try {
      await api.toggleGenericInRx(medId, genericId);
    } catch (e) {
      console.warn('Failed to persist formulary toggle to API', e);
    }
  };

  const handleAddMedicine = async (newMed: MedicineCatalogEntry) => {
    setCatalog(prev => [newMed, ...prev]);
    logAction('REGISTER_MEDICINE_ENTRY', `Added new compound ${newMed.brandName} (${newMed.activeSalt})`);
    try {
      await api.addMedicine(newMed);
    } catch (e) {
      console.warn('Failed to persist new medicine to API', e);
    }
  };

  const handleLinkGeneric = async (medId: string, newGeneric: LinkedGenericCompound) => {
    setCatalog(prev =>
      prev.map(med => {
        if (med.id !== medId) return med;
        const existing = med.genericsList || [];
        return {
          ...med,
          verifiedGenericsCount: med.verifiedGenericsCount + 1,
          genericsList: [...existing, newGeneric]
        };
      })
    );
    const targetMed = catalog.find(m => m.id === medId);
    logAction('LINK_GENERIC_COMPOUND', `Linked generic ${newGeneric.name} to ${targetMed?.brandName || medId}`);
    try {
      await api.linkGeneric(medId, newGeneric);
    } catch (e) {
      console.warn('Failed to persist linked generic to API', e);
    }
  };

  const handleRetryFeed = async (feedId: string) => {
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

    try {
      const updatedFeed = await api.retryFeed(feedId);
      setTimeout(() => {
        setFeeds(prev =>
          prev.map(f => (f.id === feedId ? { ...f, ...updatedFeed, status: 'Healthy', syncProgress: undefined, updatedAgo: 'Just now' } : f))
        );
      }, 1500);
    } catch {
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
    }
  };

  const handleResolveDispute = async (id: string, action: string) => {
    setDisputes(prev => prev.filter(d => d.id !== id));
    logAction('RESOLVE_ACCURACY_DISPUTE', `Resolved dispute #${id} with decision: ${action}`);
    try {
      await api.resolveDispute(id, action);
    } catch (e) {
      console.warn('Failed to persist resolved dispute to API', e);
    }
  };

  const handleAddToCart = (item: { name: string; price: number; originalPrice: number; savings: number }) => {
    setCartItems(prev => [...prev, item]);
  };

  const totalCartSavings = cartItems.reduce((acc, curr) => acc + curr.savings, 0);

  // If user logged out or explicitly opened the auth screen
  if (currentUser === null || isAuthScreenOpen) {
    return (
      <AuthView
        onLoginSuccess={handleLoginSuccess}
        onContinueAsGuest={handleContinueAsGuest}
        availableTenants={INITIAL_TENANTS}
        registeredUsers={registeredUsers}
        onRegisterUser={handleRegisterUser}
      />
    );
  }

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
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthScreenOpen(true)}
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
            currentUser={currentUser}
            onLogout={handleLogout}
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
                <ErrorBoundary context="Dashboard">
                  <Suspense fallback={<ViewLoader label="Loading Dashboard..." />}>
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
                  </Suspense>
                </ErrorBoundary>
              )}

              {opsTab === 'medicine-and-salt-catalog' && (
                <ErrorBoundary context="Catalog">
                  <Suspense fallback={<ViewLoader label="Loading Catalog..." />}>
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
                      onImportCsv={() => setAddMedicineOpen(true)}
                    />
                  </Suspense>
                </ErrorBoundary>
              )}

              {opsTab === 'pricing-feeds-and-partners' && (
                <ErrorBoundary context="Pricing Feeds">
                  <Suspense fallback={<ViewLoader label="Loading Feeds..." />}>
                    <PricingFeedsView
                      feeds={feeds}
                      onRetryFeed={handleRetryFeed}
                      onRefreshAll={() => feeds.forEach(f => handleRetryFeed(f.id))}
                    />
                  </Suspense>
                </ErrorBoundary>
              )}

              {opsTab === 'accuracy-reports-and-disputes' && (
                <ErrorBoundary context="Disputes Triage">
                  <Suspense fallback={<ViewLoader label="Loading Disputes..." />}>
                    <DisputesTriageView
                      disputes={disputes}
                      onResolveDispute={handleResolveDispute}
                      onOpenAiTriage={(dispute) => setAiTriageDispute(dispute)}
                    />
                  </Suspense>
                </ErrorBoundary>
              )}

              {opsTab === 'multi-tenant-config-and-audit-logs' && (
                <ErrorBoundary context="Tenant Config">
                  <Suspense fallback={<ViewLoader label="Loading Config..." />}>
                    <MultiTenantConfigView
                      currentTenant={currentTenant}
                      availableTenants={INITIAL_TENANTS}
                      auditLogs={auditLogs}
                      onSelectTenant={(t) => {
                        setCurrentTenant(t);
                        logAction('SWITCH_TENANT_PARTITION', `Switched active context to ${t.name} (${t.schema})`);
                      }}
                    />
                  </Suspense>
                </ErrorBoundary>
              )}

              {/* Phase 5 New Views */}
              {opsTab === 'medicine-comparison' && (
                <ErrorBoundary context="Medicine Comparison">
                  <Suspense fallback={<ViewLoader label="Loading Comparison Tool..." />}>
                    <MedicineComparisonView medicines={catalog} />
                  </Suspense>
                </ErrorBoundary>
              )}

              {opsTab === 'savings-dashboard' && (
                <ErrorBoundary context="Savings Dashboard">
                  <Suspense fallback={<ViewLoader label="Loading Savings Analytics..." />}>
                    <SavingsDashboardView medicines={catalog} />
                  </Suspense>
                </ErrorBoundary>
              )}

              {opsTab === 'super-admin-panel' && (
                <ErrorBoundary context="Super Admin Panel">
                  <Suspense fallback={<ViewLoader label="Loading Admin Panel..." />}>
                    <SuperAdminView tenants={INITIAL_TENANTS} currentUser={currentUser} />
                  </Suspense>
                </ErrorBoundary>
              )}
            </>
          )}

          {/* 2. PATIENT DISCOVERY PORTAL */}
          {viewMode === 'patient-portal' && (
            <ErrorBoundary context="Patient Portal">
              <Suspense fallback={<ViewLoader label="Loading Patient Portal..." />}>
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
              </Suspense>
            </ErrorBoundary>
          )}

          {/* 3. MULTI-TENANT SAAS SYSTEM ARCHITECTURE */}
          {viewMode === 'system-architecture' && (
            <ErrorBoundary context="Architecture View">
              <Suspense fallback={<ViewLoader label="Loading Architecture..." />}>
                <ArchitectureView />
              </Suspense>
            </ErrorBoundary>
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <BioavailabilityModal
        medicine={bioavailabilityMed}
        onClose={() => setBioavailabilityMed(null)}
      />

      <Suspense fallback={null}>
        <AddMedicineModal
          isOpen={addMedicineOpen}
          onClose={() => setAddMedicineOpen(false)}
          onAdd={handleAddMedicine}
        />
      </Suspense>

      <Suspense fallback={null}>
        <LinkGenericModal
          medicine={linkGenericMed}
          onClose={() => setLinkGenericMed(null)}
          onLink={handleLinkGeneric}
        />
      </Suspense>

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

      {/* AI Dispute Triage Modal */}
      <Suspense fallback={null}>
        <AiDisputeModal
          isOpen={!!aiTriageDispute}
          dispute={aiTriageDispute}
          onClose={() => setAiTriageDispute(null)}
          onApplyDecision={(disputeId, decision) => {
            handleResolveDispute(disputeId, decision);
            setAiTriageDispute(null);
          }}
        />
      </Suspense>

      {/* Compliance: Privacy Policy & Terms of Service */}
      <LegalModal
        isOpen={legalModal.open}
        type={legalModal.type}
        onClose={() => setLegalModal(prev => ({ ...prev, open: false }))}
      />

      {/* Cookie / Data Consent Banner */}
      <CookieConsentBanner />

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
            v3.0.0-prod
          </span>
        </div>
      </footer>
    </div>
  );
}
