import React from "react";
import Skeleton from "@/components/common/Skeleton";

/**
 * Loading skeletons placeholder for both Table queue lists and details boards.
 */
const WorkflowSkeleton = ({ view = "table" }) => {
  if (view === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-white border border-zinc-200 rounded-xl p-4 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-32" />
            <div className="space-y-2 border-y border-zinc-100 py-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-zinc-200">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="divide-y divide-zinc-200 p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="flex items-center justify-between py-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(WorkflowSkeleton);
