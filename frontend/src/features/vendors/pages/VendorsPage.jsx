import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Plus, LayoutGrid, List, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import SearchBar from "@/features/departments/components/SearchBar";
import FiltersBar from "@/features/departments/components/FiltersBar";
import VendorTable from "../components/VendorTable";
import VendorCard from "../components/VendorCard";
import VendorEmptyState from "../components/VendorEmptyState";
import VendorSkeleton from "../components/VendorSkeleton";
import CreateVendorDialog from "../components/CreateVendorDialog";
import EditVendorDialog from "../components/EditVendorDialog";
import DeleteVendorDialog from "../components/DeleteVendorDialog";

import { useVendors } from "../hooks/useVendors";
import { useCreateVendor } from "../hooks/useCreateVendor";
import { useUpdateVendor } from "../hooks/useUpdateVendor";
import { useDeleteVendor } from "../hooks/useDeleteVendor";
import { useAuth } from "@/features/auth/hooks/useAuth";

// Ordering Parameter Map
const ORDERING_MAP = {
  "name-asc": "name",
  "name-desc": "-name",
  "code-asc": "name",
  "created-desc": "-created_at",
  "created-asc": "created_at",
};

/**
 * Primary presentation panel displaying supplier cards list with searches and pagination boundaries.
 */
const VendorsPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [viewMode, setViewMode] = useState("table");
  const [page, setPage] = useState(1);

  const canDelete = user?.role === "SUPER_ADMIN" || user?.is_superuser;

  // Debounce search input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Dialog triggers
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Build API Query Parameters
  const queryParams = useMemo(() => {
    const params = {
      page,
      search: debouncedSearch.trim() || undefined,
      ordering: ORDERING_MAP[sortBy] || undefined,
    };
    if (statusFilter !== "all") {
      params.is_active = statusFilter === "active" ? "true" : "false";
    }
    return params;
  }, [page, debouncedSearch, statusFilter, sortBy]);

  // React Query Hooks
  const { data: listResponse, isLoading: isListLoading, error: listError } = useVendors(queryParams);
  const createMutation = useCreateVendor();
  const updateMutation = useUpdateVendor();
  const deleteMutation = useDeleteVendor();

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  // Map Backend Results to camelCase Frontend Presentation properties
  const mappedVendors = useMemo(() => {
    const rawResults = listResponse?.data?.results || [];
    return rawResults.map((v) => ({
      id: v.id,
      name: v.name,
      mobileNumber: v.mobile_number || "N/A",
      address: v.address || "",
      gstNumber: v.gst_number || "",
      creditDays: v.credit_days !== undefined ? v.credit_days : 0,
      isActive: v.is_active !== undefined ? v.is_active : true,
      createdDate: v.created_at 
        ? new Date(v.created_at).toLocaleDateString("en-GB", {
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

  const handleResetFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setSortBy("name-asc");
    setPage(1);
  }, []);

  const handleCreateSubmit = useCallback((data) => {
    createMutation.mutate(
      {
        name: data.name,
        address: data.address,
        mobileNumber: data.mobileNumber,
        gstNumber: data.gstNumber,
        creditDays: data.creditDays,
        isActive: data.isActive,
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
        },
      }
    );
  }, [createMutation]);

  const handleEditSubmit = useCallback((data) => {
    if (!selectedVendor) return;
    updateMutation.mutate(
      {
        id: selectedVendor.id,
        data: {
          name: data.name,
          address: data.address,
          mobileNumber: data.mobileNumber,
          gstNumber: data.gstNumber,
          creditDays: data.creditDays,
          isActive: data.isActive,
        },
      },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setSelectedVendor(null);
        },
      }
    );
  }, [updateMutation, selectedVendor]);

  const handleDeleteConfirm = useCallback(() => {
    if (!selectedVendor) return;
    deleteMutation.mutate(selectedVendor.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedVendor(null);
      },
    });
  }, [deleteMutation, selectedVendor]);

  const handleEditClick = useCallback((vendor) => {
    setSelectedVendor(vendor);
    setIsEditOpen(true);
  }, []);

  const handleDeleteClick = useCallback((vendor) => {
    setSelectedVendor(vendor);
    setIsDeleteOpen(true);
  }, []);

  const breadcrumbs = [
    { name: "AAK Console", path: "/" },
    { name: "Vendors" },
  ];

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Page Header */}
      <PageHeader
        title="Vendors"
        subtitle="Manage third-party manufacturers, distributors, and contract terms."
        breadcrumbs={breadcrumbs}
        primaryAction={
          <Button onClick={() => setIsCreateOpen(true)} className="cursor-pointer gap-2 shadow-sm">
            <Plus className="size-4" />
            <span>Add Vendor</span>
          </Button>
        }
      />

      {/* Filter panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <SearchBar value={search} onChange={(val) => { setSearch(val); setPage(1); }} onClear={() => { setSearch(""); setPage(1); }} placeholder="Search vendors..." />
          <FiltersBar
            status={statusFilter}
            sortBy={sortBy}
            onStatusChange={(val) => { setStatusFilter(val); setPage(1); }}
            onSortChange={setSortBy}
            onReset={handleResetFilters}
          />
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
            {listError?.friendlyMessage || "Unable to sync vendor listings with the corporate database. Please try again."}
          </p>
        </div>
      )}

      {/* Listing Content */}
      {!listError && (
        isListLoading ? (
          <VendorSkeleton view={viewMode} />
        ) : mappedVendors.length === 0 ? (
          <VendorEmptyState onReset={handleResetFilters} hasFilters={search || statusFilter !== "all"} />
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mappedVendors.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    onEdit={handleEditClick}
                    onDelete={canDelete ? handleDeleteClick : undefined}
                  />
                ))}
              </div>
            ) : (
              <VendorTable
                vendors={mappedVendors}
                onEdit={handleEditClick}
                onDelete={canDelete ? handleDeleteClick : undefined}
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

      {/* Dialog overlays */}
      <CreateVendorDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={isMutating}
      />

      <EditVendorDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        isLoading={isMutating}
        vendor={selectedVendor}
      />

      <DeleteVendorDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isMutating}
        vendorName={selectedVendor?.name}
        error={(() => {
          const error = deleteMutation.error;
          if (!error) return null;
          const data = error.response?.data;
          if (typeof data === "string") return data;
          if (Array.isArray(data)) return data[0];
          if (data && typeof data === "object") {
            if (data.detail) return data.detail;
            if (data.message) return data.message;
            const firstKey = Object.keys(data)[0];
            if (firstKey) {
              const val = data[firstKey];
              return Array.isArray(val) ? val[0] : String(val);
            }
          }
          return error.message || "An unexpected error occurred.";
        })()}
      />
    </div>
  );
};

export default VendorsPage;
