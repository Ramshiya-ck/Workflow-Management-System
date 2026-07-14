import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, List, LayoutGrid, RotateCcw, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import SearchBar from "@/features/departments/components/SearchBar";
import WorkflowStatusBadge from "../components/WorkflowStatusBadge";
import WorkflowCard from "../components/WorkflowCard";
import WorkflowEmptyState from "../components/WorkflowEmptyState";
import WorkflowSkeleton from "../components/WorkflowSkeleton";
import { useWorkflowQueue } from "../hooks/useWorkflowQueue";
import TrackingBadge from "@/features/bills/components/TrackingBadge";

const STATUS_OWNER_MAP = {
  RECEIVING: "Receiving Officer",
  DATA_ENTRY: "Data Entry Operator",
  SUPERVISOR: "Supervisor",
  DEPARTMENT_MANAGER: "Manager",
  ACCOUNTS: "Finance Officer",
  HOLDING: "Held Queue",
};

/**
 * Enterprise approval queue directory mapped to Django backend API.
 */
const WorkflowQueuePage = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [page, setPage] = useState(1);

  // Debounce search typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Build backend query params
  const queryParams = useMemo(() => {
    const params = {
      page,
      search: debouncedSearch.trim() || undefined,
    };
    if (statusFilter !== "all") {
      params.current_status = statusFilter;
    }
    return params;
  }, [page, debouncedSearch, statusFilter]);

  // Query React Query Queue Hook
  const { data: queueResponse, isLoading: isQueueLoading, error: queueError } = useWorkflowQueue(queryParams);

  const handleResetFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setPage(1);
  }, []);

  // Map Backend Results to camelCase Frontend Presentation properties
  const mappedBills = useMemo(() => {
    const rawResults = queueResponse?.data?.results || [];
    return rawResults.map((b) => {
      const amountVal = parseFloat(b.amount || 0);
      const priority = amountVal > 100000 ? "High" : amountVal > 20000 ? "Medium" : "Low";
      return {
        id: b.id,
        trackingId: b.tracking_id || "BILL-PENDING",
        billNumber: b.bill_number,
        vendorName: b.vendor?.name || "N/A",
        departmentName: b.department?.name || "Unassigned",
        currentStatus: b.current_status || "RECEIVING",
        currentOwner: STATUS_OWNER_MAP[b.current_status] || "System",
        priority,
        createdDate: b.created_at
          ? new Date(b.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "N/A",
        amount: amountVal,
      };
    });
  }, [queueResponse]);

  const totalPages = useMemo(() => {
    const count = queueResponse?.data?.count || 0;
    return Math.ceil(count / 10);
  }, [queueResponse]);

  const breadcrumbs = [
    { name: "AAK Console", path: "/" },
    { name: "Workflow Queue" },
  ];

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Page Header */}
      <PageHeader
        title="Approval Queue"
        subtitle="Manage supplier invoices lifecycle checking clearance parameters."
        breadcrumbs={breadcrumbs}
      />

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-zinc-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <SearchBar
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
            onClear={() => { setSearch(""); setPage(1); }}
            placeholder="Search queue..."
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-xs bg-white border border-zinc-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-zinc-950 cursor-pointer h-9 px-3"
          >
            <option value="all">All Statuses</option>
            <option value="RECEIVING">Receiving</option>
            <option value="DATA_ENTRY">Data Entry</option>
            <option value="SUPERVISOR">Supervisor Approval</option>
            <option value="DEPARTMENT_MANAGER">Manager Approval</option>
            <option value="ACCOUNTS">Accounts</option>
            <option value="HOLDING">On Hold</option>
          </select>

          <Button
            onClick={handleResetFilters}
            variant="outline"
            className="text-xs gap-1 border border-zinc-200 h-9 px-3 cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset</span>
          </Button>
        </div>

        {/* View Mode Toggle & Counter */}
        <div className="flex items-center justify-between gap-4 self-end md:self-auto">
          <p className="text-xs text-zinc-550 font-semibold hidden md:block">
            Showing <span className="font-bold text-zinc-900">{queueResponse?.data?.count || 0}</span> invoices awaiting verification
          </p>

          <div className="flex border border-zinc-200 rounded-lg p-1 bg-zinc-50 shrink-0">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md cursor-pointer transition-all ${
                viewMode === "table" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-800"
              }`}
              title="Table View"
            >
              <List className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md cursor-pointer transition-all ${
                viewMode === "grid" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-800"
              }`}
              title="Card View"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sync Error State */}
      {queueError && (
        <div className="flex flex-col items-center justify-center p-8 bg-white border border-zinc-200 rounded-xl text-center max-w-sm mx-auto my-6 font-sans">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 border border-red-100 text-red-500 mb-4">
            <AlertTriangle className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900">Sync Connection Failed</h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            {queueError?.friendlyMessage || "Unable to sync pending workflow queue with corporate servers. Please try again."}
          </p>
        </div>
      )}

      {/* Results grid */}
      {!queueError && (
        isQueueLoading ? (
          <WorkflowSkeleton view={viewMode} />
        ) : mappedBills.length === 0 ? (
          <WorkflowEmptyState
            onReset={handleResetFilters}
            hasFilters={search || statusFilter !== "all"}
          />
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mappedBills.map((bill) => (
                  <WorkflowCard key={bill.id} bill={bill} />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
                <table className="w-full text-left border-collapse font-sans text-xs">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 select-none">
                      <th className="p-3 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Tracking ID</th>
                      <th className="p-3 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Bill Number</th>
                      <th className="p-3 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Vendor</th>
                      <th className="p-3 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Department</th>
                      <th className="p-3 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Current Status</th>
                      <th className="p-3 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Current Owner</th>
                      <th className="p-3 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Priority</th>
                      <th className="p-3 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Created Date</th>
                      <th className="p-3 font-bold text-zinc-400 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {mappedBills.map((bill) => {
                      return (
                        <tr key={bill.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="p-3">
                            <TrackingBadge trackingId={bill.trackingId} />
                          </td>
                          <td className="p-3 font-bold text-zinc-900">{bill.billNumber}</td>
                          <td className="p-3 font-semibold text-zinc-800">{bill.vendorName}</td>
                          <td className="p-3 font-semibold text-zinc-700">{bill.departmentName}</td>
                          <td className="p-3">
                            <WorkflowStatusBadge status={bill.currentStatus} />
                          </td>
                          <td className="p-3 font-semibold text-zinc-550">{bill.currentOwner}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              bill.priority === "High"
                                ? "bg-red-50 text-red-700"
                                : bill.priority === "Medium"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-blue-50 text-blue-700"
                            }`}>
                              {bill.priority}
                            </span>
                          </td>
                          <td className="p-3 text-zinc-550 font-medium font-mono">{bill.createdDate}</td>
                          <td className="p-3 text-right">
                            <Link to={`/workflow/${bill.id}`}>
                              <Button
                                variant="outline"
                                className="h-7 text-[10px] gap-1 cursor-pointer border border-zinc-200 font-bold px-2.5 rounded-md hover:bg-zinc-50"
                              >
                                <Eye className="size-3" />
                                <span>Review</span>
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border border-zinc-200 bg-white px-4 py-3 sm:px-6 rounded-xl mt-4 shadow-sm">
                <div className="flex flex-1 justify-between sm:hidden">
                  <Button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    variant="outline"
                    className="text-xs border-zinc-200"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    variant="outline"
                    className="text-xs border-zinc-200"
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-zinc-550 font-semibold">
                      Showing Page <span className="font-bold text-zinc-900">{page}</span> of{" "}
                      <span className="font-bold text-zinc-900">{totalPages}</span> (
                      <span className="font-bold text-zinc-900">{queueResponse?.data?.count || 0}</span> total records)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      variant="outline"
                      className="text-xs h-8 cursor-pointer border border-zinc-200"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      variant="outline"
                      className="text-xs h-8 cursor-pointer border border-zinc-200"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
};

export default WorkflowQueuePage;
