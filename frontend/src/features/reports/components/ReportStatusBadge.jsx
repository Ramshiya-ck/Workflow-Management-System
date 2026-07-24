import React from "react";

const STATUS_CONFIGS = {
  RECEIVING: {
    label: "Draft",
    bg: "bg-zinc-50 border-zinc-200 text-zinc-600",
  },
  DATA_ENTRY: {
    label: "Received",
    bg: "bg-blue-50 border-blue-150 text-blue-800",
  },
  SUPERVISOR: {
    label: "Data Entry Done",
    bg: "bg-purple-50 border-purple-150 text-purple-800",
  },
  DEPARTMENT_MANAGER: {
    label: "Supervisor Approved",
    bg: "bg-amber-50 border-amber-150 text-amber-800",
  },
  ACCOUNTS: {
    label: "Manager Approved",
    bg: "bg-indigo-50 border-indigo-150 text-indigo-800",
  },
  ACCOUNTS_CLEARED: {
    label: "Accounts Cleared",
    bg: "bg-emerald-50 border-emerald-150 text-emerald-800",
  },
  HOLDING: {
    label: "Holding",
    bg: "bg-rose-50 border-rose-150 text-rose-800",
  },
};

const ReportStatusBadge = ({ status }) => {
  const config = STATUS_CONFIGS[status] || {
    label: status || "Unknown",
    bg: "bg-zinc-50 border-zinc-150 text-zinc-500",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border select-none ${config.bg}`}
    >
      <span className="h-1 w-1 rounded-full bg-current mr-1" />
      <span>{config.label}</span>
    </span>
  );
};

export default React.memo(ReportStatusBadge);
