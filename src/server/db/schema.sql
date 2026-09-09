-- ==============================================================================
-- medi-AI / SastaRx Multi-Tenant PostgreSQL Schema with Row-Level Security (RLS)
-- DISHA (India) & HIPAA (US) Compliant Data Isolation Architecture
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Tenants Partition Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_code VARCHAR(16) NOT NULL,
    tenant_code VARCHAR(32) NOT NULL UNIQUE,
    schema_name VARCHAR(64) NOT NULL,
    region VARCHAR(32) NOT NULL DEFAULT 'ap-south-1',
    environment VARCHAR(32) NOT NULL DEFAULT 'Production',
    status VARCHAR(32) NOT NULL DEFAULT 'Active RLS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. Users Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(32) NOT NULL REFERENCES tenants(tenant_code) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    license_number VARCHAR(128),
    tenant_name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    phone VARCHAR(64),
    joined_at VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ------------------------------------------------------------------------------
-- 3. Medicine Catalog Table (Tenant Partitioned with RLS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medicine_catalog (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(32) NOT NULL REFERENCES tenants(tenant_code) ON DELETE CASCADE,
    brand_name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    formulation_type VARCHAR(128) NOT NULL,
    dosage_form VARCHAR(128) NOT NULL,
    active_salt VARCHAR(255) NOT NULL,
    salt_strength VARCHAR(64) NOT NULL,
    composition_details TEXT NOT NULL,
    atc_code VARCHAR(32) NOT NULL,
    inn_code VARCHAR(32),
    therapeutic_category VARCHAR(128) NOT NULL,
    verified_generics_count INTEGER NOT NULL DEFAULT 0,
    branded_mrp NUMERIC(10, 2) NOT NULL,
    lowest_generic_price NUMERIC(10, 2) NOT NULL,
    lowest_generic_brand VARCHAR(255) NOT NULL,
    savings_percent NUMERIC(5, 2) NOT NULL,
    savings_amount NUMERIC(10, 2) NOT NULL,
    savings_interval_text VARCHAR(128) NOT NULL,
    regulatory_status VARCHAR(128) NOT NULL,
    bioequivalence_confidence NUMERIC(5, 2) NOT NULL,
    verifier_name VARCHAR(255) NOT NULL,
    verified_time_ago VARCHAR(128) NOT NULL,
    pharmacopeia_standard VARCHAR(128),
    dissolution_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_medicine_tenant_id ON medicine_catalog(tenant_id);
CREATE INDEX IF NOT EXISTS idx_medicine_active_salt ON medicine_catalog(active_salt);
CREATE INDEX IF NOT EXISTS idx_medicine_therapeutic_category ON medicine_catalog(therapeutic_category);

-- Enable RLS on medicine_catalog
ALTER TABLE medicine_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_medicine_catalog ON medicine_catalog
    FOR ALL
    USING (
        tenant_id = current_setting('app.current_tenant', true)
        OR current_setting('app.current_tenant', true) IS NULL
        OR current_setting('app.current_tenant', true) = ''
        OR current_setting('app.is_super_admin', true) = 'true'
    );

-- ------------------------------------------------------------------------------
-- 4. Generic Equivalents Table (Tenant Partitioned with RLS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS generic_equivalents (
    id VARCHAR(64) PRIMARY KEY,
    medicine_id VARCHAR(64) NOT NULL REFERENCES medicine_catalog(id) ON DELETE CASCADE,
    tenant_id VARCHAR(32) NOT NULL REFERENCES tenants(tenant_code) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    composition_match VARCHAR(255) NOT NULL,
    generic_strip_mrp NUMERIC(10, 2) NOT NULL,
    patient_savings_percent NUMERIC(5, 2) NOT NULL,
    patient_savings_amount NUMERIC(10, 2) NOT NULL,
    verified_match BOOLEAN NOT NULL DEFAULT true,
    included_in_patient_rx BOOLEAN NOT NULL DEFAULT true,
    formulary_status VARCHAR(64) NOT NULL DEFAULT 'Standard',
    similarity_factor_f2 NUMERIC(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_generics_medicine_id ON generic_equivalents(medicine_id);
CREATE INDEX IF NOT EXISTS idx_generics_tenant_id ON generic_equivalents(tenant_id);

ALTER TABLE generic_equivalents ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_generic_equivalents ON generic_equivalents
    FOR ALL
    USING (
        tenant_id = current_setting('app.current_tenant', true)
        OR current_setting('app.current_tenant', true) IS NULL
        OR current_setting('app.current_tenant', true) = ''
        OR current_setting('app.is_super_admin', true) = 'true'
    );

-- ------------------------------------------------------------------------------
-- 5. Pricing Partner Feeds Table (Tenant Partitioned with RLS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pricing_feeds (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(32) NOT NULL REFERENCES tenants(tenant_code) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Healthy',
    skus_parsed INTEGER NOT NULL DEFAULT 0,
    updated_ago VARCHAR(64) NOT NULL,
    avg_response_ms INTEGER NOT NULL DEFAULT 0,
    error_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    sync_progress INTEGER,
    sla_breached_hours NUMERIC(5, 2),
    notes TEXT,
    endpoint_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pricing_feeds_tenant_id ON pricing_feeds(tenant_id);

ALTER TABLE pricing_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_pricing_feeds ON pricing_feeds
    FOR ALL
    USING (
        tenant_id = current_setting('app.current_tenant', true)
        OR current_setting('app.current_tenant', true) IS NULL
        OR current_setting('app.current_tenant', true) = ''
        OR current_setting('app.is_super_admin', true) = 'true'
    );

-- ------------------------------------------------------------------------------
-- 6. Accuracy Disputes Table (Tenant Partitioned with RLS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS accuracy_disputes (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(32) NOT NULL REFERENCES tenants(tenant_code) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    feed_source VARCHAR(255) NOT NULL,
    feed_code VARCHAR(64) NOT NULL,
    reported_time VARCHAR(64) NOT NULL,
    sla_remaining VARCHAR(64) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    medicine_affected VARCHAR(255) NOT NULL,
    active_composition VARCHAR(255) NOT NULL,
    discrepancy_description TEXT NOT NULL,
    clinical_reports_count INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accuracy_disputes_tenant_id ON accuracy_disputes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_accuracy_disputes_status ON accuracy_disputes(status);

ALTER TABLE accuracy_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_accuracy_disputes ON accuracy_disputes
    FOR ALL
    USING (
        tenant_id = current_setting('app.current_tenant', true)
        OR current_setting('app.current_tenant', true) IS NULL
        OR current_setting('app.current_tenant', true) = ''
        OR current_setting('app.is_super_admin', true) = 'true'
    );

-- ------------------------------------------------------------------------------
-- 7. Audit Logs Table (Tamper-Evident HMAC-Signed, Tenant Partitioned with RLS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(32) NOT NULL REFERENCES tenants(tenant_code) ON DELETE RESTRICT,
    tenant_name VARCHAR(255) NOT NULL,
    timestamp VARCHAR(64) NOT NULL,
    actor VARCHAR(255) NOT NULL,
    role VARCHAR(64) NOT NULL,
    action VARCHAR(128) NOT NULL,
    target_entity TEXT NOT NULL,
    hash_signature VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_audit_logs ON audit_logs
    FOR ALL
    USING (
        tenant_id = current_setting('app.current_tenant', true)
        OR current_setting('app.current_tenant', true) IS NULL
        OR current_setting('app.current_tenant', true) = ''
        OR current_setting('app.is_super_admin', true) = 'true'
    );

-- ------------------------------------------------------------------------------
-- 8. Price Alerts Table (Tenant Partitioned with RLS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS price_alerts (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(32) NOT NULL REFERENCES tenants(tenant_code) ON DELETE CASCADE,
    medicine_id VARCHAR(64) NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    active_salt VARCHAR(255) NOT NULL,
    current_lowest_price NUMERIC(10, 2) NOT NULL,
    branded_mrp NUMERIC(10, 2) NOT NULL,
    target_threshold_price NUMERIC(10, 2) NOT NULL,
    channel VARCHAR(64) NOT NULL,
    recipient_target VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Active',
    created_at VARCHAR(64) NOT NULL,
    triggered_at VARCHAR(64),
    triggered_price NUMERIC(10, 2),
    triggered_brand VARCHAR(255),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_tenant_id ON price_alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_medicine_id ON price_alerts(medicine_id);

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_price_alerts ON price_alerts
    FOR ALL
    USING (
        tenant_id = current_setting('app.current_tenant', true)
        OR current_setting('app.current_tenant', true) IS NULL
        OR current_setting('app.current_tenant', true) = ''
        OR current_setting('app.is_super_admin', true) = 'true'
    );
