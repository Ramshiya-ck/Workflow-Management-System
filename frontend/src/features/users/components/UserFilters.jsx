import React, { useState, useEffect, useCallback } from "react";
import { Search, Filter, X } from "lucide-react";
import { useRoles } from "../hooks/useUsers";
import { useDepartments } from "@/features/departments/hooks/useDepartments";

const UserFilters = ({ onSearch, onFilterChange, activeFilters }) => {
  const [localSearch, setLocalSearch] = useState(activeFilters.search || "");

  // Load roles dynamically from backend choices
  const { data: rolesResponse } = useRoles();
  const roles = rolesResponse?.data || [];

  // Load active departments dynamically
  const { data: deptsResponse } = useDepartments({ is_active: true, page_size: 100 });
  const departments = deptsResponse?.data?.results || [];

  // Debounced search logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch(localSearch);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [localSearch, onSearch]);

  // Handle local changes
  const handleRoleSelect = (e) => {
    onFilterChange("role", e.target.value);
  };

  const handleDeptSelect = (e) => {
    onFilterChange("department", e.target.value);
  };

  const handleStatusSelect = (e) => {
    onFilterChange("is_active", e.target.value);
  };

  const handleClearAll = useCallback(() => {
    setLocalSearch("");
    onFilterChange("clear_all", null);
  }, [onFilterChange]);

  const hasActiveFilters =
    activeFilters.search ||
    activeFilters.role ||
    activeFilters.department ||
    activeFilters.is_active;

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 font-sans select-none">
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by user name, email, phone..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-9 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all placeholder-zinc-400"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-650 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Roles Filter */}
          <div className="relative flex-1 md:flex-none">
            <select
              value={activeFilters.role || ""}
              onChange={handleRoleSelect}
              className="w-full md:w-44 pl-3 pr-8 h-9 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700 appearance-none focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer font-medium"
            >
              <option value="">Filter by Role</option>
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
          </div>

          {/* Departments Filter */}
          <div className="relative flex-1 md:flex-none">
            <select
              value={activeFilters.department || ""}
              onChange={handleDeptSelect}
              className="w-full md:w-48 pl-3 pr-8 h-9 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700 appearance-none focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer font-medium"
            >
              <option value="">Filter by Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative flex-1 md:flex-none">
            <select
              value={activeFilters.is_active || ""}
              onChange={handleStatusSelect}
              className="w-full md:w-36 pl-3 pr-8 h-9 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700 appearance-none focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer font-medium"
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <Filter className="absolute right-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="h-9 px-3 text-xs text-zinc-500 hover:text-zinc-900 font-semibold border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <X className="size-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(UserFilters);
