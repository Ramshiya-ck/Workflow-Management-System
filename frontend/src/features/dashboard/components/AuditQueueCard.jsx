import React from "react";
import { AlertCircle, Clock, Filter, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_LABELS = {
  RECEIVING: "Receiving",
  DATA_ENTRY: "Data Entry",
  SUPERVISOR: "Supervisor Approval",
  DEPARTMENT_MANAGER: "Manager Approval",
  ACCOUNTS: "Accounts",
  HOLDING: "On Hold",
};

const isAgingStuck = (createdAt) => {
  if (!createdAt) return false;
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffHours = (now - createdDate) / (1000 * 60 * 60);
  return diffHours > 48;
};

const AuditQueueCard = ({
  bills = [],
  deptFilter,
  onDeptFilterChange,
  statusFilter,
  onStatusFilterChange,
  departments = [],
}) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5 space-y-4 font-sans select-none">
      
      {/* Header and filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-100 pb-4 gap-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-900">Workflow Monitoring Queue</h3>
          <p className="text-[11px] text-zinc-400 font-medium">Real-time status tracking and bottleneck detection.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Department Filter */}
          <div className="relative">
            <select
              value={deptFilter}
              onChange={(e) => onDeptFilterChange(e.target.value)}
              className="text-[11px] font-semibold bg-zinc-50 border border-zinc-200 rounded-lg py-1.5 pl-2 pr-6 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-sans cursor-pointer h-8 appearance-none text-zinc-700"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-2.5 h-3 w-3 text-zinc-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="text-[11px] font-semibold bg-zinc-50 border border-zinc-200 rounded-lg py-1.5 pl-2 pr-6 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-sans cursor-pointer h-8 appearance-none text-zinc-700"
            >
              <option value="">All Stages</option>
              <option value="RECEIVING">Receiving</option>
              <option value="DATA_ENTRY">Data Entry</option>
              <option value="SUPERVISOR">Supervisor Approval</option>
              <option value="DEPARTMENT_MANAGER">Manager Approval</option>
              <option value="ACCOUNTS">Accounts</option>
              <option value="HOLDING">On Hold</option>
            </select>
            <Filter className="absolute right-2 top-2.5 h-3 w-3 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Queue list */}
      {bills.length === 0 ? (
        <p className="text-xs text-zinc-400 text-center py-8 font-medium">No pending bills match the active filters.</p>
      ) : (
        <div className="divide-y divide-zinc-150/60 max-h-[420px] overflow-y-auto pr-1">
          {bills.map((bill) => {
            const stuck = isAgingStuck(bill.created_at);
            return (
              <div
                key={bill.id}
                className={`py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3 rounded-lg my-1 transition-all ${
                  stuck
                    ? "bg-red-50/40 border border-red-100 hover:bg-red-50/70"
                    : "hover:bg-zinc-50/50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-800">{bill.bill_number}</span>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase bg-zinc-100 px-1.5 py-0.5 rounded">
                        {bill.tracking_id}
                      </span>
                      {stuck && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                          <AlertCircle className="size-2.5" />
                          Stuck &gt; 48h
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-zinc-400 font-semibold flex-wrap">
                      <span>{bill.vendor?.name || "Unknown"}</span>
                      <span>•</span>
                      <span>{bill.department?.name || "Unassigned"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-black text-zinc-950 block">
                      ₹{Number(bill.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-zinc-450 font-semibold block mt-0.5">
                      Stage: <span className="font-bold text-zinc-700">{STATUS_LABELS[bill.current_status] || bill.current_status}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/workflow/${bill.id}`}
                      className="p-1 rounded bg-zinc-50 border border-zinc-200/60 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-all"
                      title="Inspect Logs & Timeline"
                    >
                      <Eye className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(AuditQueueCard);
