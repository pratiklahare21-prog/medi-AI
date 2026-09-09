import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  BarChart
} from 'recharts';
import { MedicineCatalogEntry, PriceTrendDataPoint } from '../types';
import { MEDICINE_PRICE_HISTORIES, MEDICINE_VOLATILITY_SUMMARIES } from '../data/priceTrendsData';

interface PriceTrendSectionProps {
  catalog: MedicineCatalogEntry[];
  onOpenAddMedicine?: () => void;
  onSelectMedicineInCatalog?: (medId: string) => void;
}

type TimeframeOption = '30D' | '90D' | '180D' | '1Y';
type ChartViewMode = 'trajectory' | 'volatility-spread' | 'combined';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
    payload: PriceTrendDataPoint;
  }>;
  label?: string;
}

const CustomPriceTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const savingsDelta = (data.brandMrp - data.lowestGenericPrice).toFixed(2);
  const savingsPct = Math.round(((data.brandMrp - data.lowestGenericPrice) / data.brandMrp) * 100);

  return (
    <div className="p-3 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl text-white text-xs max-w-xs z-50">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <span className="font-semibold text-slate-200">{data.date}</span>
        <span className="font-code-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
          Vol: {data.volatilityIndex}%
        </span>
      </div>

      <div className="space-y-1.5 font-code-mono">
        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            Brand MRP:
          </span>
          <span className="font-bold text-white">₹{data.brandMrp.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-emerald-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Lowest Generic:
          </span>
          <span className="font-bold">₹{data.lowestGenericPrice.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-blue-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            Market Average:
          </span>
          <span>₹{data.averageGenericPrice.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-amber-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Govt (Jan Aushadhi):
          </span>
          <span>₹{data.janAushadhiGovPrice.toFixed(2)}</span>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Patient Savings Spread:</span>
          <span className="text-emerald-400 font-bold">
            ₹{savingsDelta} ({savingsPct}%)
          </span>
        </div>
      </div>

      {data.marketEvent && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-start gap-1 text-[11px] text-amber-300">
            <span className="material-symbols-outlined text-xs mt-0.5">campaign</span>
            <span className="leading-snug">
              <strong className="text-white font-medium">Market Event:</strong> {data.marketEvent}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export const PriceTrendSection: React.FC<PriceTrendSectionProps> = ({
  catalog,
  onOpenAddMedicine,
  onSelectMedicineInCatalog
}) => {
  const [selectedMedId, setSelectedMedId] = useState<string>('med-01');
  const [timeframe, setTimeframe] = useState<TimeframeOption>('1Y');
  const [viewMode, setViewMode] = useState<ChartViewMode>('trajectory');
  const [activeSeries, setActiveSeries] = useState<{
    brand: boolean;
    lowestGeneric: boolean;
    avgGeneric: boolean;
    janAushadhi: boolean;
  }>({
    brand: true,
    lowestGeneric: true,
    avgGeneric: true,
    janAushadhi: true
  });

  // Simulated live event injected state
  const [simulatedPoints, setSimulatedPoints] = useState<Record<string, PriceTrendDataPoint[]>>({});
  const [simulationActive, setSimulationActive] = useState<boolean>(false);

  // Available medicines with historical tracking
  const trackedMedicines = useMemo(() => {
    return [
      { id: 'med-01', name: 'Januvia 100mg', salt: 'Sitagliptin Phosphate', category: 'Anti-diabetic', volatility: 'High (18.2%)' },
      { id: 'med-04', name: 'Augmentin 625 Duo', salt: 'Amoxicillin + Clavulanate', category: 'Antibiotic', volatility: 'High (24.8%)' },
      { id: 'med-03', name: 'Crestor 10mg', salt: 'Rosuvastatin Calcium', category: 'Cardiovascular', volatility: 'Moderate (7.0%)' },
      { id: 'med-02', name: 'Telma 40', salt: 'Telmisartan IP', category: 'Hypertension', volatility: 'Low (3.2%)' },
      { id: 'med-05', name: 'Pantocid 40', salt: 'Pantoprazole Sodium', category: 'Gastroenterology', volatility: 'Low (2.8%)' }
    ];
  }, []);

  const currentMedicineCatalog = catalog.find(m => m.id === selectedMedId) || catalog[0];

  // Raw dataset with any live simulated events merged
  const fullDataSeries = useMemo(() => {
    const base = MEDICINE_PRICE_HISTORIES[selectedMedId] || MEDICINE_PRICE_HISTORIES['med-01'];
    const injected = simulatedPoints[selectedMedId] || [];
    return [...base, ...injected];
  }, [selectedMedId, simulatedPoints]);

  // Filter based on timeframe
  const filteredData = useMemo(() => {
    const total = fullDataSeries.length;
    if (timeframe === '30D') {
      return fullDataSeries.slice(Math.max(0, total - 3));
    } else if (timeframe === '90D') {
      return fullDataSeries.slice(Math.max(0, total - 5));
    } else if (timeframe === '180D') {
      return fullDataSeries.slice(Math.max(0, total - 7));
    }
    return fullDataSeries;
  }, [fullDataSeries, timeframe]);

  // Computed summary metrics
  const metrics = useMemo(() => {
    if (!filteredData.length) {
      return {
        latestGeneric: 0,
        brandMrp: 0,
        lowestPriceRecorded: 0,
        highestPriceRecorded: 0,
        priceDelta: 0,
        priceDeltaPct: 0,
        avgVolatility: 0,
        volatilityBand: 'Low (Stable)',
        eventsCount: 0
      };
    }

    const firstPoint = filteredData[0];
    const latestPoint = filteredData[filteredData.length - 1];

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let totalVol = 0;
    let events = 0;

    filteredData.forEach(p => {
      if (p.lowestGenericPrice < minPrice) minPrice = p.lowestGenericPrice;
      if (p.lowestGenericPrice > maxPrice) maxPrice = p.lowestGenericPrice;
      totalVol += p.volatilityIndex;
      if (p.marketEvent) events++;
    });

    const avgVol = +(totalVol / filteredData.length).toFixed(1);
    const delta = +(latestPoint.lowestGenericPrice - firstPoint.lowestGenericPrice).toFixed(2);
    const deltaPct = +((delta / firstPoint.lowestGenericPrice) * 100).toFixed(1);

    let band: 'Low (Stable)' | 'Moderate' | 'High (Fluctuating)' = 'Low (Stable)';
    if (avgVol >= 12) {
      band = 'High (Fluctuating)';
    } else if (avgVol >= 6) {
      band = 'Moderate';
    }

    return {
      latestGeneric: latestPoint.lowestGenericPrice,
      brandMrp: latestPoint.brandMrp,
      lowestPriceRecorded: minPrice,
      highestPriceRecorded: maxPrice,
      priceDelta: delta,
      priceDeltaPct: deltaPct,
      avgVolatility: avgVol,
      volatilityBand: band,
      eventsCount: events
    };
  }, [filteredData]);

  // Volatility simulation trigger: injects a realistic shock event
  const handleSimulateShock = () => {
    const currentList = MEDICINE_PRICE_HISTORIES[selectedMedId] || MEDICINE_PRICE_HISTORIES['med-01'];
    const lastItem = currentList[currentList.length - 1];

    if (simulationActive) {
      // Reset
      setSimulatedPoints(prev => ({ ...prev, [selectedMedId]: [] }));
      setSimulationActive(false);
      return;
    }

    // Generate shock drop (e.g. CDSCO ceiling regulation enforcement or major tender dump)
    const simulatedDropPrice = +(lastItem.lowestGenericPrice * 0.82).toFixed(2);
    const newPoint: PriceTrendDataPoint = {
      date: 'Sep 2026 (Live Feed)',
      shortDate: 'Sep 26',
      timestamp: Date.now(),
      brandMrp: lastItem.brandMrp,
      lowestGenericPrice: simulatedDropPrice,
      averageGenericPrice: +(lastItem.averageGenericPrice * 0.88).toFixed(2),
      janAushadhiGovPrice: lastItem.janAushadhiGovPrice,
      volatilityIndex: 21.4,
      marketEvent: 'Simulated NPPA DPCO price ceiling revision (-18% drop)',
      eventSeverity: 'warning'
    };

    setSimulatedPoints(prev => ({ ...prev, [selectedMedId]: [newPoint] }));
    setSimulationActive(true);
  };

  // Export time-series data as CSV
  const handleExportCsv = () => {
    const headers = [
      'Date',
      'Medicine',
      'Active Salt',
      'Brand MRP (INR)',
      'Lowest Generic (INR)',
      'Market Avg (INR)',
      'Jan Aushadhi Gov (INR)',
      'Volatility Index (%)',
      'Market Event'
    ];

    const rows = filteredData.map(d => [
      `"${d.date}"`,
      `"${currentMedicineCatalog?.brandName || 'Selected Drug'}"`,
      `"${currentMedicineCatalog?.activeSalt || ''}"`,
      d.brandMrp,
      d.lowestGenericPrice,
      d.averageGenericPrice,
      d.janAushadhiGovPrice,
      d.volatilityIndex,
      `"${d.marketEvent || 'Normal Market Operations'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `price_volatility_trend_${selectedMedId}_${timeframe.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="flex flex-col w-full p-4 lg:p-6 mb-6 rounded-xl bg-white border border-slate-200 shadow-2xs">
      {/* Header & Title Area */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 mb-5 border-b border-slate-200">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] font-code-mono text-[11px] font-semibold uppercase tracking-wider border border-blue-200 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">monitoring</span>
              Time-Series Analytics
            </span>
            <span className="text-[11px] font-code-mono text-slate-500">
              CDSCO / Jan Aushadhi / Open Wholesale Feeds
            </span>
          </div>
          <h2 className="font-display-sm text-xl lg:text-2xl text-slate-900 tracking-tight font-bold">
            Medicine Price Trend & Volatility Patterns
          </h2>
          <p className="font-body-sm text-xs sm:text-sm text-slate-600">
            Historical price drift, regulatory ceiling impacts, and generic margin erosion across retail pharmacies.
          </p>
        </div>

        {/* Global Controls: Timeframe, Simulation & CSV */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Chips */}
          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
            {(['30D', '90D', '180D', '1Y'] as TimeframeOption[]).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-md text-xs font-code-mono font-semibold transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-white text-[#2563EB] shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Simulation Toggle */}
          <button
            onClick={handleSimulateShock}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              simulationActive
                ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200 ring-1 ring-amber-400'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
            title="Simulate sudden regulatory price cap or competitor price drop shock"
          >
            <span className="material-symbols-outlined text-sm text-amber-600">
              {simulationActive ? 'undo' : 'bolt'}
            </span>
            <span>{simulationActive ? 'Reset Simulation' : 'Simulate Price Shock'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Download verified price movement records in CSV format"
          >
            <span className="material-symbols-outlined text-sm text-[#2563EB]">download</span>
            <span>Export Series</span>
          </button>
        </div>
      </div>

      {/* Drug Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin">
        <span className="text-xs text-slate-500 font-semibold shrink-0 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">medication</span>
          Tracked Compounds:
        </span>
        {trackedMedicines.map(med => {
          const isSelected = selectedMedId === med.id;
          return (
            <button
              key={med.id}
              onClick={() => {
                setSelectedMedId(med.id);
                setSimulationActive(false);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] shadow-2xs font-bold ring-1 ring-[#2563EB]/30'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <span>{med.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-code-mono bg-white border border-slate-200 text-slate-500">
                {med.volatility}
              </span>
            </button>
          );
        })}
      </div>

      {/* Volatility & Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        {/* Card 1: Current Lowest Generic */}
        <div className="p-3.5 rounded-lg bg-slate-50/80 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <span>Current Generic Price</span>
            <span className="material-symbols-outlined text-emerald-600 text-base">payments</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display-md text-emerald-700">
              ₹{metrics.latestGeneric.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 line-through">
              MRP ₹{metrics.brandMrp.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1 pt-1.5 border-t border-slate-200/60">
            <span className="text-emerald-700 font-code-mono font-semibold">
              Save ₹{(metrics.brandMrp - metrics.latestGeneric).toFixed(2)}
            </span>
            <span className="text-[11px] font-code-mono text-slate-500">
              {Math.round(((metrics.brandMrp - metrics.latestGeneric) / metrics.brandMrp) * 100)}% Discount
            </span>
          </div>
        </div>

        {/* Card 2: Period Price Deflation Delta */}
        <div className="p-3.5 rounded-lg bg-slate-50/80 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <span>Price Trend Movement ({timeframe})</span>
            <span className="material-symbols-outlined text-blue-600 text-base">
              {metrics.priceDelta <= 0 ? 'trending_down' : 'trending_up'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-display-md ${
                metrics.priceDelta <= 0 ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {metrics.priceDelta <= 0 ? '' : '+'}
              {metrics.priceDeltaPct}%
            </span>
            <span className="text-xs font-code-mono text-slate-500">
              (₹{Math.abs(metrics.priceDelta)} {metrics.priceDelta <= 0 ? 'drop' : 'rise'})
            </span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1 pt-1.5 border-t border-slate-200/60">
            <span className="text-[11px] text-slate-600 font-medium">Trajectory:</span>
            <span
              className={`font-code-mono font-bold text-[11px] px-1.5 py-0.2 rounded ${
                metrics.priceDelta <= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
              }`}
            >
              {metrics.priceDelta <= 0 ? 'Aggressive Deflation' : 'Supply Inflation'}
            </span>
          </div>
        </div>

        {/* Card 3: Volatility Index & Classification */}
        <div className="p-3.5 rounded-lg bg-slate-50/80 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <span>Volatility Coefficient</span>
            <span className="material-symbols-outlined text-amber-600 text-base">ssid_chart</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display-md text-slate-900">
              {metrics.avgVolatility}%
            </span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded font-code-mono font-bold ${
                metrics.volatilityBand === 'High (Fluctuating)'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : metrics.volatilityBand === 'Moderate'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {metrics.volatilityBand}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1 pt-1.5 border-t border-slate-200/60">
            <span className="text-[11px] text-slate-500 font-code-mono">Range in Period:</span>
            <span className="text-slate-800 font-code-mono text-[11px] font-semibold">
              ₹{metrics.lowestPriceRecorded.toFixed(0)} – ₹{metrics.highestPriceRecorded.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Card 4: Market Events & Regulatory Milestones */}
        <div className="p-3.5 rounded-lg bg-slate-50/80 border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <span>Market Milestones Recorded</span>
            <span className="material-symbols-outlined text-purple-600 text-base">event_available</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display-md text-slate-900">
              {metrics.eventsCount} Events
            </span>
            <span className="text-xs font-code-mono text-purple-700 font-semibold">
              Logged in SLA
            </span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1 pt-1.5 border-t border-slate-200/60">
            <span className="text-[11px] text-slate-500">Government Benchmark:</span>
            <span className="text-amber-700 font-code-mono text-[11px] font-bold">
              ₹{filteredData[filteredData.length - 1]?.janAushadhiGovPrice.toFixed(2) || '0.00'} (Jan Aushadhi)
            </span>
          </div>
        </div>
      </div>

      {/* Chart View Mode Controls & Legend Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 mb-4 rounded-lg bg-slate-50 border border-slate-200">
        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-semibold">Visualization Mode:</span>
          <div className="inline-flex rounded-md bg-white border border-slate-300 p-0.5">
            <button
              onClick={() => setViewMode('trajectory')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                viewMode === 'trajectory' ? 'bg-[#2563EB] text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Price Trajectory (₹)
            </button>
            <button
              onClick={() => setViewMode('volatility-spread')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                viewMode === 'volatility-spread' ? 'bg-[#2563EB] text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Volatility Spread (%)
            </button>
            <button
              onClick={() => setViewMode('combined')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                viewMode === 'combined' ? 'bg-[#2563EB] text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Combined View
            </button>
          </div>
        </div>

        {/* Legend Filter Toggles */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={activeSeries.brand}
              onChange={e => setActiveSeries(prev => ({ ...prev, brand: e.target.checked }))}
              className="rounded text-slate-800 focus:ring-slate-500 h-3.5 w-3.5"
            />
            <span className="flex items-center gap-1 text-slate-700 font-medium">
              <span className="w-2.5 h-0.5 bg-slate-600 rounded-full"></span>
              Brand MRP
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={activeSeries.lowestGeneric}
              onChange={e => setActiveSeries(prev => ({ ...prev, lowestGeneric: e.target.checked }))}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
            />
            <span className="flex items-center gap-1 text-emerald-800 font-semibold">
              <span className="w-2.5 h-1 bg-emerald-500 rounded-full"></span>
              Lowest Generic
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={activeSeries.avgGeneric}
              onChange={e => setActiveSeries(prev => ({ ...prev, avgGeneric: e.target.checked }))}
              className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
            />
            <span className="flex items-center gap-1 text-blue-700 font-medium">
              <span className="w-2.5 h-0.5 bg-blue-500 rounded-full"></span>
              Retail Average
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={activeSeries.janAushadhi}
              onChange={e => setActiveSeries(prev => ({ ...prev, janAushadhi: e.target.checked }))}
              className="rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
            />
            <span className="flex items-center gap-1 text-amber-800 font-medium">
              <span className="w-2.5 h-0.5 border-t-2 border-dashed border-amber-500"></span>
              Govt Jan Aushadhi
            </span>
          </label>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="w-full h-80 sm:h-96 relative bg-white rounded-lg border border-slate-100 p-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'trajectory' ? (
            <ComposedChart data={filteredData} margin={{ top: 15, right: 25, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="genericSavingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#64748B" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="shortDate"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tickFormatter={val => `₹${val}`}
                domain={['auto', 'auto']}
              />

              <Tooltip content={<CustomPriceTooltip />} />

              {/* Reference line for Minimum recorded generic price */}
              <ReferenceLine
                y={metrics.lowestPriceRecorded}
                stroke="#10B981"
                strokeDasharray="4 4"
                label={{
                  value: `Min: ₹${metrics.lowestPriceRecorded}`,
                  fill: '#059669',
                  fontSize: 10,
                  position: 'insideBottomRight'
                }}
              />

              {activeSeries.brand && (
                <Line
                  type="monotone"
                  dataKey="brandMrp"
                  name="Brand MRP"
                  stroke="#475569"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#475569' }}
                  activeDot={{ r: 6 }}
                />
              )}

              {activeSeries.avgGeneric && (
                <Line
                  type="monotone"
                  dataKey="averageGenericPrice"
                  name="Retail Average"
                  stroke="#3B82F6"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={{ r: 2.5, fill: '#3B82F6' }}
                />
              )}

              {activeSeries.lowestGeneric && (
                <Area
                  type="monotone"
                  dataKey="lowestGenericPrice"
                  name="Lowest Generic"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#genericSavingsGradient)"
                  dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 7 }}
                />
              )}

              {activeSeries.janAushadhi && (
                <Line
                  type="monotone"
                  dataKey="janAushadhiGovPrice"
                  name="Jan Aushadhi (Govt)"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ r: 3, fill: '#F59E0B' }}
                />
              )}
            </ComposedChart>
          ) : viewMode === 'volatility-spread' ? (
            <BarChart data={filteredData} margin={{ top: 15, right: 25, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="shortDate"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tickFormatter={val => `${val}%`}
              />
              <Tooltip content={<CustomPriceTooltip />} />
              <ReferenceLine y={10} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'High Volatility Threshold (10%)', fill: '#EF4444', fontSize: 10 }} />
              <Bar
                dataKey="volatilityIndex"
                name="Volatility Index (%)"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            /* Combined Composed View: Price Lines + Volatility Bars on secondary axis */
            <ComposedChart data={filteredData} margin={{ top: 15, right: 25, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="shortDate"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                yAxisId="price"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tickFormatter={val => `₹${val}`}
              />
              <YAxis
                yAxisId="vol"
                orientation="right"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tickFormatter={val => `${val}%`}
              />
              <Tooltip content={<CustomPriceTooltip />} />

              <Bar
                yAxisId="vol"
                dataKey="volatilityIndex"
                name="Volatility Spread %"
                fill="#E2E8F0"
                opacity={0.6}
                radius={[4, 4, 0, 0]}
              />

              {activeSeries.brand && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="brandMrp"
                  name="Brand MRP"
                  stroke="#475569"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              )}

              {activeSeries.lowestGeneric && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="lowestGenericPrice"
                  name="Lowest Generic"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10B981' }}
                />
              )}

              {activeSeries.janAushadhi && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="janAushadhiGovPrice"
                  name="Jan Aushadhi Gov"
                  stroke="#F59E0B"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
              )}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chronological Market Event Annotations Bar */}
      <div className="mt-4 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-purple-600">flag</span>
            Market Event Timeline for {currentMedicineCatalog?.brandName || 'Selected Drug'}
          </span>
          <span className="text-[11px] font-code-mono text-slate-500">
            Source: CDSCO Regulatory Registry & Jan Aushadhi Procurement Tenders
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredData
            .filter(d => d.marketEvent)
            .map((ev, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="p-1 rounded bg-purple-100 text-purple-700 shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-xs">info</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{ev.date}</span>
                    <span className="font-code-mono text-[10px] text-emerald-700 font-bold">
                      Generic: ₹{ev.lowestGenericPrice.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-slate-600 text-[11px] mt-0.5">{ev.marketEvent}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Cross-Compound Volatility Matrix & Benchmarking Table */}
      <div className="mt-5 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-[#2563EB]">analytics</span>
              Formulary Volatility Risk Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Comparative volatility classification across core therapeutic categories.
            </p>
          </div>
          <span className="text-xs font-code-mono text-slate-500">
            Ranked by 12-Month Volatility Coefficient
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Medicine & Compound</th>
                <th className="py-2.5 px-3">Therapeutic Category</th>
                <th className="py-2.5 px-3 text-right">Brand MRP</th>
                <th className="py-2.5 px-3 text-right">Current Generic</th>
                <th className="py-2.5 px-3 text-right">Period Range (Min / Max)</th>
                <th className="py-2.5 px-3 text-center">Volatility Score</th>
                <th className="py-2.5 px-3">Primary Volatility Driver</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-code-mono text-[11px]">
              {MEDICINE_VOLATILITY_SUMMARIES.map(item => {
                const isSelected = selectedMedId === item.medicineId;
                return (
                  <tr
                    key={item.medicineId}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50/80'
                    }`}
                    onClick={() => {
                      setSelectedMedId(item.medicineId);
                      setSimulationActive(false);
                    }}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 font-sans text-xs">{item.medicineName}</span>
                        <span className="text-[10px] text-slate-500">{item.activeSalt}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-600 text-xs">
                      {item.category}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      ₹{item.brandMrp.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">
                      ₹{item.currentGeneric.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      ₹{item.priceRangeMin.toFixed(0)} – ₹{item.priceRangeMax.toFixed(0)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.volatilityLevel === 'High (Fluctuating)'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : item.volatilityLevel === 'Moderate'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.volatilityLevel === 'High (Fluctuating)'
                              ? 'bg-amber-600'
                              : item.volatilityLevel === 'Moderate'
                              ? 'bg-blue-600'
                              : 'bg-emerald-600'
                          }`}
                        ></span>
                        {item.volatilityScore}% ({item.volatilityLevel.split(' ')[0]})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-600 text-xs max-w-xs truncate">
                      {item.primaryDriver}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedMedId(item.medicineId);
                          setSimulationActive(false);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#2563EB] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? 'Active Chart' : 'Plot Trend'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
