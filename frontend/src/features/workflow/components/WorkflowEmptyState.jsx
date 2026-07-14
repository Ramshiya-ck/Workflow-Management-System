import React from "react";
import { FolderKanban, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Placeholder card shown when there are no workflow queue records matching filters.
 */
const WorkflowEmptyState = ({ onReset, hasFilters }) => {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center max-w-md mx-auto my-6 font-sans shadow-sm select-none">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-150 text-zinc-400 mx-auto mb-4">
        <FolderKanban className="size-6" />
      </div>
      <h3 className="text-sm font-bold text-zinc-900">
        No Invoices in Queue
      </h3>
      <p className="text-xs text-zinc-500 mt-1 mb-6 leading-relaxed">
        {hasFilters
          ? "No workflow records match the active search parameters or filters. Try clearing filters."
          : "There are currently no supplier invoice logs waiting for approval levels. You are completely caught up!"}
      </p>

      {hasFilters && (
        <Button
          onClick={onReset}
          variant="outline"
          className="text-xs gap-2 border border-zinc-200 mx-auto cursor-pointer"
        >
          <RotateCcw className="size-3.5" />
          <span>Reset Filters</span>
        </Button>
      )}
    </div>
  );
};

export default React.memo(WorkflowEmptyState);
