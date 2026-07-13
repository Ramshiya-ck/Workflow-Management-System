import React, { useState, useMemo, useCallback } from "react";
import { Plus, LayoutGrid, List, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import SearchBar from "../components/SearchBar";
import FiltersBar from "../components/FiltersBar";
import DepartmentTable from "../components/DepartmentTable";
import DepartmentCard from "../components/DepartmentCard";
import DepartmentEmptyState from "../components/DepartmentEmptyState";
import DepartmentSkeleton from "../components/DepartmentSkeleton";
import CreateDepartmentDialog from "../components/CreateDepartmentDialog";
import EditDepartmentDialog from "../components/EditDepartmentDialog";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";

import { useDepartments } from "../hooks/useDepartments";
import { useCreateDepartment } from "../hooks/useCreateDepartment";
import { useUpdateDepartment } from "../hooks/useUpdateDepartment";
import { useDeleteDepartment } from "../hooks/useDeleteDepartment";

// Ordering Parameter Map
const ORDERING_MAP = {
  "name-asc": "name",
  "name-desc": "-name",
  "code-asc": "code",
  "created-desc": "-created_at",
  "created-asc": "created_at",
};

/**
 * Main dashboard composition view integrating Django backend endpoints and React Query caching.
 */
const DepartmentsPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [managerFilter, setManagerFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [viewMode, setViewMode] = useState("table");

  // Dialog open triggers
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  // Build API Query Parameters
  const queryParams = useMemo(() => {
    const params = {
      search: search.trim() || undefined,
      ordering: ORDERING_MAP[sortBy] || undefined,
    };
    if (statusFilter !== "all") {
      params.is_active = statusFilter === "active" ? "true" : "false";
    }
    return params;
  }, [search, statusFilter, sortBy]);

  // React Query Hooks
  const { data: listResponse, isLoading: isListLoading, error: listError } = useDepartments(queryParams);
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  // Map Backend Results to camelCase Frontend Presentation properties
  const mappedDepartments = useMemo(() => {
    const rawResults = listResponse?.data?.results || [];
    return rawResults.map((dept) => ({
      id: dept.id,
      name: dept.name,
      code: dept.code,
      isActive: dept.is_active !== undefined ? dept.is_active : true,
      managerName: "System Admin", // fallback since manager is not in DB model
      createdDate: dept.created_at 
        ? new Date(dept.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "N/A",
    }));
  }, [listResponse]);

  // Local actions filtering based on manager (if filter applied)
  const filteredDepartments = useMemo(() => {
    if (managerFilter !== "all") {
      return []; // manager filter always yields empty in list since it is a mock filter
    }
    return mappedDepartments;
  }, [mappedDepartments, managerFilter]);

  const handleResetFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setManagerFilter("all");
    setSortBy("name-asc");
  }, []);

  const handleCreateSubmit = useCallback((data) => {
    createMutation.mutate(
      {
        name: data.name,
        code: data.code,
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
    if (!selectedDept) return;
    updateMutation.mutate(
      {
        id: selectedDept.id,
        data: {
          name: data.name,
          isActive: data.isActive,
        },
      },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setSelectedDept(null);
        },
      }
    );
  }, [updateMutation, selectedDept]);

  const handleDeleteConfirm = useCallback(() => {
    if (!selectedDept) return;
    deleteMutation.mutate(selectedDept.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedDept(null);
      },
    });
  }, [deleteMutation, selectedDept]);

  const handleEditClick = useCallback((dept) => {
    setSelectedDept(dept);
    setIsEditOpen(true);
  }, []);

  const handleDeleteClick = useCallback((dept) => {
    setSelectedDept(dept);
    setIsDeleteOpen(true);
  }, []);

  const breadcrumbs = [
    { name: "AAK Console", path: "/" },
    { name: "Departments" },
  ];

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Page Header */}
      <PageHeader
        title="Departments"
        subtitle="Manage stores branches, layout groups, and approval supervisors."
        breadcrumbs={breadcrumbs}
        primaryAction={
          <Button onClick={() => setIsCreateOpen(true)} className="cursor-pointer gap-2 shadow-sm">
            <Plus className="size-4" />
            <span>Add Department</span>
          </Button>
        }
      />

      {/* Control bar: Search + Filters + Mode view toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")} />
          <FiltersBar
            status={statusFilter}
            managerId={managerFilter}
            sortBy={sortBy}
            onStatusChange={setStatusFilter}
            onManagerChange={setManagerFilter}
            onSortChange={setSortBy}
            onReset={handleResetFilters}
          />
        </div>

        {/* Layout View Toggles */}
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
            className={`p-1.5 rounded-md cursor-pointer transition-all ${viewMode === "grid" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-450 hover:text-zinc-800"}`}
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
            {listError?.friendlyMessage || "Unable to sync department listings with the corporate database. Please try again."}
          </p>
        </div>
      )}

      {/* Primary listings outlet */}
      {!listError && (
        isListLoading ? (
          <DepartmentSkeleton view={viewMode} />
        ) : filteredDepartments.length === 0 ? (
          <DepartmentEmptyState
            onReset={handleResetFilters}
            hasFilters={search || statusFilter !== "all" || managerFilter !== "all"}
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDepartments.map((dept) => (
              <DepartmentCard
                key={dept.id}
                department={dept}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <DepartmentTable
            departments={filteredDepartments}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        )
      )}

      {/* CRUD dialog prompts */}
      <CreateDepartmentDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={isMutating}
      />

      <EditDepartmentDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        isLoading={isMutating}
        department={selectedDept}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isMutating}
        departmentName={selectedDept?.name}
      />
    </div>
  );
};

export default DepartmentsPage;
