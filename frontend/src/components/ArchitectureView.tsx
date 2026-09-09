import React, { useState } from 'react';

export const ArchitectureView: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string>('ai-core');

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Blueprint Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-5 border-b border-slate-200 mb-6 bg-white p-5 rounded-lg border shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] font-code-mono text-[11px] font-bold border border-blue-200 uppercase">
              Production Architecture Blueprint
            </span>
          </div>
          <h1 className="font-headline-md text-xl lg:text-2xl text-slate-900 font-bold tracking-tight">
            medi AI – System Architecture (Multi-Tenant SaaS Platform)
          </h1>
          <p className="font-body-sm text-xs sm:text-sm text-slate-600">
            AI-powered generic medicine recommendation with reliable cost and strict tenant-isolated clinical governance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-code-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">security</span> Secure
          </span>
          <span className="px-2.5 py-1 rounded bg-blue-50 text-[#2563EB] border border-blue-200 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">trending_up</span> Scalable
          </span>
          <span className="px-2.5 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">domain</span> Multi-Tenant
          </span>
          <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">visibility</span> Observable
          </span>
        </div>
      </div>

      {/* Main Diagram Area with interactive highlights */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Architecture Canvas (Spans 3 cols on xl) */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          {/* Top: Clients / Users Tier */}
          <div className="p-4 rounded-lg bg-blue-50/40 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#2563EB]">group</span>
                Clients / Users
              </span>
              <span className="text-[10px] font-code-mono text-blue-700">6 Persona Portals + Partner APIs</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 text-center text-xs">
              <div 
                onClick={() => setActiveNode('patient-client')}
                className={`p-2 rounded border transition-all cursor-pointer ${
                  activeNode === 'patient-client' ? 'bg-white border-[#2563EB] shadow-xs' : 'bg-white/80 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="w-7 h-7 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-[#2563EB] mb-1">
                  <span className="material-symbols-outlined text-base">person</span>
                </div>
                <div className="font-bold text-slate-900 text-[11px]">Patient</div>
                <div className="text-[10px] text-slate-500">(Web / Mobile)</div>
              </div>

              <div 
                onClick={() => setActiveNode('doctor-client')}
                className={`p-2 rounded border transition-all cursor-pointer ${
                  activeNode === 'doctor-client' ? 'bg-white border-[#2563EB] shadow-xs' : 'bg-white/80 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="w-7 h-7 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-1">
                  <span className="material-symbols-outlined text-base">stethoscope</span>
                </div>
                <div className="font-bold text-slate-900 text-[11px]">Doctor</div>
                <div className="text-[10px] text-slate-500">(Web / Mobile)</div>
              </div>

              <div 
                onClick={() => setActiveNode('nurse-client')}
                className={`p-2 rounded border transition-all cursor-pointer ${
                  activeNode === 'nurse-client' ? 'bg-white border-[#2563EB] shadow-xs' : 'bg-white/80 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="w-7 h-7 mx-auto rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 mb-1">
                  <span className="material-symbols-outlined text-base">medical_information</span>
                </div>
                <div className="font-bold text-slate-900 text-[11px]">Nurse</div>
                <div className="text-[10px] text-slate-500">(Web / Mobile)</div>
              </div>

              <div 
                onClick={() => setActiveNode('hospital-client')}
                className={`p-2 rounded border transition-all cursor-pointer ${
                  activeNode === 'hospital-client' ? 'bg-white border-[#2563EB] shadow-xs' : 'bg-white/80 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="w-7 h-7 mx-auto rounded-full bg-purple-100 flex items-center justify-center text-purple-700 mb-1">
                  <span className="material-symbols-outlined text-base">local_hospital</span>
                </div>
                <div className="font-bold text-slate-900 text-[11px]">Clinic / Hospital</div>
                <div className="text-[10px] text-slate-500">(Org Portal)</div>
              </div>

              <div 
                onClick={() => setActiveNode('admin-client')}
                className={`p-2 rounded border transition-all cursor-pointer ${
                  activeNode === 'admin-client' ? 'bg-white border-[#2563EB] shadow-xs' : 'bg-white/80 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="w-7 h-7 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-800 mb-1">
                  <span className="material-symbols-outlined text-base">shield_person</span>
                </div>
                <div className="font-bold text-slate-900 text-[11px]">Admin</div>
                <div className="text-[10px] text-slate-500">(Web Portal)</div>
              </div>

              <div 
                onClick={() => setActiveNode('super-admin')}
                className={`p-2 rounded border transition-all cursor-pointer ${
                  activeNode === 'super-admin' ? 'bg-white border-[#2563EB] shadow-xs' : 'bg-white/80 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="w-7 h-7 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-1">
                  <span className="material-symbols-outlined text-base">settings_suggest</span>
                </div>
                <div className="font-bold text-slate-900 text-[11px]">Super Admin</div>
                <div className="text-[10px] text-slate-500">(Platform)</div>
              </div>

              <div 
                onClick={() => setActiveNode('api-clients')}
                className={`p-2 rounded border transition-all cursor-pointer col-span-2 sm:col-span-1 border-dashed ${
                  activeNode === 'api-clients' ? 'bg-white border-[#2563EB] shadow-xs' : 'bg-white/60 border-slate-300 hover:bg-white'
                }`}
              >
                <div className="w-7 h-7 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mb-1">
                  <span className="material-symbols-outlined text-base">code</span>
                </div>
                <div className="font-bold text-slate-900 text-[11px]">API Partners</div>
                <div className="text-[10px] text-slate-500">(Third-party)</div>
              </div>
            </div>
          </div>

          {/* Edge Layer (Internet -> Secure Entry) */}
          <div className="p-4 rounded-lg bg-purple-50/40 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-purple-700">public</span>
                Edge Layer (Internet &rarr; Secure Entry)
              </span>
              <span className="text-[10px] font-code-mono text-purple-700">WAF, CDN, Rate Limiting & TLS 1.3</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2 bg-white rounded border border-slate-200">
                <div className="font-bold text-slate-800 text-[11px]">DNS</div>
                <div className="text-[10px] text-slate-500">Global Anycast</div>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <div className="font-bold text-slate-800 text-[11px]">CDN</div>
                <div className="text-[10px] text-slate-500">Static Assets</div>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <div className="font-bold text-slate-800 text-[11px]">WAF</div>
                <div className="text-[10px] text-slate-500">DDoS & Bot Shield</div>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <div className="font-bold text-slate-800 text-[11px]">Load Balancer</div>
                <div className="text-[10px] text-slate-500">High Availability</div>
              </div>
              <div className="p-2 bg-white rounded border border-[#2563EB] col-span-2 sm:col-span-1 shadow-2xs">
                <div className="font-bold text-[#2563EB] text-[11px]">API Gateway</div>
                <div className="text-[10px] text-slate-500">Rate Limits & Tokens</div>
              </div>
            </div>
          </div>

          {/* Application Layer (Modular Monolith) */}
          <div className="p-4 rounded-lg bg-white border border-slate-300 shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#2563EB]">developer_board</span>
                Application Layer (Modular Monolith)
              </span>
              <span className="text-[10px] font-code-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                99.98% Uptime · RLS Tenant Resolvers
              </span>
            </div>

            {/* Core Modules Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
              <div 
                onClick={() => setActiveNode('user-mgmt')}
                className={`p-2 rounded border cursor-pointer text-xs ${
                  activeNode === 'user-mgmt' ? 'bg-blue-50 border-[#2563EB]' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="font-bold text-slate-900 text-[11px] mb-1">User Management</div>
                <ul className="text-[10px] text-slate-600 list-disc list-inside">
                  <li>User profiles</li>
                  <li>Roles & RBAC</li>
                  <li>Invitations</li>
                </ul>
              </div>

              <div 
                onClick={() => setActiveNode('tenant-mgmt')}
                className={`p-2 rounded border cursor-pointer text-xs ${
                  activeNode === 'tenant-mgmt' ? 'bg-emerald-50 border-emerald-600' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="font-bold text-slate-900 text-[11px] mb-1">Tenant Management</div>
                <ul className="text-[10px] text-slate-600 list-disc list-inside">
                  <li>Org setups</li>
                  <li>Formulary rules</li>
                  <li>SaaS plans</li>
                </ul>
              </div>

              <div 
                onClick={() => setActiveNode('ai-core')}
                className={`p-2 rounded border cursor-pointer text-xs ${
                  activeNode === 'ai-core' ? 'bg-purple-50 border-purple-600 ring-1 ring-purple-400' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="font-bold text-purple-950 text-[11px] mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-purple-700">psychology</span>
                  Medicine & AI Core
                </div>
                <ul className="text-[10px] text-slate-700 list-disc list-inside">
                  <li>Rx Vision OCR</li>
                  <li>Generic match</li>
                  <li>Cost comparison</li>
                </ul>
              </div>

              <div 
                onClick={() => setActiveNode('notifications')}
                className={`p-2 rounded border cursor-pointer text-xs ${
                  activeNode === 'notifications' ? 'bg-amber-50 border-amber-600' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="font-bold text-slate-900 text-[11px] mb-1">Notifications</div>
                <ul className="text-[10px] text-slate-600 list-disc list-inside">
                  <li>Email / SMS</li>
                  <li>Push alerts</li>
                  <li>In-app notices</li>
                </ul>
              </div>

              <div 
                onClick={() => setActiveNode('search-engine')}
                className={`p-2 rounded border cursor-pointer text-xs ${
                  activeNode === 'search-engine' ? 'bg-blue-50 border-[#2563EB]' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="font-bold text-slate-900 text-[11px] mb-1">Search Engine</div>
                <ul className="text-[10px] text-slate-600 list-disc list-inside">
                  <li>INN/ATC lookup</li>
                  <li>Autocomplete</li>
                  <li>Fuzzy salt index</li>
                </ul>
              </div>

              <div 
                onClick={() => setActiveNode('reporting')}
                className={`p-2 rounded border cursor-pointer text-xs ${
                  activeNode === 'reporting' ? 'bg-cyan-50 border-cyan-600' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="font-bold text-slate-900 text-[11px] mb-1">Reporting & Audit</div>
                <ul className="text-[10px] text-slate-600 list-disc list-inside">
                  <li>Usage metrics</li>
                  <li>Dispute queues</li>
                  <li>HMAC audit trail</li>
                </ul>
              </div>
            </div>

            {/* Shared Services Bar */}
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2 font-code-mono text-[11px] text-slate-700">
              <span className="font-bold uppercase text-slate-400">Shared Services:</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">folder</span> File Mgmt</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">payment</span> Payment Gateway</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">lock</span> Audit & Logging</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">settings</span> Dynamic Config</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">sync</span> Integration Mgmt</span>
            </div>
          </div>

          {/* Data Layer (Tenant-Isolated) */}
          <div className="p-4 rounded-lg bg-amber-50/40 border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-amber-700">database</span>
                Data Layer (Tenant-Isolated & RLS Enforced)
              </span>
              <span className="text-[10px] font-code-mono text-amber-800">PostgreSQL Schema Isolation + Redis Partitions</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div 
                onClick={() => setActiveNode('data-primary')}
                className="p-2.5 bg-white rounded border border-slate-200 cursor-pointer hover:border-slate-400"
              >
                <div className="font-bold text-slate-900 text-[11px] mb-1">Primary Database</div>
                <div className="text-[10px] text-slate-600 leading-tight">
                  Shared DB + Separate Schemas (tnt_apollo_01)
                </div>
              </div>

              <div 
                onClick={() => setActiveNode('data-cache')}
                className="p-2.5 bg-white rounded border border-slate-200 cursor-pointer hover:border-slate-400"
              >
                <div className="font-bold text-slate-900 text-[11px] mb-1">Cache (Redis)</div>
                <div className="text-[10px] text-slate-600 leading-tight">
                  Tenant prefix keys (apollo_cache_*)
                </div>
              </div>

              <div 
                onClick={() => setActiveNode('data-search')}
                className="p-2.5 bg-white rounded border border-slate-200 cursor-pointer hover:border-slate-400"
              >
                <div className="font-bold text-slate-900 text-[11px] mb-1">Search Index</div>
                <div className="text-[10px] text-slate-600 leading-tight">
                  Elasticsearch salt catalog indices
                </div>
              </div>

              <div 
                onClick={() => setActiveNode('data-object')}
                className="p-2.5 bg-white rounded border border-slate-200 cursor-pointer hover:border-slate-400"
              >
                <div className="font-bold text-slate-900 text-[11px] mb-1">Object Storage</div>
                <div className="text-[10px] text-slate-600 leading-tight">
                  Encrypted prescription images (short retention)
                </div>
              </div>

              <div 
                onClick={() => setActiveNode('data-analytics')}
                className="p-2.5 bg-white rounded border border-slate-200 cursor-pointer hover:border-slate-400 col-span-2 sm:col-span-1"
              >
                <div className="font-bold text-slate-900 text-[11px] mb-1">Analytics DB</div>
                <div className="text-[10px] text-slate-600 leading-tight">
                  De-identified metrics & clinical reporting
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Deep-Dive Inspector */}
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
              <span className="material-symbols-outlined text-base text-[#2563EB]">info</span>
              <h3 className="font-title-md text-xs font-bold text-slate-900 uppercase tracking-wider">
                Module Inspector
              </h3>
            </div>

            {activeNode === 'ai-core' && (
              <div className="text-xs text-slate-700 flex flex-col gap-2">
                <div className="font-bold text-sm text-purple-900">Medicine & AI Core Recommendation</div>
                <p>
                  Implements deterministic salt bioequivalence checks grounded in CDSCO / WHO-GMP pharmacopeia matrices, followed by cost delta ranking.
                </p>
                <div className="bg-slate-50 p-2 rounded font-code-mono text-[11px] border border-slate-200">
                  <div>// Bioequivalence verification</div>
                  <div className="text-[#2563EB]">similarity_f2 = calculate_f2(innovator, generic)</div>
                  <div className="text-emerald-700">assert similarity_f2 &gt;= 50.0 // CDSCO compliant</div>
                </div>
                <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-1">
                  <li>Zero hallucinations: only cataloged generic codes surfaced.</li>
                  <li>Multi-pH buffer dissolution profile alignment.</li>
                  <li>Automatic pack-size factor scaling.</li>
                </ul>
              </div>
            )}

            {activeNode !== 'ai-core' && (
              <div className="text-xs text-slate-700 flex flex-col gap-2">
                <div className="font-bold text-sm text-slate-900 capitalize">
                  {activeNode.replace('-', ' ')}
                </div>
                <p>
                  Isolated under tenant security boundaries. All API queries require an explicit Tenant Context header (`X-Tenant-ID: TN-4092`) verified at the edge gateway.
                </p>
                <div className="bg-slate-50 p-2 rounded font-code-mono text-[11px] border border-slate-200">
                  <div>SET search_path TO tnt_apollo_01, public;</div>
                  <div>SELECT * FROM prescriptions WHERE tenant_id = 'TN-4092';</div>
                </div>
              </div>
            )}
          </div>

          {/* Tenant Isolation Strategy Card */}
          <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
              <span className="material-symbols-outlined text-base text-emerald-600">verified_user</span>
              <h3 className="font-title-md text-xs font-bold text-slate-900 uppercase tracking-wider">
                Tenant Isolation Strategy
              </h3>
            </div>

            <ul className="text-xs space-y-1.5 text-slate-700">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xs text-emerald-600">check_circle</span>
                <span>Separate database schemas per tenant</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xs text-emerald-600">check_circle</span>
                <span>Tenant ID enforced in all queries (RLS)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xs text-emerald-600">check_circle</span>
                <span>Application-level authorization checks</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xs text-emerald-600">check_circle</span>
                <span>Tenant-aware API requests</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xs text-emerald-600">check_circle</span>
                <span>Zero cross-tenant data leakage guarantee</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
