import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, RotateCcw, AlertTriangle, History } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import SearchBar from "@/features/departments/components/SearchBar";
import WorkflowStatusBadge from "../components/WorkflowStatusBadge";
import WorkflowSkeleton from "../components/WorkflowSkeleton";
import { useWorkflowLogs } from "../hooks/useWorkflowLogs";

const ACTION_LABELS = {
  SUBMIT: { text: "Submit", style: "bg-blue-50 text-blue-700 border-blue-100" },
  APPROVE: { text: "Approve", style: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  REJECT: { text: "Reject", style: "bg-rose-50 text-rose-700 border-rose-100" },
  HOLD: { text: "Hold", style: "bg-amber-50 text-amber-700 border-amber-100" },
  RESUME: { text: "Resume", style: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  REASSIGN: { text: "Reassign", style: "bg-zinc-50 text-zinc-700 border-zinc-200" },
};

const WorkflowLogsPage = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Build query params
  const queryParams = useMemo(() => ({
    page,
    search: debouncedSearch.trim() || undefined,
  }), [page, debouncedSearch]);

  const { data: logsResponse, isLoading, error } = useWorkflowLogs(queryParams);

  const handleResetFilters = useCallback(() => {
    setSearch("");
    setPage(1);
  }, []);

  const logs = logsResponse?.data?.results || [];
  const count = logsResponse?.data?.count || 0;
  const totalPages = Math.ceil(count / 10) || 1;

  const breadcrumbs = [
    { name: "AAK Console", path: "/" },
    { name: "Workflow Queue", path: "/workflow" },
    { name: "Audit Logs" },
  ];

  return (
    <div className="space-y-6 font-sans select-none">
      {/* Page Header */}
      <PageHeader
        title="Workflow History Logs"
        subtitle="System-wide real-time tracking of approvals, rejections, and state modifications."
        breadcrumbs={breadcrumbs}
      />

      {/* Search Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white border border-zinc-200/80 rounded-xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
        <div className="w-full sm:max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by bill number, user, action..."
          />
        </div>
        {(search) && (
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="w-full sm:w-auto h-9 text-xs border-zinc-200 text-zinc-600 hover:text-zinc-900 cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Content Body */}
      {isLoading ? (
        <WorkflowSkeleton view="table" />
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 text-center text-rose-600 flex flex-col items-center justify-center space-y-2">
          <AlertTriangle className="size-8" />
          <div>
            <h3 className="text-sm font-bold">Failed to load workflow logs</h3>
            <p className="text-xs text-rose-500 mt-1">{error.message || "An unexpected error occurred."}</p>
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-zinc-50 border border-zinc-100 text-zinc-400 flex items-center justify-center">
            <History className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-900">No Logs Found</h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              No matching workflow transition records exist in the system history database.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Bill Number</th>
                  <th className="p-3">From Status</th>
                  <th className="p-3">To Status</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Performed By</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Comments</th>
                  <th className="p-3 text-right">Actions</th>
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
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${act.style}`}>
                          {act.text}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-zinc-800">
                        {step.performed_by?.email || "System"}
                      </td>
                      <td className="p-3 text-zinc-500 font-medium font-mono">{formattedDateTime}</td>
                      <td className="p-3">
                        {step.reason_code ? (
                          <span className="text-xs font-bold text-rose-700">{step.reason_code}</span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="p-3 text-zinc-650 leading-relaxed max-w-xs truncate" title={step.reason_note || step.comments}>
                        {step.reason_note || step.comments || <span className="text-zinc-400">—</span>}
                      </td>
                      <td className="p-3 text-right">
                        {step.bill && (
                          <Link
                            to={`/workflow/${step.bill.id}`}
                            className="inline-flex items-center justify-center p-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-all"
                            title="Inspect bill workflow details"
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-150 pt-4">
              <span className="text-xs text-zinc-500 font-medium">
                Page {page} of {totalPages} ({count} logs total)
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  variant="outline"
                  className="text-xs h-8 border border-zinc-200 cursor-pointer"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  variant="outline"
                  className="text-xs h-8 border border-zinc-200 cursor-pointer"
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

export default WorkflowLogsPage;
