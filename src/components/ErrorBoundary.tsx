import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { captureError } from '../lib/monitoring';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, eventId: null };

  static getDerivedStateFromError(): State {
    return { hasError: true, eventId: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureError(error, `ErrorBoundary:${info.componentStack?.split('\n')[1]?.trim() ?? 'unknown'}`);
  }

  handleReset = () => {
    this.setState({ hasError: false, eventId: null });
    window.location.hash = '';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-8 text-center">
          <div className="max-w-md">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-7 h-7 text-red-500" />
            </div>
            <h1 className="font-headline font-black text-2xl text-green-900 mb-3">
              Something went wrong
            </h1>
            <p className="text-stone-500 text-base leading-relaxed mb-8">
              An unexpected error occurred. Our team has been notified. Please try refreshing the page.
            </p>
            <button
              onClick={this.handleReset}
              className="bg-green-900 text-white font-bold px-8 py-3.5 rounded-xl hover:scale-105 transition-transform inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
