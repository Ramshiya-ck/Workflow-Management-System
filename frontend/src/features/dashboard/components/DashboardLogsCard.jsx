import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Eye, RotateCcw, AlertTriangle, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/features/departments/components/SearchBar";
import WorkflowStatusBadge from "@/features/workflow/components/WorkflowStatusBadge";
import WorkflowSkeleton from "@/features/workflow/components/WorkflowSkeleton";
import { useWorkflowLogs } from "@/features/workflow/hooks/useWorkflowLogs";

const ACTION_LABELS = {
  SUBMIT: { text: "Submit", style: "bg-blue-50 text-blue-700 border-blue-100" },
  APPROVE: { text: "Approve", style: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  REJECT: { text: "Reject", style: "bg-rose-50 text-rose-700 border-rose-100" },
  HOLD: { text: "Hold", style: "bg-amber-50 text-amber-700 border-amber-100" },
  RESUME: { text: "Resume", style: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  REASSIGN: { text: "Reassign", style: "bg-zinc-50 text-zinc-700 border-zinc-200" },
};

const DashboardLogsCard = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => handler && clearTimeout(handler);
  }, [search]);

  // Build query params
  const queryParams = useMemo(() => ({
    page,
    search: debouncedSearch.trim() || undefined,
    page_size: 5,
  }), [page, debouncedSearch]);

  const { data: logsResponse, isLoading, error } = useWorkflowLogs(queryParams);

  const handleResetFilters = useCallback(() => {
    setSearch("");
    setPage(1);
  }, []);

  const logs = logsResponse?.data?.results || [];
  const count = logsResponse?.data?.count || 0;
  const totalPages = Math.ceil(count / 5) || 1;

  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5 space-y-4 font-sans select-none">
      
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-4 gap-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-900">System Workflow History Logs</h3>
          <p className="text-[11px] text-zinc-400 font-medium">Complete audit trail of all transitions, approvals and rejections.</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:max-w-xs">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search logs..."
          />
          {search && (
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="h-8 text-[11px] px-2.5 border-zinc-200 text-zinc-650 cursor-pointer"
            >
              <RotateCcw className="size-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <WorkflowSkeleton view="table" />
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 text-center text-rose-600 flex flex-col items-center justify-center space-y-1.5">
          <AlertTriangle className="size-6" />
          <p className="text-xs font-bold">Failed to load history logs</p>
        </div>
      ) : logs.length === 0 ? (
        <p className="text-xs text-zinc-400 text-center py-8 font-medium">No workflow logs recorded.</p>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Bill Number</th>
                  <th className="p-3">From Status</th>
                  <th className="p-3">To Status</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Performed By</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Comments</th>
                  <th className="p-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {logs.map((step) => {
                  const act = ACTION_LABELS[step.action] || { text: step.action, style: "bg-zinc-50 text-zinc-700" };
                  const formattedDateTime = step.created_at
                    ? new Date(step.created_at).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "N/A";
                  return (
                    <tr key={step.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="p-3 font-bold text-zinc-900">{step.bill?.bill_number || "—"}</td>
                      <td className="p-3">
                        {step.from_status ? (
                          <WorkflowStatusBadge status={step.from_status} />
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <WorkflowStatusBadge status={step.to_status} />
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${act.style}`}>
                          {act.text}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-zinc-800">
                        {step.performed_by?.email || "System"}
                      </td>
                      <td className="p-3 text-zinc-500 font-medium font-mono whitespace-nowrap">{formattedDateTime}</td>
                      <td className="p-3 text-zinc-650 max-w-xs truncate" title={step.reason_note || step.comments}>
                        {step.reason_code ? `[${step.reason_code}] ` : ""}{step.reason_note || step.comments || "—"}
                      </td>
                      <td className="p-3 text-right">
                        {step.bill && (
                          <Link
                            to={`/workflow/${step.bill.id}`}
                            className="inline-flex items-center justify-center p-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-all"
                          >
                            <Eye className="size-3.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-150 pt-3">
              <span className="text-[10px] text-zinc-500 font-medium">
                Page {page} of {totalPages} ({count} logs total)
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  variant="outline"
                  className="text-[10px] h-7 border border-zinc-200 cursor-pointer px-2"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  variant="outline"
                  className="text-[10px] h-7 border border-zinc-200 cursor-pointer px-2"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardLogsCard;
