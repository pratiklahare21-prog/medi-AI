import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MedicineCatalogEntry } from '../types';

interface SavingsDashboardViewProps {
  medicines: MedicineCatalogEntry[];
}

// Mock cumulative savings data
const monthlySavingsData = [
  { month: 'Apr', branded: 8500, generic: 2400, savings: 6100 },
  { month: 'May', branded: 9200, generic: 2650, savings: 6550 },
  { month: 'Jun', branded: 8900, generic: 2500, savings: 6400 },
  { month: 'Jul', branded: 10100, generic: 2900, savings: 7200 },
  { month: 'Aug', branded: 11500, generic: 3200, savings: 8300 },
  { month: 'Sep', branded: 12800, generic: 3600, savings: 9200 },
];

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const SavingsDashboardView: React.FC<SavingsDashboardViewProps> = ({ medicines }) => {
  // Calculate top-saving generics
  const topSavingMedicines = medicines
    .filter((m) => m.verifiedGenericsCount > 0)
    .sort((a, b) => b.savingsAmount - a.savingsAmount)
    .slice(0, 10);

  // Calculate category breakdown
  const categoryBreakdown = medicines.reduce((acc, med) => {
    const category = med.therapeuticCategory;
    if (!acc[category]) {
      acc[category] = { category, totalSavings: 0, count: 0 };
    }
    acc[category].totalSavings += med.savingsAmount;
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, { category: string; totalSavings: number; count: number }>);

  const categoryData = Object.values(categoryBreakdown).slice(0, 6);

  const totalMedicines = medicines.length;
  const totalWithGenerics = medicines.filter((m) => m.verifiedGenericsCount > 0).length;
  const cumulativeSavings = monthlySavingsData[monthlySavingsData.length - 1].savings * 6; // 6 months
  const avgSavingsPerMedicine = cumulativeSavings / totalWithGenerics;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-headline-sm text-slate-900">
              Savings Analytics Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Cumulative patient savings, trends, and top-performing generics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 6 Months</option>
              <option>Last 12 Months</option>
              <option>Year to Date</option>
              <option>All Time</option>
            </select>
            <button className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">download</span>
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumulative Savings</span>
                <div className="text-3xl font-bold text-emerald-700 mt-2">₹{cumulativeSavings.toLocaleString()}</div>
                <span className="text-xs text-slate-600 mt-1 block">Last 6 months</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-emerald-700">account_balance_wallet</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs">
              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                +24.5%
              </span>
              <span className="text-slate-500">vs previous period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Savings/Medicine</span>
                <div className="text-3xl font-bold text-blue-700 mt-2">₹{avgSavingsPerMedicine.toFixed(0)}</div>
                <span className="text-xs text-slate-600 mt-1 block">Per prescription</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-blue-700">savings</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs">
              <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                +12.3%
              </span>
              <span className="text-slate-500">vs previous period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Medicines Covered</span>
                <div className="text-3xl font-bold text-purple-700 mt-2">{totalWithGenerics}</div>
                <span className="text-xs text-slate-600 mt-1 block">With generics</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-purple-700">medication</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-600">
              {((totalWithGenerics / totalMedicines) * 100).toFixed(1)}% of catalog
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Adoption</span>
                <div className="text-3xl font-bold text-orange-700 mt-2">87.4%</div>
                <span className="text-xs text-slate-600 mt-1 block">Generic preference</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-orange-700">groups</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs">
              <span className="text-orange-600 font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                +5.2%
              </span>
              <span className="text-slate-500">vs previous period</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Monthly Savings Trend */}
          <div className="col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Monthly Savings Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlySavingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="branded" stroke="#EF4444" strokeWidth={2} name="Branded Cost" />
                <Line type="monotone" dataKey="generic" stroke="#3B82F6" strokeWidth={2} name="Generic Cost" />
                <Line type="monotone" dataKey="savings" stroke="#10B981" strokeWidth={3} name="Total Savings" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Savings by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => entry.category?.split(' ')[0] || ''}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalSavings"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => `₹${value.toFixed(0)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Saving Medicines */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900">Top 10 Highest-Saving Generics</h3>
            <span className="text-xs text-slate-500">Sorted by patient savings per strip</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Medicine Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Active Salt</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Category</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Branded MRP</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Lowest Generic</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Savings</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Savings %</th>
                </tr>
              </thead>
              <tbody>
                {topSavingMedicines.map((med, idx) => (
                  <tr key={med.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-600 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{med.brandName}</div>
                      <div className="text-xs text-slate-500">{med.manufacturer}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{med.activeSalt}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                        {med.therapeuticCategory}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-code-mono text-slate-900">₹{med.brandedMrp.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-code-mono text-blue-700 font-semibold">₹{med.lowestGenericPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-code-mono text-emerald-700 font-bold">₹{med.savingsAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                        {med.savingsPercent.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
