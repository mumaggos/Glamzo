import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fef2f2', color: '#991b1b', border: '1px solid #f87171', borderRadius: '8px', margin: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Algo correu mal</h2>
          <pre style={{ marginTop: '10px', fontSize: '12px', whiteSpace: 'pre-wrap' }}>{this.state.error?.message}</pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '15px', padding: '8px 16px', background: '#991b1b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
