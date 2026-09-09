import React from 'react';
import { PricingPartnerFeed } from '../types';

interface PricingFeedsViewProps {
  feeds: PricingPartnerFeed[];
  onRetryFeed: (feedId: string) => void;
  onRefreshAll: () => void;
}

export const PricingFeedsView: React.FC<PricingFeedsViewProps> = ({
  feeds,
  onRetryFeed,
  onRefreshAll
}) => {
  return (
    <div className="flex flex-col w-full pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-code-mono text-[11px] font-semibold border border-amber-200">
              Real-time Ingestion & Heartbeat
            </span>
          </div>
          <h1 className="font-headline-md text-xl lg:text-2xl text-slate-900 font-bold tracking-tight">
            Partner Pricing Feeds & Normalization Pipeline
          </h1>
          <p className="font-body-sm text-xs sm:text-sm text-slate-500">
            Monitoring sync SLA, price scraping latency, and pack-size normalization accuracy across pharmacy networks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshAll}
            className="px-3 py-2 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>Force Sync All (4 Feeds)</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">
            Total Monitored SKUs
          </span>
          <div className="text-2xl font-bold text-slate-900 font-display-lg">
            47,270
          </div>
          <span className="text-[11px] text-emerald-600 font-code-mono mt-1 block">
            99.8% Normalized Across Blister & Strip Formats
          </span>
        </div>

        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">
            Average Network Latency
          </span>
          <div className="text-2xl font-bold text-[#2563EB] font-display-lg">
            54ms
          </div>
          <span className="text-[11px] text-slate-500 font-code-mono mt-1 block">
            Target SLA: &lt; 200ms at 95th Percentile
          </span>
        </div>

        <div className="p-4 rounded-lg bg-white border border-amber-200 bg-amber-50/40 shadow-2xs">
          <span className="text-amber-800 text-xs font-bold uppercase tracking-wider block mb-1">
            SLA Variance Alert
          </span>
          <div className="text-2xl font-bold text-amber-700 font-display-lg">
            1 Stale Feed
          </div>
          <span className="text-[11px] text-amber-800 font-code-mono mt-1 block">
            Jan Aushadhi PMBI Govt Feed (+12h breached)
          </span>
        </div>
      </div>

      {/* Feed Detail Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Registered Pharmacy Feed Connectors
          </h3>
          <span className="text-xs font-code-mono text-slate-500">
            TLS 1.3 · Mutual Auth Verified
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {feeds.map((feed) => (
            <div key={feed.id} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                  feed.status === 'Healthy' ? 'bg-emerald-500' : feed.status === 'Syncing' ? 'bg-[#2563EB] animate-pulse' : 'bg-amber-500'
                }`}></div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-title-md text-sm text-slate-900 font-bold">
                      {feed.name}
                    </h4>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-code-mono font-semibold border ${
                      feed.status === 'Healthy' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : feed.status === 'Syncing'
                        ? 'bg-blue-50 text-[#2563EB] border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {feed.status}
                    </span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-600 font-code-mono">
                      {feed.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-code-mono mt-1">
                    Endpoint: <span className="text-slate-700">{feed.endpointUrl}</span>
                  </p>
                  {feed.notes && (
                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded mt-2">
                      {feed.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 font-code-mono text-xs text-slate-600">
                <div className="flex flex-col items-end">
                  <span className="text-slate-400 text-[10px] uppercase">SKUs Parsed</span>
                  <span className="font-bold text-slate-900">{feed.skusParsed.toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-slate-400 text-[10px] uppercase">Response Time</span>
                  <span className="font-bold text-slate-900">{feed.avgResponseMs}ms</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-slate-400 text-[10px] uppercase">Error Rate</span>
                  <span className={`font-bold ${feed.errorRatePercent > 0.05 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {feed.errorRatePercent.toFixed(2)}%
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => onRetryFeed(feed.id)}
                    className="px-3 py-1.5 rounded bg-[#2563EB] hover:bg-blue-700 text-white font-code-mono text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-xs">sync</span>
                    <span>{feed.status === 'Stale' ? 'Trigger Retry' : 'Resync'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
