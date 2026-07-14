import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, User } from "lucide-react";
import WorkflowStatusBadge from "./WorkflowStatusBadge";
import TrackingBadge from "@/features/bills/components/TrackingBadge";

/**
 * Mobile layout card for workflow queue list items.
 */
const WorkflowCard = ({ bill }) => {
  const formattedAmount = `₹${Number(bill.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-4 hover:shadow-md transition-all font-sans select-none relative">
      {/* Top Header */}
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-1">
          <TrackingBadge trackingId={bill.trackingId} />
          <h4 className="text-sm font-bold text-zinc-950 block">{bill.billNumber}</h4>
        </div>
        <WorkflowStatusBadge status={bill.currentStatus} />
      </div>

      {/* Info grids */}
      <div className="grid grid-cols-2 gap-3 text-xs border-y border-zinc-100 py-3">
        <div className="space-y-0.5">
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Vendor</span>
          <span className="text-zinc-800 font-bold block truncate">{bill.vendorName}</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Department</span>
          <span className="text-zinc-700 font-semibold block truncate">{bill.departmentName}</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Created Date</span>
          <div className="flex items-center gap-1 text-zinc-650 font-medium">
            <Calendar className="size-3" />
            <span>{bill.createdDate}</span>
          </div>
        </div>
        <div className="space-y-0.5">
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Invoice Amount</span>
          <span className="text-zinc-950 font-mono font-bold block">{formattedAmount}</span>
        </div>
      </div>

      {/* Owner & Priority footer */}
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-1.5 text-zinc-550 font-semibold">
          <User className="size-3.5" />
          <span>{bill.currentOwner}</span>
        </div>

        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
          bill.priority === "High"
            ? "bg-red-50 text-red-700"
            : bill.priority === "Medium"
            ? "bg-amber-50 text-amber-700"
            : "bg-blue-50 text-blue-700"
        }`}>
          {bill.priority} Priority
        </span>
      </div>

      {/* Actions buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
        <Link to={`/workflow/${bill.id}`} className="flex-1">
          <button className="w-full text-center py-2 px-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer">
            <span>View Details</span>
            <ArrowRight className="size-3.5" />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default React.memo(WorkflowCard);
