import React, { useState, useEffect } from 'react';

const CONSENT_KEY = 'sastarx_cookie_consent';

type ConsentState = 'pending' | 'accepted' | 'declined';

export const CookieConsentBanner: React.FC = () => {
  const [consent, setConsent] = useState<ConsentState>('pending');
  const [showDetails, setShowDetails] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored === 'accepted' || stored === 'declined') {
        setConsent(stored as ConsentState);
      }
    } catch {
      // localStorage unavailable — show banner
    }
    setMounted(true);
  }, []);

  const handleAccept = () => {
    try { localStorage.setItem(CONSENT_KEY, 'accepted'); } catch {}
    setConsent('accepted');
  };

  const handleDecline = () => {
    try { localStorage.setItem(CONSENT_KEY, 'declined'); } catch {}
    setConsent('declined');
  };

  // Don't render until we've checked localStorage (avoids flash)
  if (!mounted || consent !== 'pending') return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie and data consent"
      className="fixed bottom-10 left-4 right-4 md:left-auto md:right-6 md:w-[440px] z-[60] bg-[#0F172A] border border-[#334155] rounded-xl shadow-2xl p-4 animate-in slide-in-from-bottom-3 duration-300"
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="material-symbols-outlined text-blue-400 text-lg shrink-0 mt-0.5">cookie</span>
        <div>
          <h3 className="font-bold text-sm text-white mb-1">
            Data & Cookie Preferences
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            medi AI / SastaRx uses essential session cookies and local storage for authentication and
            personalisation. No third-party advertising trackers are used.
          </p>
        </div>
      </div>

      {/* Cookie categories */}
      {showDetails && (
        <div className="mb-3 space-y-2 text-xs">
          {[
            {
              name: 'Essential (Always Active)',
              desc: 'Authentication tokens, tenant session, and UI preferences. Cannot be disabled.',
              active: true,
              locked: true,
            },
            {
              name: 'Analytics (Optional)',
              desc: 'Anonymised Web Vitals performance data for platform improvement. No PII shared.',
              active: (consent as string) !== 'declined',
              locked: false,
            },
          ].map(cat => (
            <div
              key={cat.name}
              className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-[#1E293B] border border-[#334155]"
            >
              <div>
                <div className="font-semibold text-slate-200">{cat.name}</div>
                <p className="text-slate-400 mt-0.5">{cat.desc}</p>
              </div>
              <span
                className={`shrink-0 mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded font-code-mono ${
                  cat.locked
                    ? 'bg-slate-700 text-slate-300'
                    : cat.active
                    ? 'bg-emerald-900 text-emerald-300 border border-emerald-700'
                    : 'bg-red-900 text-red-300 border border-red-700'
                }`}
              >
                {cat.locked ? 'Required' : cat.active ? 'On' : 'Off'}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setShowDetails(v => !v)}
          className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer transition-colors"
        >
          {showDetails ? 'Hide details' : 'Cookie details'}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDecline}
            className="px-3 py-1.5 rounded-lg border border-[#334155] text-slate-300 hover:bg-[#1E293B] text-xs font-semibold cursor-pointer transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={handleAccept}
            className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-slate-500 font-code-mono">
        DISHA §8 / GDPR Art.13 compliant ·{' '}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('openPrivacyPolicy'))}
          className="underline hover:text-slate-300 cursor-pointer"
        >
          Privacy Policy
        </button>
        {' · '}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('openTermsOfService'))}
          className="underline hover:text-slate-300 cursor-pointer"
        >
          Terms of Service
        </button>
      </p>
    </div>
  );
};
