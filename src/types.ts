export type AppViewMode = 'clinical-ops' | 'patient-portal' | 'system-architecture';

export type OpsNavigationTab = 
  | 'dashboard-and-analytics'
  | 'medicine-and-salt-catalog'
  | 'pricing-feeds-and-partners'
  | 'accuracy-reports-and-disputes'
  | 'multi-tenant-config-and-audit-logs';

export type PatientNavTab =
  | 'search-and-compare'
  | 'saved-refills'
  | 'price-alerts'
  | 'safety-and-help';

export interface GenericBioequivalent {
  id: string;
  name: string;
  manufacturer: string;
  compositionMatch: string;
  genericStripMrp: number;
  patientSavingsPercent: number;
  patientSavingsAmount: number;
  verifiedMatch: boolean;
  includedInPatientRx: boolean;
  formularyStatus: 'Tier 1 Primary' | 'Preferred' | 'Standard' | 'Restricted';
  similarityFactorF2?: number;
}

export type LinkedGenericCompound = GenericBioequivalent;

export interface PriceAlert {
  id: string;
  medicineId: string;
  medicineName: string;
  activeSalt: string;
  currentLowestPrice: number;
  brandedMrp: number;
  targetThresholdPrice: number;
  channel: 'In-App' | 'SMS & WhatsApp' | 'Email Digest';
  recipientTarget: string;
  status: 'Active' | 'Triggered' | 'Paused';
  createdAt: string;
  triggeredAt?: string;
  triggeredPrice?: number;
  triggeredBrand?: string;
  notes?: string;
}

export interface MedicineCatalogEntry {
  id: string;
  brandName: string;
  manufacturer: string;
  formulationType: string; // e.g. "Tab 10s", "Strip 15s"
  dosageForm: string; // "Oral Tablet", "Oral Gastro-resistant", etc.
  activeSalt: string;
  saltStrength: string;
  compositionDetails: string;
  atcCode: string;
  innCode?: string;
  therapeuticCategory: string;
  verifiedGenericsCount: number;
  brandedMrp: number;
  lowestGenericPrice: number;
  lowestGenericBrand: string;
  savingsPercent: number;
  savingsAmount: number;
  savingsIntervalText: string;
  regulatoryStatus: string; // e.g. "CDSCO / US-FDA", "CDSCO / WHO-GMP"
  bioequivalenceConfidence: number; // e.g. 100, 98.6
  verifierName: string;
  verifiedTimeAgo: string;
  pharmacopeiaStandard?: string;
  dissolutionNote?: string;
  genericsList?: GenericBioequivalent[];
  isExpanded?: boolean;
  selected?: boolean;
}

export interface PricingPartnerFeed {
  id: string;
  name: string;
  type: 'Realtime SKU API' | 'Catalog Pipeline' | 'In-House API' | 'Govt Feed';
  status: 'Healthy' | 'Syncing' | 'Stale' | 'Degraded';
  skusParsed: number;
  updatedAgo: string;
  avgResponseMs: number;
  errorRatePercent: number;
  syncProgress?: number;
  slaBreachedHours?: number;
  notes?: string;
  endpointUrl?: string;
}

export interface AccuracyDisputeItem {
  id: string;
  title: string;
  feedSource: string;
  feedCode: string;
  reportedTime: string;
  slaRemaining: string;
  severity: 'Critical' | 'Warning' | 'Low';
  medicineAffected: string;
  activeComposition: string;
  discrepancyDescription: string;
  clinicalReportsCount: number;
  status: 'Open' | 'Under Review' | 'Resolved' | 'Dismissed';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  targetEntity: string;
  tenantId: string;
  tenantName: string;
  hashSignature: string;
  status: 'Success' | 'Flagged' | 'Audited';
}

export interface TenantInfo {
  id: string;
  name: string;
  shortCode: string;
  tenantCode: string;
  schema: string;
  region: string;
  environment: 'Production' | 'Staging' | 'DR Sandbox';
  status: 'Active RLS' | 'Standby';
}

export interface ChronicPack {
  id: string;
  title: string;
  condition: string;
  description: string;
  medicines: string[];
  savingsPercent: number;
  estimatedMonthlyPrice: number;
  originalPrice: number;
  iconName: string;
  badgeColor: string;
}

export interface OCRDetectedMedicine {
  id: string;
  extractedName: string;
  detectedSalt: string;
  detectedStrength: string;
  dosageInstructions: string;
  confidence: number;
  originalPrice: number;
  suggestedGeneric: string;
  genericManufacturer: string;
  genericPrice: number;
  savings: number;
}

export interface PriceTrendDataPoint {
  date: string;
  shortDate: string;
  timestamp: number;
  brandMrp: number;
  lowestGenericPrice: number;
  averageGenericPrice: number;
  janAushadhiGovPrice: number;
  volatilityIndex: number; // percentage volatility / spread
  marketEvent?: string;
  eventSeverity?: 'info' | 'warning' | 'success';
}

export interface MedicineVolatilitySummary {
  medicineId: string;
  medicineName: string;
  activeSalt: string;
  category: string;
  brandMrp: number;
  currentGeneric: number;
  volatilityScore: number; // standard deviation / variance %
  volatilityLevel: 'Low (Stable)' | 'Moderate' | 'High (Fluctuating)';
  priceRangeMin: number;
  priceRangeMax: number;
  priceDeltaPercent: number;
  trendDirection: 'down' | 'up' | 'stable';
  primaryDriver: string;
}

export type UserRole = 
  | 'Lead Ops Admin'
  | 'Clinical Pharmacist'
  | 'Prescribing Physician'
  | 'Formulary Director'
  | 'Patient / Consumer';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatarUrl?: string;
  licenseNumber?: string;
  tenantId: string;
  tenantName: string;
  department?: string;
  phone?: string;
  joinedAt: string;
  password?: string; // used for demo auth verification
}
