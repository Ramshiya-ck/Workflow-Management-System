import React from "react";
import { Inbox } from "lucide-react";

const ReportEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border border-zinc-200 rounded-xl text-center max-w-sm mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-150 text-zinc-400 mb-4">
        <Inbox className="size-6" />
      </div>
      <h3 className="text-sm font-bold text-zinc-900 font-sans">No Report Records Found</h3>
      <p className="text-xs text-zinc-500 font-sans mt-1 leading-relaxed">
        No active bills or workflow metrics match the specified filter criteria in the system logs database.
      </p>
    </div>
  );
};

export default React.memo(ReportEmptyState);
