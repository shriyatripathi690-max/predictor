import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SafeRoad AI Component Error intercepted by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="charcoal-card rounded-2xl border border-red-500/30 p-6 bg-red-950/20 text-center my-4">
          <div className="inline-flex p-3 rounded-full bg-red-500/10 text-red-400 mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            {this.props.title || 'Component Recovery Mode'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            {this.state.error?.message || 'A temporary rendering anomaly was intercepted safely.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold hover:bg-brand-orangeLight transition inline-flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restore Component</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
