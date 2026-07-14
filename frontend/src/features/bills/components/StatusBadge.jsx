import React from "react";

/**
 * Maps workflow status codes to visual badge designs.
 */
const STATUS_CONFIGS = {
  PENDING: { label: "Pending", style: "bg-zinc-50 text-zinc-450 border-zinc-150" },
  RECEIVING: { label: "Receiving", style: "bg-blue-50 text-blue-700 border-blue-100" },
  DATA_ENTRY: { label: "Data Entry", style: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  SUPERVISOR: { label: "Supervisor Approval", style: "bg-amber-50 text-amber-700 border-amber-100" },
  DEPARTMENT_MANAGER: { label: "Manager Approval", style: "bg-orange-50 text-orange-700 border-orange-100" },
  ACCOUNTS: { label: "Accounts", style: "bg-sky-50 text-sky-700 border-sky-100" },
  ACCOUNTS_CLEARED: { label: "Approved", style: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  REJECTED: { label: "Rejected", style: "bg-red-50 text-red-700 border-red-100" },
};

const StatusBadge = ({ status }) => {
  const normalized = status ? status.toUpperCase() : "PENDING";
  const config = STATUS_CONFIGS[normalized] || STATUS_CONFIGS.PENDING;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${config.style}`}
    >
      {config.label}
    </span>
  );
};

export default React.memo(StatusBadge);
export { STATUS_CONFIGS };
