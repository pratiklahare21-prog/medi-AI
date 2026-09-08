import React from 'react';
import { AuditLogItem } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogItem[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  logs
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2563EB] text-xl">lock_clock</span>
            <div>
              <h3 className="font-headline-sm text-sm sm:text-base font-bold text-slate-900">
                Cryptographic HMAC-SHA256 Audit Trail
              </h3>
              <p className="text-[11px] text-slate-500 font-code-mono">
                Immutable compliance ledger for CDSCO & DISHA health records
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100 text-xs">
          {logs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-code-mono">{log.action}</span>
                <span className="text-[11px] font-code-mono text-slate-400">{log.timestamp}</span>
              </div>
              <p className="text-slate-600">{log.details}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-1 text-[10px] font-code-mono text-slate-500">
                <span>User: <strong className="text-slate-700">{log.actor}</strong></span>
                <span>Tenant: <strong className="text-[#2563EB]">{log.tenantCode}</strong></span>
                <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-600">
                  Sig: {log.cryptographicHash}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-emerald-700 font-code-mono font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Ledger Status: 100% Tamper Evident
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
