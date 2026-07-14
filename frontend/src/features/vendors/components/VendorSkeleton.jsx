import React from "react";
import Skeleton from "@/components/common/Skeleton";

/**
 * Pre-render loading placeholders for vendors data frames.
 */
const VendorSkeleton = ({ view = "table" }) => {
  if (view === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-zinc-200/80 p-5 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.015)] animate-pulse">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <Skeleton className="h-6 w-full" />
            <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
      <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex gap-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/12" />
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-4 w-1/12" />
        <Skeleton className="h-4 w-1/12" />
        <Skeleton className="h-4 w-1/6" />
      </div>
      <div className="divide-y divide-zinc-100 p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-4 w-1/12" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/12" />
            <Skeleton className="h-4 w-1/12" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-6 w-12 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(VendorSkeleton);
