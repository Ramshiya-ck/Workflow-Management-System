import React from "react";
import { Eye } from "lucide-react";
import ReportStatusBadge from "./ReportStatusBadge";

const getStageLabel = (status) => {
  switch (status) {
    case "RECEIVING":
      return "Receiving Stage";
    case "DATA_ENTRY":
      return "Data Entry Queue";
    case "SUPERVISOR":
      return "Supervisor Approval";
    case "DEPARTMENT_MANAGER":
      return "Manager Review";
    case "ACCOUNTS":
      return "Accounts Clearance";
    case "ACCOUNTS_CLEARED":
      return "Cleared";
    case "HOLDING":
      return "Workflow Hold";
    default:
      return "Unknown Stage";
  }
};

const getOwnerLabel = (status) => {
  switch (status) {
    case "RECEIVING":
      return "Receiving Operator";
    case "DATA_ENTRY":
      return "Data Entry Operator";
    case "SUPERVISOR":
      return "Department Supervisor";
    case "DEPARTMENT_MANAGER":
      return "Department Manager";
    case "ACCOUNTS":
      return "Accounts Clerk";
    case "ACCOUNTS_CLEARED":
      return "None (Completed)";
    case "HOLDING":
      return "Audit Desk / Holding Desk";
    default:
      return "Unassigned";
  }
};

const formatCurrency = (amount) => {
  const value = parseFloat(amount);
  if (isNaN(value)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
};

const ReportRow = ({ bill, onViewDetails }) => {
  // Calculate mockup age in days
  const getAgeInDays = (dateString) => {
    const diff = new Date() - new Date(dateString);
    const days = Math.floor(diff / 86400000);
    return Math.max(days, 0);
  };

  const age = getAgeInDays(bill.created_at);

  return (
    <tr className="hover:bg-zinc-50/50 transition-colors border-b border-zinc-100 text-xs">
      {/* Tracking ID */}
      <td className="px-4 py-3.5 font-bold text-zinc-900 whitespace-nowrap">
        {bill.tracking_id}
      </td>

      {/* Vendor */}
      <td className="px-4 py-3.5 font-semibold text-zinc-800 truncate max-w-[120px]" title={bill.vendor_name}>
        {bill.vendor_name}
      </td>

      {/* Department */}
      <td className="px-4 py-3.5 font-medium text-zinc-600 whitespace-nowrap">
        {bill.department_name || "Unassigned"}
      </td>

      {/* Current Status */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <ReportStatusBadge status={bill.current_status} />
      </td>

      {/* Stage */}
      <td className="px-4 py-3.5 text-zinc-500 font-semibold whitespace-nowrap">
        {getStageLabel(bill.current_status)}
      </td>

      {/* Current Owner */}
      <td className="px-4 py-3.5 text-zinc-600 font-medium whitespace-nowrap">
        {getOwnerLabel(bill.current_status)}
      </td>

      {/* Amount */}
      <td className="px-4 py-3.5 font-extrabold text-zinc-900 whitespace-nowrap text-right">
        {formatCurrency(bill.amount)}
      </td>

      {/* Created Date */}
      <td className="px-4 py-3.5 text-zinc-500 font-medium whitespace-nowrap">
        {new Date(bill.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>

      {/* Age */}
      <td className="px-4 py-3.5 whitespace-nowrap text-center">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            age >= 2 || (bill.pending_hours !== undefined && bill.pending_hours >= 48)
              ? "bg-red-50 text-red-700 border border-red-100"
              : "bg-zinc-100 text-zinc-650"
          }`}
        >
          {bill.pending_hours !== undefined ? `${bill.pending_hours} hours` : `${age} ${age === 1 ? "day" : "days"}`}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5 whitespace-nowrap text-center">
        <button
          onClick={() => onViewDetails(bill.id)}
          className="p-1 rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-50 transition-all cursor-pointer"
          title="Review details"
        >
          <Eye className="size-3.5" />
        </button>
      </td>
    </tr>
  );
};

export default React.memo(ReportRow);
export { getStageLabel, getOwnerLabel };
