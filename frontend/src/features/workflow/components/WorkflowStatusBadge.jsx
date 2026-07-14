import React from "react";

const STATUS_CONFIGS = {
  RECEIVING: {
    label: "Receiving",
    bg: "bg-blue-50 border-blue-150 text-blue-700",
    dot: "bg-blue-500",
  },
  DATA_ENTRY: {
    label: "Data Entry",
    bg: "bg-purple-50 border-purple-150 text-purple-700",
    dot: "bg-purple-500",
  },
  SUPERVISOR: {
    label: "Supervisor Approval",
    bg: "bg-indigo-50 border-indigo-150 text-indigo-700",
    dot: "bg-indigo-500",
  },
  DEPARTMENT_MANAGER: {
    label: "Manager Approval",
    bg: "bg-pink-50 border-pink-150 text-pink-700",
    dot: "bg-pink-500",
  },
  ACCOUNTS: {
    label: "Accounts Clearance",
    bg: "bg-amber-50 border-amber-150 text-amber-700",
    dot: "bg-amber-500",
  },
  ACCOUNTS_CLEARED: {
    label: "Approved",
    bg: "bg-emerald-50 border-emerald-150 text-emerald-700",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-rose-50 border-rose-150 text-rose-700",
    dot: "bg-rose-500",
  },
  HOLDING: {
    label: "On Hold",
    bg: "bg-orange-50 border-orange-150 text-orange-700 animate-pulse",
    dot: "bg-orange-500",
  },
};

/**
 * Enterprise workflow stage indicator.
 */
const WorkflowStatusBadge = ({ status }) => {
  const config = STATUS_CONFIGS[status] || {
    label: status,
    bg: "bg-zinc-50 border-zinc-150 text-zinc-700",
    dot: "bg-zinc-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.bg}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

export default React.memo(WorkflowStatusBadge);
