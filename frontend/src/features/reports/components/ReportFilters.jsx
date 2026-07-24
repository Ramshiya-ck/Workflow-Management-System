import React from "react";
import { Search, RotateCcw, Filter } from "lucide-react";

const DEPARTMENTS = ["Supermarket", "Fish", "Bakery", "Hot Food", "Grocery", "Butchery"];
const STATUSES = [
  { value: "RECEIVING", label: "Draft" },
  { value: "DATA_ENTRY", label: "Received" },
  { value: "SUPERVISOR", label: "Data Entry Done" },
  { value: "DEPARTMENT_MANAGER", label: "Supervisor Approved" },
  { value: "ACCOUNTS", label: "Manager Approved" },
  { value: "ACCOUNTS_CLEARED", label: "Accounts Cleared" },
  { value: "HOLDING", label: "Holding" },
];

const ReportFilters = ({
  filters,
  onChange,
  onReset,
  vendorOptions = [],
}) => {
  const handleFilterChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] font-sans space-y-4 text-left select-none">
      <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
        <Filter className="size-4 text-zinc-500" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
          Filter Parameters
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="space-y-1">
          <label htmlFor="report-search" className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
            <input
              id="report-search"
              type="text"
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="ID or Vendor..."
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Department */}
        <div className="space-y-1">
          <label htmlFor="report-dept" className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Department</label>
          <select
            id="report-dept"
            value={filters.department || ""}
            onChange={(e) => handleFilterChange("department", e.target.value)}
            className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 text-zinc-800 font-medium"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="space-y-1">
          <label htmlFor="report-status" className="text-[10px] font-bold text-zinc-455 uppercase tracking-wider">Status</label>
          <select
            id="report-status"
            value={filters.status || ""}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 text-zinc-800 font-medium"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Vendor */}
        <div className="space-y-1">
          <label htmlFor="report-vendor" className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Vendor</label>
          <select
            id="report-vendor"
            value={filters.vendor || ""}
            onChange={(e) => handleFilterChange("vendor", e.target.value)}
            className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 text-zinc-800 font-medium"
          >
            <option value="">All Vendors</option>
            {vendorOptions.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Start */}
        <div className="space-y-1">
          <label htmlFor="report-start-date" className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Start Date</label>
          <input
            id="report-start-date"
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 text-zinc-800 font-medium"
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
        {/* Date Range End */}
        <div className="flex gap-4 items-center">
          <div className="space-y-1">
            <label htmlFor="report-end-date" className="text-[10px] font-bold text-zinc-455 uppercase tracking-wider block">End Date</label>
            <input
              id="report-end-date"
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 text-zinc-800 font-medium"
            />
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-zinc-900 border border-zinc-200 hover:bg-zinc-50 px-3 py-1.5 rounded-lg select-none uppercase tracking-wider transition-all cursor-pointer"
        >
          <RotateCcw className="size-3" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
};

export default React.memo(ReportFilters);
export { DEPARTMENTS, STATUSES };
