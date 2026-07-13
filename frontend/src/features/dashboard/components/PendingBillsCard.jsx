import React from "react";
import { ArrowRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * List of pending bills awaiting workflow action by the current user.
 */
const PendingBillsCard = ({ bills = [] }) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5 space-y-4 font-sans select-none">
      <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
        <h3 className="text-sm font-bold text-zinc-900">Awaiting My Action</h3>
        <Link to="/workflow" className="text-xs text-zinc-400 font-semibold flex items-center gap-1 hover:underline">
          <span>Review Board</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {bills.length === 0 ? (
        <p className="text-xs text-zinc-400 text-center py-6 font-medium">No pending bills for your action.</p>
      ) : (
        <div className="divide-y divide-zinc-100">
          {bills.map((bill, index) => (
            <div key={index} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-200/60 text-zinc-400">
                  <FileText className="size-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-800 block">{bill.billNumber}</span>
                  <span className="text-[10px] text-zinc-400 font-semibold block">{bill.vendorName}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-zinc-950 block">{bill.amount}</span>
                <span className="inline-flex items-center rounded-full bg-zinc-50 border border-zinc-200/60 px-2 py-0.5 text-[9px] font-bold text-zinc-500 mt-0.5">
                  {bill.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(PendingBillsCard);
