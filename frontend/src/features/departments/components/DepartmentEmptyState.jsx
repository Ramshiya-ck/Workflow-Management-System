import React from "react";
import { Inbox, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Visual feedback fallback displayed when search parameters yield empty matches.
 */
const DepartmentEmptyState = ({ onReset, hasFilters }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border border-zinc-200/80 rounded-xl text-center max-w-sm mx-auto my-6 font-sans select-none">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-200/60 text-zinc-400 mb-4 animate-pulse">
        <Inbox className="size-6" />
      </div>
      <h3 className="text-sm font-bold text-zinc-900">No Departments Found</h3>
      <p className="text-xs text-zinc-450 mt-1 leading-relaxed">
        {hasFilters
          ? "No store departments match the selected search terms or filters. Try adjusting values."
          : "There are no department listings registered in the workspace system yet."}
      </p>
      {hasFilters && (
        <Button onClick={onReset} variant="outline" className="mt-4 cursor-pointer gap-1.5 text-xs border-zinc-200">
          <RotateCcw className="size-3.5" />
          <span>Clear Filters</span>
        </Button>
      )}
    </div>
  );
};

export default React.memo(DepartmentEmptyState);
