'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (process.env.NODE_ENV !== 'production') {
      console.error('UI error boundary caught', error, info);
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { children, fallback } = this.props;
    const { error } = this.state;

    if (error) {
      if (fallback) {
        return fallback(error, this.reset);
      }

      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          <p className="font-semibold">Что-то пошло не так</p>
          <p className="text-xs text-red-600">{error.message}</p>
          <button
            type="button"
            onClick={this.reset}
            className="rounded-full border border-red-300 px-4 py-2 text-xs font-semibold text-red-600"
          >
            Попробовать снова
          </button>
        </div>
      );
    }

    return children;
  }
}
