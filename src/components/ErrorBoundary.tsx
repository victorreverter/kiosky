import { Component, ErrorInfo, ReactNode } from "react";
import { ShieldAlert, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Integrate with error reporting service (e.g., Sentry, LogRocket)
    // In production, you would report errors to your monitoring service
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-6">
          <div className="max-w-md w-full bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <ShieldAlert className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                Something went wrong
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 mb-6">
              <p className="text-sm font-mono text-zinc-700 dark:text-zinc-300 break-all">
                {this.state.error.message}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                type="button"
              >
                <RefreshCw size={20} />
                Reload Page
              </button>
              
              <button
                onClick={this.handleReset}
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                type="button"
              >
                <Home size={20} />
                Go Home
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                If this problem persists, please clear your browser's local storage.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
