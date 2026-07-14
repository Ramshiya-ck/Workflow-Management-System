import React from "react";
import { Edit2, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import TrackingBadge from "./TrackingBadge";

/**
 * Standard table row layout for invoice records.
 */
const BillRow = ({ bill, onEdit, onDelete }) => {
  return (
    <tr className="hover:bg-zinc-50/50 transition-colors border-b border-zinc-100 last:border-0 font-sans text-xs">
      {/* Tracking ID */}
      <td className="p-4 align-middle">
        <TrackingBadge trackingId={bill.trackingId} />
      </td>

      {/* Bill Number */}
      <td className="p-4 align-middle">
        <Link
          to={`/bills/${bill.id}`}
          className="font-bold text-zinc-900 hover:text-zinc-950 hover:underline cursor-pointer"
        >
          {bill.billNumber}
        </Link>
      </td>

      {/* Vendor */}
      <td className="p-4 align-middle text-zinc-700 font-medium">
        {bill.vendorName || "N/A"}
      </td>

      {/* Department */}
      <td className="p-4 align-middle text-zinc-700 font-medium">
        {bill.departmentName || "N/A"}
      </td>

      {/* Bill Date */}
      <td className="p-4 align-middle text-zinc-400 font-semibold font-mono">
        {bill.billDate}
      </td>

      {/* Amount */}
      <td className="p-4 align-middle text-zinc-900 font-bold font-mono">
        {bill.amount}
      </td>

      {/* Status Badge */}
      <td className="p-4 align-middle">
        <StatusBadge status={bill.currentStatus} />
      </td>

      {/* Created By */}
      <td className="p-4 align-middle text-zinc-500 font-medium">
        {bill.createdBy || "System"}
      </td>

      {/* Created Date */}
      <td className="p-4 align-middle text-zinc-400 font-semibold">
        {bill.createdDate || "N/A"}
      </td>

      {/* Actions */}
      <td className="p-4 align-middle text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/bills/${bill.id}`}
            className="p-1.5 rounded-md text-zinc-455 hover:bg-zinc-100 hover:text-zinc-800 transition-all cursor-pointer"
            title="View Details"
          >
            <Eye className="size-3.5" />
          </Link>
          <button
            onClick={() => onEdit(bill)}
            className="p-1.5 rounded-md text-zinc-455 hover:bg-zinc-100 hover:text-zinc-800 transition-all cursor-pointer"
            title="Edit Bill"
          >
            <Edit2 className="size-3.5" />
          </button>
          <button
            onClick={() => onDelete(bill)}
            className="p-1.5 rounded-md text-zinc-455 hover:bg-red-50 hover:text-red-650 transition-all cursor-pointer"
            title="Delete Bill"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default React.memo(BillRow);
