import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside React tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-50 p-6 select-none" id="error-boundary-view">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-100 shadow-xl p-8 flex flex-col items-center text-center">
            {/* Elegant Error Icon */}
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>

            {/* Typography */}
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Something went wrong</h1>
            <p className="text-sm text-slate-500 mt-2.5 leading-relaxed">
              We encountered an unexpected rendering exception. This can occur due to local layout conflicts or browser webgl/chart rendering lags.
            </p>

            {/* Error Message Trace for Transparency */}
            {this.state.error && (
              <div className="w-full mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100 text-left font-mono text-[11px] text-slate-600 overflow-x-auto max-h-32">
                <span className="font-bold text-rose-600">Error:</span> {this.state.error.message}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              <button
                onClick={this.handleReset}
                className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload App</span>
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 transition cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
