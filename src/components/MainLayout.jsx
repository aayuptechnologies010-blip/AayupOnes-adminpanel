import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { SkeletonCard, SkeletonChart, SkeletonTable } from './SkeletonLoader';

const PageLoadingFallback = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <SkeletonChart />
      </div>
      <div>
        <SkeletonChart />
      </div>
    </div>
    <SkeletonTable rows={4} cols={5} />
  </div>
);

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Fixed Non-Collapsing Sidebar */}
      <Sidebar />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Skeleton Loader on page change */}
          <Suspense fallback={<PageLoadingFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

