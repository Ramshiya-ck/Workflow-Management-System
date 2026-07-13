import React from "react";
import { PlusCircle, ClipboardCheck, FileSpreadsheet, History } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Grid of action triggers for administrative tasks.
 */
const QuickActionsCard = ({ onCreateBill, onReviewWorkflow, onExportReports, onAuditLogs }) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5 space-y-4 font-sans select-none">
      <div className="border-b border-zinc-100 pb-3">
        <h3 className="text-sm font-bold text-zinc-900">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Button
          variant="outline"
          onClick={onCreateBill}
          className="flex flex-col items-center justify-center p-4 h-auto text-center gap-2 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 rounded-xl cursor-pointer"
        >
          <PlusCircle className="size-5 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
          <span className="text-xs font-bold">New Bill Invoice</span>
        </Button>

        <Button
          variant="outline"
          onClick={onReviewWorkflow}
          className="flex flex-col items-center justify-center p-4 h-auto text-center gap-2 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 rounded-xl cursor-pointer"
        >
          <ClipboardCheck className="size-5 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
          <span className="text-xs font-bold">Review Pipeline</span>
        </Button>

        <Button
          variant="outline"
          onClick={onExportReports}
          className="flex flex-col items-center justify-center p-4 h-auto text-center gap-2 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 rounded-xl cursor-pointer"
        >
          <FileSpreadsheet className="size-5 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
          <span className="text-xs font-bold">Export Reports</span>
        </Button>

        <Button
          variant="outline"
          onClick={onAuditLogs}
          className="flex flex-col items-center justify-center p-4 h-auto text-center gap-2 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 rounded-xl cursor-pointer"
        >
          <History className="size-5 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
          <span className="text-xs font-bold">System Audit Logs</span>
        </Button>
      </div>
    </div>
  );
};

export default React.memo(QuickActionsCard);
