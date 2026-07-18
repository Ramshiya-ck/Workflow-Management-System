import React from "react";
import { Edit2, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import TrackingBadge from "./TrackingBadge";

/**
 * Mobile-responsive card layout block for bills listings.
 */
const BillCard = ({ bill, onEdit, onDelete, canEdit, canDelete }) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5 space-y-4 font-sans text-xs flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <Link
              to={`/bills/${bill.id}`}
              className="font-bold text-zinc-900 leading-tight hover:underline cursor-pointer block"
            >
              {bill.billNumber}
            </Link>
            <TrackingBadge trackingId={bill.trackingId} />
          </div>
          <StatusBadge status={bill.currentStatus} />
        </div>
      </div>

      <div className="space-y-1.5 text-zinc-500 font-medium">
        <div className="flex justify-between">
          <span>Vendor:</span>
          <span className="font-semibold text-zinc-700">{bill.vendorName || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span>Department:</span>
          <span className="font-semibold text-zinc-700">{bill.departmentName || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span>Amount:</span>
          <span className="font-bold text-zinc-900 font-mono">{bill.amount}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-zinc-400">
        <span className="text-[9px] font-bold uppercase tracking-wider">Date: {bill.billDate}</span>

        <div className="flex gap-1">
          <Link
            to={`/bills/${bill.id}`}
            className="p-1.5 rounded-md hover:bg-zinc-100 hover:text-zinc-800 transition-all cursor-pointer"
            title="View Details"
          >
            <Eye className="size-3.5" />
          </Link>
          {canEdit && (
            <button
              onClick={() => onEdit(bill)}
              className="p-1.5 rounded-md hover:bg-zinc-100 hover:text-zinc-800 transition-all cursor-pointer"
              title="Edit"
            >
              <Edit2 className="size-3.5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(bill)}
              className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-650 transition-all cursor-pointer"
              title="Delete"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(BillCard);
