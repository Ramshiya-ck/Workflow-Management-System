import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, LayoutGrid, List, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import SearchBar from "@/features/departments/components/SearchBar";
import BillsTable from "../components/BillsTable";
import BillCard from "../components/BillCard";
import BillEmptyState from "../components/BillEmptyState";
import BillSkeleton from "../components/BillSkeleton";
import DeleteBillDialog from "../components/DeleteBillDialog";

import { useBills } from "../hooks/useBills";
import { useDeleteBill } from "../hooks/useDeleteBill";

/**
 * Main bills directory panel showing lists of invoice workflow tracking logs.
 */
const BillsPage = () => {
  const navigate = useNavigate();
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

  // Dialog triggers
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Build query params
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

  // React Query Hooks
  const { data: listResponse, isLoading: isListLoading, error: listError } = useBills(queryParams);
  const deleteMutation = useDeleteBill();

  // Map Backend Results to camelCase Frontend Presentation properties
  const mappedBills = useMemo(() => {
    const rawResults = listResponse?.data?.results || [];
    return rawResults.map((b) => ({
      id: b.id,
      trackingId: b.tracking_id || "TRK-PENDING",
      billNumber: b.bill_number,
      vendorName: b.vendor?.name || "N/A",
      departmentName: b.department?.name || "Unassigned",
      billDate: b.bill_date 
        ? new Date(b.bill_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "N/A",
      amount: `₹${Number(b.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      currentStatus: b.current_status || "PENDING",
      createdBy: b.created_by?.email || "System",
      createdDate: b.created_at 
        ? new Date(b.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "N/A",
    }));
  }, [listResponse]);

  const totalPages = useMemo(() => {
    const count = listResponse?.data?.count || 0;
    return Math.ceil(count / 10);
  }, [listResponse]);

  const handleEditClick = useCallback((bill) => {
    navigate(`/bills/${bill.id}/edit`);
  }, [navigate]);

  const handleDeleteClick = useCallback((bill) => {
    setSelectedBill(bill);
    setIsDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!selectedBill) return;
    deleteMutation.mutate(selectedBill.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedBill(null);
      },
    });
  }, [deleteMutation, selectedBill]);

  const handleResetFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setPage(1);
  }, []);

  const breadcrumbs = [
    { name: "AAK Console", path: "/" },
    { name: "Bills" },
  ];

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Page Header */}
      <PageHeader
        title="Bills Registry"
        subtitle="Track hypermarket supplier invoices, invoice statuses, and clearance workflows."
        breadcrumbs={breadcrumbs}
        primaryAction={
          <Link to="/bills/create">
            <Button className="cursor-pointer gap-2 shadow-sm">
              <Plus className="size-4" />
              <span>Create Bill</span>
            </Button>
          </Link>
        }
      />

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <SearchBar value={search} onChange={(val) => { setSearch(val); setPage(1); }} onClear={() => { setSearch(""); setPage(1); }} placeholder="Search bills..." />
          
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-xs bg-white border border-zinc-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-sans cursor-pointer h-9 px-3"
          >
            <option value="all">All Statuses</option>
            <option value="RECEIVING">Receiving</option>
            <option value="DATA_ENTRY">Data Entry</option>
            <option value="SUPERVISOR">Supervisor Approval</option>
            <option value="DEPARTMENT_MANAGER">Manager Approval</option>
            <option value="ACCOUNTS">Accounts</option>
            <option value="ACCOUNTS_CLEARED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex border border-zinc-200 rounded-lg p-1 bg-zinc-50 shrink-0 self-end md:self-auto">
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-md cursor-pointer transition-all ${viewMode === "table" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-450 hover:text-zinc-800"}`}
            title="Table View"
          >
            <List className="size-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md cursor-pointer transition-all ${viewMode === "grid" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-455 hover:text-zinc-805"}`}
            title="Card View"
          >
            <LayoutGrid className="size-4" />
          </button>
        </div>
      </div>

      {/* Error state alert panel */}
      {listError && (
        <div className="flex flex-col items-center justify-center p-8 bg-white border border-zinc-200 rounded-xl text-center max-w-sm mx-auto my-6 font-sans">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 border border-red-100 text-red-500 mb-4">
            <AlertTriangle className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900">Sync Connection Failed</h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            {listError?.friendlyMessage || "Unable to sync invoice registries with the corporate servers. Please try again."}
          </p>
        </div>
      )}

      {/* Listing content */}
      {!listError && (
        isListLoading ? (
          <BillSkeleton view={viewMode} />
        ) : mappedBills.length === 0 ? (
          <BillEmptyState onReset={handleResetFilters} hasFilters={search || statusFilter !== "all"} />
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mappedBills.map((bill) => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            ) : (
              <BillsTable
                bills={mappedBills}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border border-zinc-200 bg-white px-4 py-3 sm:px-6 rounded-xl mt-4 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
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
                      <span className="font-bold text-zinc-900">{listResponse?.data?.count}</span> total records)
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

      {/* Overlays */}
      <DeleteBillDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        billNumber={selectedBill?.billNumber}
      />
    </div>
  );
};

export default BillsPage;
