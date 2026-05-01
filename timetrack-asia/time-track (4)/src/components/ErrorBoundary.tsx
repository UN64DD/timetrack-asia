import { Component, ErrorInfo, ReactNode } from 'react';
import { ReloadCW, AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error Boundary caught:', error, errorInfo);
  }

  handleReload = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#0a0a0a] border border-red-500/20 rounded-[2.5rem] p-8 text-center">
            <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-display font-black uppercase tracking-tighter text-white mb-4">
              System Error
            </h2>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleReload}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 transition-all"
            >
              <RelaodCW size={14} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
