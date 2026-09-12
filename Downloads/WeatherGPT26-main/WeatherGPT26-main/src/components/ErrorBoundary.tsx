import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, ShieldAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: ReactNode;
  viewName?: string;
  onReset?: () => void;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[ErrorBoundary] Caught error in ${this.props.viewName || 'Component'}:`, error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      try {
        this.props.onReset();
      } catch (err) {
        console.error('[ErrorBoundary] Error during onReset callback:', err);
      }
    }
  };

  private handleFullReset = (): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('weathergpt_telemetry');
        localStorage.removeItem('weathergpt_offline_cache');
      }
    } catch (err) {
      console.warn('[ErrorBoundary] Failed to clear local storage:', err);
    }
    this.handleReset();
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const viewLabel = this.props.viewName ? `${this.props.viewName} View` : 'WeatherGPT Dashboard View';

      return (
        <div className="w-full max-w-4xl mx-auto my-6 p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 rounded-3xl shadow-sm text-zinc-900 dark:text-zinc-100 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-red-100 dark:border-red-900/30 pb-5">
            <div className="p-3.5 bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-800/60 shrink-0">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-full">
                  Isolated View Recovery
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black mt-1">
                Unable to display {viewLabel}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                A rendering or data parsing exception was intercepted. The rest of the application remains fully operational.
              </p>
            </div>
          </div>

          <div className="py-5 space-y-3">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-semibold">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Diagnostic Note:</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">
                {this.state.error?.message || 'An unexpected runtime data exception occurred while evaluating telemetry bindings.'}
              </p>
            </div>

            {this.state.error && (
              <details className="text-xs text-zinc-500 dark:text-zinc-500 cursor-pointer pt-1">
                <summary className="font-semibold hover:text-zinc-700 dark:hover:text-zinc-300 transition">
                  View technical trace details
                </summary>
                <pre className="mt-2 p-3 bg-zinc-100 dark:bg-zinc-950 rounded-xl overflow-x-auto text-[11px] font-mono text-red-600 dark:text-red-400 border border-zinc-200 dark:border-zinc-800">
                  {this.state.error.stack || this.state.error.message}
                </pre>
              </details>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-sm transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry View</span>
            </button>

            <button
              onClick={this.handleFullReset}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-2xl text-xs sm:text-sm font-semibold border border-zinc-200 dark:border-zinc-700 transition-all"
            >
              <RotateCcw className="h-4 w-4 text-zinc-500" />
              <span>Reset Telemetry & Reload</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
