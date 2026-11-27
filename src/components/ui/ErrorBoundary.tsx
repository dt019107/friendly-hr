import React from 'react';
import { Button, Card } from './Primitives';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || 'Unexpected rendering error' };
  }

  handleResetDemo = () => {
    try {
      localStorage.removeItem('nexora-hr-v1');
    } catch {
      // ignore storage errors
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg-canvas)] p-6">
          <Card className="max-w-md p-6 text-center">
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {this.state.message}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Button variant="secondary" onClick={() => this.setState({ hasError: false, message: '' })}>
                Try again
              </Button>
              <Button variant="primary" onClick={this.handleResetDemo}>
                Reset demo data
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
