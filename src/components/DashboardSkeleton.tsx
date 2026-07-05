import React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Skeleton */}
      <div className="w-full md:w-64 bg-white border-r border-slate-200 h-16 md:h-screen p-4 flex flex-row md:flex-col justify-between md:justify-start gap-4">
        <div className="w-32 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="hidden md:flex flex-col gap-2 mt-8">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="w-full h-10 bg-slate-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
      
      {/* Main Content Skeleton */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6 mt-8 md:mt-0">
          <div className="flex justify-between items-center">
            <div className="w-48 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="w-32 h-10 bg-slate-200 rounded-xl animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-full h-24 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse"></div>
            ))}
          </div>

          <div className="w-full h-64 bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse mt-8"></div>
        </div>
      </div>
    </div>
  );
}
