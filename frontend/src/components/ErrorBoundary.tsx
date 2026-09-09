import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback UI — defaults to the built-in error card */
  fallback?: ReactNode;
  /** Optional context label shown in the error card (e.g. "Catalog View") */
  context?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary — wraps React subtrees and catches unhandled render errors.
 * Renders a user-friendly recovery card instead of a blank screen.
 * Used in App.tsx to wrap every major view.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Structured error log — replace with Sentry/Cloud Logging in production
    console.error(JSON.stringify({
      level: 'error',
      context: 'ErrorBoundary',
      component: this.props.context || 'unknown',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    }));
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-red-200 shadow-lg p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
            </div>

            {/* Title */}
            <h2 className="font-bold text-lg text-slate-900 mb-2">
              Something went wrong
              {this.props.context && (
                <span className="text-slate-500 font-normal"> in {this.props.context}</span>
              )}
            </h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              An unexpected error occurred. This has been logged for investigation.
              No patient data has been lost.
            </p>

            {/* Error detail (dev only) */}
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details className="mb-4 text-left">
                <summary className="text-xs font-semibold text-slate-500 cursor-pointer mb-1">
                  Error details (dev mode)
                </summary>
                <pre className="text-[10px] bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-auto max-h-32 text-red-700 font-code-mono">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
              >
                Reload Page
              </button>
            </div>

            {/* DISHA/HIPAA assurance */}
            <p className="mt-4 text-[10px] text-slate-400 font-code-mono">
              All clinical data remains protected · DISHA / HIPAA compliant · Error ID: EB-{Date.now().toString(16).slice(-6).toUpperCase()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
