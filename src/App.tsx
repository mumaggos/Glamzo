import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react';

console.log("app loaded");

const MainApp = React.lazy(() => import('./MainApp'));

function RouteLoader() {
  return (
    <div className="flex-1 w-full min-h-[45vh] flex items-center justify-center p-6 text-slate-600 select-none">
      <div className="flex flex-col items-center gap-2.5">
        <div className="w-5 h-5 border-2 border-purple-500/25 border-t-purple-500 rounded-full animate-spin" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 font-mono">Glamzo</span>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Auto-reload once if it's a chunk load error
    const isChunkLoadError = error.name === 'ChunkLoadError' || 
                             error.message.includes('fetch dynamically imported module') ||
                             error.message.includes('Failed to fetch dynamically imported module') ||
                             error.message.includes('Importing a module script failed');
                             
    if (isChunkLoadError) {
      const reloaded = sessionStorage.getItem('glamzo_chunk_reloaded');
      if (!reloaded) {
        sessionStorage.setItem('glamzo_chunk_reloaded', 'true');
        // Unregister service workers just in case
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) {
              registration.unregister();
            }
            window.location.reload();
          });
        } else {
          window.location.reload();
        }
      }
    }
  }

  handleReload = () => {
    sessionStorage.removeItem('glamzo_chunk_reloaded');
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
          registration.unregister();
        }
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-red-50 text-red-900 font-sans">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-red-200 text-center">
            <h1 className="text-2xl font-bold mb-4 text-slate-800">Atualização Disponível</h1>
            <p className="text-sm text-slate-600 mb-6">
              A aplicação foi atualizada. Por favor, recarregue a página para obter a versão mais recente.
            </p>
            <button 
              onClick={this.handleReload}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-purple-200"
            >
              Recarregar Aplicação
            </button>
            
            {/* Hidden diagnostic info */}
            <div className="mt-8 text-left">
              <details className="text-xs text-slate-400">
                <summary className="cursor-pointer hover:text-slate-600">Detalhes Técnicos</summary>
                <div className="mt-2 p-3 bg-slate-50 text-slate-500 rounded border border-slate-200 overflow-auto max-h-32">
                  {this.state.error?.message}
                </div>
              </details>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  React.useEffect(() => {
    // Remove static LCP on mount
    const staticLcp = document.getElementById('static-lcp');
    if (staticLcp) staticLcp.remove();
  }, []);

  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteLoader />}>
        <MainApp />
      </Suspense>
    </ErrorBoundary>
  );
}

