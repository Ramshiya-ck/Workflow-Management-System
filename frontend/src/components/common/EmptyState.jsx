import React from "react";
import { FolderOpen } from "lucide-react";

/**
 * Reusable card block indicating missing collections or empty search results.
 */
const EmptyState = ({
  title = "No records found",
  description = "There are no pending actions or records matching this segment.",
  icon: Icon = FolderOpen,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-zinc-200 rounded-xl text-center max-w-sm mx-auto my-6 select-none font-sans">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-400 mb-4">
        <Icon className="size-6" />
      </div>
      <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default React.memo(EmptyState);
