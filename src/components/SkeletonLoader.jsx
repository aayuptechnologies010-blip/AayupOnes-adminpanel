import React from 'react';

// Card Skeleton
export const SkeletonCard = () => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse space-y-3">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl bg-slate-200"></div>
      <div className="w-12 h-4 rounded-md bg-slate-200"></div>
    </div>
    <div className="w-20 h-7 rounded-lg bg-slate-200"></div>
    <div className="w-28 h-4 rounded-md bg-slate-200"></div>
    <div className="w-16 h-4 rounded-md bg-slate-200"></div>
  </div>
);

// Table Skeleton
export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
    <div className="h-12 bg-slate-100 border-b border-slate-200 px-6 flex items-center gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-300 rounded flex-1"></div>
      ))}
    </div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="p-4 px-6 flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0"></div>
          {Array.from({ length: cols - 1 }).map((_, c) => (
            <div key={c} className="h-4 bg-slate-200 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Chart Skeleton
export const SkeletonChart = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-4">
    <div className="flex items-center justify-between">
      <div className="w-36 h-5 bg-slate-200 rounded-md"></div>
      <div className="w-20 h-4 bg-slate-200 rounded-md"></div>
    </div>
    <div className="h-60 bg-slate-100 rounded-xl flex items-end gap-3 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div 
          key={i} 
          className="bg-slate-200 rounded-t-lg flex-1"
          style={{ height: `${20 + Math.random() * 70}%` }}
        ></div>
      ))}
    </div>
  </div>
);

export default { SkeletonCard, SkeletonTable, SkeletonChart };

