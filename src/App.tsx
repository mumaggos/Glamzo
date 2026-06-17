import React, { Suspense } from 'react';

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

export default function App() {
  React.useEffect(() => {
    // Remove static LCP on mount
    const staticLcp = document.getElementById('static-lcp');
    if (staticLcp) staticLcp.remove();
  }, []);

  return (
    <Suspense fallback={<RouteLoader />}>
      <MainApp />
    </Suspense>
  );
}
