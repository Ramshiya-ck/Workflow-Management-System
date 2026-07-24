import React from "react";
import Skeleton from "@/components/common/Skeleton";

const ReportSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-2.5 w-full" />
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
        </div>
      </div>

      {/* Chart mockups skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12 text-right" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ReportSkeleton);
