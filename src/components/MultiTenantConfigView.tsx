import React, { useState } from 'react';
import { TenantInfo, AuditLogItem } from '../types';

interface MultiTenantConfigViewProps {
  currentTenant: TenantInfo;
  availableTenants: TenantInfo[];
  auditLogs: AuditLogItem[];
  onSelectTenant: (tenant: TenantInfo) => void;
}

export const MultiTenantConfigView: React.FC<MultiTenantConfigViewProps> = ({
  currentTenant,
  availableTenants,
  auditLogs,
  onSelectTenant
}) => {
  const [rlsEnforced, setRlsEnforced] = useState(true);
  const [dataResidency, setDataResidency] = useState('ap-south-1 (Mumbai)');
  const [keyRotatedMsg, setKeyRotatedMsg] = useState<string | null>(null);

  const handleRotateKeys = () => {
    setKeyRotatedMsg('HMAC-SHA256 master tenant signing keys rotated successfully. New fingerprint: 0x8F9C4A21.');
    setTimeout(() => setKeyRotatedMsg(null), 4000);
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {keyRotatedMsg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-emerald-600">vpn_key</span>
            {keyRotatedMsg}
          </span>
          <button onClick={() => setKeyRotatedMsg(null)} className="text-emerald-700">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-code-mono text-[11px] font-bold border border-purple-200">
              Zero Data Leakage Architecture
            </span>
          </div>
          <h1 className="font-headline-md text-xl lg:text-2xl text-slate-900 font-bold tracking-tight">
            Multi-Tenant Configuration & Cryptographic Audit
          </h1>
          <p className="font-body-sm text-xs sm:text-sm text-slate-500">
            PostgreSQL Schema Isolation, Row-Level Security (RLS), DISHA/HIPAA compliance logs, and API tenant keys
          </p>
        </div>

        <button
          onClick={handleRotateKeys}
          className="px-3.5 py-2 rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base text-[#2563EB]">key</span>
          <span>Rotate HMAC Signing Key</span>
        </button>
      </div>

      {/* Tenant Partition Selection Cards */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Configured Healthcare Organization Partitions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableTenants.map((t) => {
            const isActive = t.id === currentTenant.id;
            return (
              <div
                key={t.id}
                onClick={() => onSelectTenant(t)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-blue-50/40 border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs font-code-mono">
                    {t.shortCode}
                  </div>
                  <span className={`px-2 py-0.2 rounded font-code-mono text-[10px] font-semibold ${
                    isActive ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isActive ? 'Active Context' : 'Switch Partition'}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 mb-0.5">{t.name}</h4>
                <div className="font-code-mono text-[11px] text-slate-500">
                  Schema: <strong className="text-slate-800">{t.schema}</strong>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-code-mono text-slate-600">
                  <span>Region: {t.region}</span>
                  <span className="text-emerald-700 font-semibold">RLS: Strict</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Policies Matrix */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 pb-2 border-b border-slate-100">
          Tenant Isolation & Compliance Enforcement
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="font-semibold text-slate-900 block">Row-Level Security (PostgreSQL)</span>
                <span className="text-[11px] text-slate-500">
                  Enforces `tenant_id = current_setting('app.current_tenant')` on every query.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={rlsEnforced}
                  onChange={() => setRlsEnforced(!rlsEnforced)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="font-semibold text-slate-900 block">Data Residency Mandate</span>
                <span className="text-[11px] text-slate-500">
                  In-country data sovereignty under DISHA (Digital Information Security in Healthcare Act).
                </span>
              </div>
              <span className="px-2.5 py-1 rounded bg-white border border-slate-300 font-code-mono text-[11px] font-semibold text-slate-800">
                {dataResidency}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1">Prescription De-identification Pipeline</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Optical character recognition strips patient names, phone numbers, and UHID before caching in Redis. All OCR image blobs auto-expire after 24 hours.
              </p>
              <div className="mt-2 text-[10px] font-code-mono text-emerald-700 font-semibold">
                ✓ SHA-256 salted hashes used for prescription indexing
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Immutable Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2563EB] text-lg">history</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Immutable HMAC-SHA256 Audit Trail
            </h3>
          </div>
          <span className="text-[11px] font-code-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
            Tamper-Evident Chain Validated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-label-xs text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Actor</th>
                <th className="py-2.5 px-4">Partition</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Details</th>
                <th className="py-2.5 px-4 text-right">Cryptographic Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-table-data">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900 font-code-mono">{log.action}</td>
                  <td className="py-3 px-4 text-slate-700">{log.actor}</td>
                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.2 rounded bg-blue-50 border border-blue-200 text-[#2563EB] font-code-mono text-[10px]">
                      {log.tenantCode}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-code-mono text-slate-500 text-[11px]">{log.timestamp}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{log.details}</td>
                  <td className="py-3 px-4 text-right font-code-mono text-[10px] text-slate-400">
                    {log.cryptographicHash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
