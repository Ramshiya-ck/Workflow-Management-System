import React from "react";
import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Filter group holding drop downs for quick sorting and state filtering.
 */
const FiltersBar = ({
  status,
  sortBy,
  onStatusChange,
  onSortChange,
  onReset,
}) => {
  const isFiltered = status !== "all" || sortBy !== "name-asc";

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 font-sans text-xs select-none">
      {/* Icon Badge */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-50 border border-zinc-200/80 rounded-lg text-zinc-500 font-semibold shrink-0">
        <Filter className="size-3.5" />
        <span>Filters</span>
      </div>

      {/* Status Filter */}
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="bg-white border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-zinc-950 text-zinc-700 cursor-pointer"
      >
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      {/* Sort Options */}
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="bg-white border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-zinc-950 text-zinc-700 cursor-pointer"
      >
        <option value="name-asc">Name (A-Z)</option>
        <option value="name-desc">Name (Z-A)</option>
        <option value="code-asc">Code (A-Z)</option>
        <option value="created-desc">Date Created (Newest)</option>
        <option value="created-asc">Date Created (Oldest)</option>
      </select>

      {/* Reset Action */}
      {isFiltered && (
        <Button
          variant="ghost"
          onClick={onReset}
          className="cursor-pointer gap-1.5 px-3 py-2 text-zinc-450 hover:text-zinc-800 text-xs h-auto"
        >
          <RotateCcw className="size-3.5" />
          <span>Reset</span>
        </Button>
      )}
    </div>
  );
};

export default React.memo(FiltersBar);
