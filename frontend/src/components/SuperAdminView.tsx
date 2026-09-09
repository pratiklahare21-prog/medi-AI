import React, { useState } from 'react';
import { TenantInfo, UserAccount } from '../types';

interface SuperAdminViewProps {
  tenants: TenantInfo[];
  currentUser: UserAccount | null;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({ tenants, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'tenants' | 'users' | 'system'>('tenants');
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);

  // Mock user data
  const mockUsers: UserAccount[] = [
    {
      id: 'u1',
      name: 'Dr. Aditya Sharma',
      email: 'aditya.sharma@apollohospitals.com',
      role: 'Lead Ops Admin',
      title: 'Chief Medical Officer',
      tenantId: 'apollo-hospitals-main',
      tenantName: 'Apollo Hospitals (Main Campus)',
      joinedAt: '2025-01-15',
    },
    {
      id: 'u2',
      name: 'Pharm. Priya Desai',
      email: 'priya.desai@fortishealthcare.com',
      role: 'Clinical Pharmacist',
      title: 'Senior Clinical Pharmacist',
      tenantId: 'fortis-healthcare-delhi',
      tenantName: 'Fortis Healthcare (Delhi NCR)',
      joinedAt: '2025-03-20',
    },
    {
      id: 'u3',
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@maxhealthcare.com',
      role: 'Prescribing Physician',
      title: 'Consultant Physician',
      tenantId: 'max-healthcare-bengaluru',
      tenantName: 'Max Healthcare (Bengaluru)',
      joinedAt: '2025-06-10',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-5 border-b border-purple-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-2xl font-headline-sm">
                Super Admin Control Panel
              </h1>
              <p className="text-sm text-purple-200 mt-1">
                Multi-tenant management, user administration, and system configuration
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-100 text-xs font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </div>

      {/* Access Control Warning */}
      {currentUser?.role !== 'Lead Ops Admin' && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
          <div className="flex items-center gap-2 text-amber-800">
            <span className="material-symbols-outlined text-lg">warning</span>
            <span className="text-sm font-semibold">
              Restricted Access: Super Admin features require Lead Ops Admin role. Current role: {currentUser?.role}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="flex gap-1">
          {(['tenants', 'users', 'system'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'tenants' ? 'Tenant Management' : tab === 'users' ? 'User Administration' : 'System Configuration'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'tenants' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Healthcare Tenant Organizations</h2>
                <p className="text-sm text-slate-600 mt-1">Manage multi-tenant partitions with row-level security isolation</p>
              </div>
              <button
                onClick={() => setShowAddTenantModal(true)}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Add New Tenant
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Tenant Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Code</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Schema</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Region</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Environment</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                            {tenant.shortCode}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{tenant.name}</div>
                            <div className="text-xs text-slate-500">Partition ID: {tenant.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-code-mono text-slate-700">{tenant.tenantCode}</td>
                      <td className="py-3 px-4 font-code-mono text-blue-700">{tenant.schema}</td>
                      <td className="py-3 px-4 text-slate-700">{tenant.region}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          tenant.environment === 'Production'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : tenant.environment === 'Staging'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {tenant.environment}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          {tenant.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Edit Tenant">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="View Audit Logs">
                            <span className="material-symbols-outlined text-lg">history</span>
                          </button>
                          <button className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors" title="Suspend Tenant">
                            <span className="material-symbols-outlined text-lg">block</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">User Administration</h2>
                <p className="text-sm text-slate-600 mt-1">Manage user accounts, roles, and permissions across all tenants</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">person_add</span>
                Add New User
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">User Details</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Tenant Organization</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Joined</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{user.name}</div>
                            <div className="text-xs text-slate-500">{user.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-code-mono text-slate-700 text-xs">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 text-xs font-semibold">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{user.tenantName}</td>
                      <td className="py-3 px-4 text-slate-600">{user.joinedAt}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Edit User">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Reset Password">
                            <span className="material-symbols-outlined text-lg">lock_reset</span>
                          </button>
                          <button className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors" title="Deactivate User">
                            <span className="material-symbols-outlined text-lg">person_off</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">System Configuration</h2>
              <p className="text-sm text-slate-600 mt-1">Platform-wide settings, API keys, and operational parameters</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* API Configuration */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-blue-600">api</span>
                  API Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Gemini API Key
                    </label>
                    <input
                      type="password"
                      value="••••••••••••••••••••"
                      readOnly
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-slate-50 font-code-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Rate Limit (AI Endpoints)
                    </label>
                    <input
                      type="number"
                      defaultValue="30"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                    />
                    <span className="text-xs text-slate-500 mt-1 block">Requests per minute</span>
                  </div>
                </div>
              </div>

              {/* Database Configuration */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-emerald-600">database</span>
                  Database Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      PostgreSQL Connection String
                    </label>
                    <input
                      type="password"
                      value="postgresql://••••••••"
                      readOnly
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-slate-50 font-code-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Connection Pool Size
                    </label>
                    <input
                      type="number"
                      defaultValue="20"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-red-600">security</span>
                  Security Settings
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Enforce 2FA for Admin Users</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Enable Audit Log HMAC Verification</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Strict Row-Level Security (RLS)</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600" />
                  </label>
                </div>
              </div>

              {/* System Health */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-purple-600">monitoring</span>
                  System Health
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">API Gateway Uptime</span>
                    <span className="text-sm font-bold text-emerald-700">99.97%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Database Response Time</span>
                    <span className="text-sm font-bold text-blue-700">24ms avg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Active Sessions</span>
                    <span className="text-sm font-bold text-slate-900">148</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">save</span>
                Save Configuration
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Tenant Modal (placeholder) */}
      {showAddTenantModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddTenantModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Tenant Organization</h3>
            <p className="text-sm text-slate-600 mb-4">Feature under development. Tenant creation will be available in the next release.</p>
            <button
              onClick={() => setShowAddTenantModal(false)}
              className="w-full px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
