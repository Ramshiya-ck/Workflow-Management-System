import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  PauseCircle,
  Users,
  Grid,
  Activity,
  Layers,
  Check,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { getVendorOptions } from "@/features/bills/api/bills.api";
import ReportSummaryCard from "../components/ReportSummaryCard";
import ReportFilters from "../components/ReportFilters";
import ReportChartCard from "../components/ReportChartCard";
import ReportTable from "../components/ReportTable";
import ReportSkeleton from "../components/ReportSkeleton";
import ExportDropdown from "../components/ExportDropdown";
import {
  useDashboardSummary,
  useDepartmentReport,
  useVendorReport,
  useWorkflowReport,
  useStatusReport,
  useAgingReport,
  useAuditReport,
  useReportsList,
} from "../hooks/useReports";

const REPORT_TYPES = [
  { id: "department", label: "Department Report", icon: Layers },
  { id: "status", label: "Status Report", icon: Grid },
  { id: "vendor", label: "Vendor Report", icon: Users },
  { id: "workflow", label: "Workflow Report", icon: Activity },
  { id: "rejected", label: "Rejected Bills Report", icon: AlertTriangle },
  { id: "hold", label: "Hold Report", icon: PauseCircle },
  { id: "aging", label: "Aging Report", icon: Clock },
  { id: "audit", label: "Audit Trail Report", icon: Clock },
];

const ReportsPage = () => {
  const navigate = useNavigate();
  const [activeReport, setActiveReport] = useState("department");
  const [page, setPage] = useState(1);
  const [ordering, setOrdering] = useState("-created_at");

  // Filters State
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    status: "",
    vendor: "",
    startDate: "",
    endDate: "",
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Debounce filters to avoid excessive API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      search: "",
      department: "",
      status: "",
      vendor: "",
      startDate: "",
      endDate: "",
    });
    setOrdering("-created_at");
    setPage(1);
  };

  // Build query params
  const baseQueryParams = useMemo(() => {
    const params = {};
    Object.keys(debouncedFilters).forEach((key) => {
      if (debouncedFilters[key]) {
        params[key] = debouncedFilters[key];
      }
    });
    return params;
  }, [debouncedFilters]);

  // Fetch Vendor options for filters
  const { data: vendorOptions = [] } = useQuery({
    queryKey: ["vendor-options"],
    queryFn: getVendorOptions,
  });

  // Analytics API Queries
  const { data: summaryRes, isLoading: isSummaryLoading, error: summaryErr } = useDashboardSummary(baseQueryParams);
  const { data: deptRes, isLoading: isDeptLoading } = useDepartmentReport(baseQueryParams);
  const { data: vendorRes, isLoading: isVendorLoading } = useVendorReport(baseQueryParams);
  const { data: workflowRes, isLoading: isWorkflowLoading } = useWorkflowReport(baseQueryParams);
  const { data: statusRes, isLoading: isStatusLoading } = useStatusReport(baseQueryParams);
  const { data: agingRes, isLoading: isAgingLoading } = useAgingReport(baseQueryParams);
  
  // Table Queries (Conditional / Tab specific)
  const isAuditTab = activeReport === "audit";
  const isAgingTab = activeReport === "aging";
  const isRejectedTab = activeReport === "rejected";
  const isHoldTab = activeReport === "hold";

  const listParams = useMemo(() => {
    const params = { ...baseQueryParams, page, ordering };
    if (isRejectedTab) params.rejected = "true";
    if (isHoldTab) params.status = "HOLDING";
    return params;
  }, [baseQueryParams, page, ordering, isRejectedTab, isHoldTab]);

  const { data: listRes, isLoading: isListLoading, error: listErr } = useReportsList(listParams);
  const { data: auditRes, isLoading: isAuditLoading, error: auditErr } = useAuditReport({ ...baseQueryParams, page });

  const summary = summaryRes?.data || {
    total_bills: 0,
    pending_bills: 0,
    completed_bills: 0,
    rejected_bills: 0,
    bills_on_hold: 0,
    total_vendors: 0,
    total_departments: 0,
  };

  const listResponseData = listRes?.data || { count: 0, results: [] };
  const auditResponseData = auditRes?.data || { count: 0, results: [] };
  const agingResponseData = agingRes?.data || [];

  // Determine current active table list dataset
  const currentTableData = useMemo(() => {
    if (isAuditTab) return auditResponseData.results;
    if (isAgingTab) return agingResponseData;
    return listResponseData.results;
  }, [isAuditTab, isAgingTab, auditResponseData, agingResponseData, listResponseData]);

  const totalCount = useMemo(() => {
    if (isAuditTab) return auditResponseData.count;
    if (isAgingTab) return agingResponseData.length;
    return listResponseData.count;
  }, [isAuditTab, isAgingTab, auditResponseData, agingResponseData, listResponseData]);

  const totalPages = Math.ceil(totalCount / (isAgingTab ? 100 : 20));

  const isLoading = isSummaryLoading || isDeptLoading || isVendorLoading || isWorkflowLoading || isStatusLoading || isAgingLoading || (isAuditTab ? isAuditLoading : isListLoading);
  const error = summaryErr || listErr || auditErr;

  // Process chart configurations
  const processedDeptChart = useMemo(() => {
    const items = deptRes?.data || [];
    const sum = items.reduce((acc, curr) => acc + curr.total_bills, 0);
    const colors = ["bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-indigo-500", "bg-emerald-500", "bg-zinc-400"];
    
    return items.slice(0, 5).map((item, idx) => ({
      label: item.department,
      value: sum > 0 ? Math.round((item.total_bills / sum) * 100) : 0,
      color: colors[idx % colors.length],
      count: item.total_bills,
    }));
  }, [deptRes]);

  const processedStatusChart = useMemo(() => {
    const items = statusRes?.data || [];
    const sum = items.reduce((acc, curr) => acc + curr.value, 0);
    const colors = ["bg-emerald-500", "bg-blue-500", "bg-rose-500", "bg-amber-500", "bg-purple-500"];
    
    return items.map((item, idx) => ({
      label: item.label,
      value: sum > 0 ? Math.round((item.value / sum) * 100) : 0,
      color: colors[idx % colors.length],
      count: item.value,
    }));
  }, [statusRes]);

  const processedWorkflowChart = useMemo(() => {
    const items = workflowRes?.data || [];
    const sum = items.reduce((acc, curr) => acc + curr.bills_count, 0);
    const colors = ["bg-zinc-500", "bg-purple-500", "bg-amber-500", "bg-indigo-500", "bg-emerald-500"];
    
    // Map stage identifiers to label strings
    const stageLabels = {
      RECEIVING: "Receiving Stage",
      DATA_ENTRY: "Data Entry Queue",
      SUPERVISOR: "Supervisor Approval",
      DEPARTMENT_MANAGER: "Manager Review",
      ACCOUNTS: "Accounts Clearance",
      ACCOUNTS_CLEARED: "Cleared",
      HOLDING: "Workflow Hold",
    };

    return items.map((item, idx) => ({
      label: stageLabels[item.current_stage] || item.current_stage,
      value: sum > 0 ? Math.round((item.bills_count / sum) * 100) : 0,
      color: colors[idx % colors.length],
    }));
  }, [workflowRes]);

  const monthlyBillsMockData = [
    { label: "Jan", value: 30, count: 120 },
    { label: "Feb", value: 45, count: 180 },
    { label: "Mar", value: 65, count: 260 },
    { label: "Apr", value: 55, count: 220 },
    { label: "May", value: 75, count: 300 },
    { label: "Jun", value: 90, count: 360 },
  ];

  const handleRowClick = (id) => {
    navigate(`/bills/${id}`);
  };

  const breadcrumbs = [
    { name: "AAK Console", path: "/" },
    { name: "Reports Center" },
  ];

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Page Header */}
      <PageHeader
        title="Reports & Analytics"
        subtitle="Access system metrics, workflow summaries, and clearance audit sheets."
        breadcrumbs={breadcrumbs}
        primaryAction={<ExportDropdown filters={filters} />}
      />

      {/* Reports Type Tab Bar */}
      <div className="flex overflow-x-auto gap-2 pb-1 border-b border-zinc-200/80">
        {REPORT_TYPES.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveReport(tab.id);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-bold text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                activeReport === tab.id
                  ? "border-zinc-950 text-zinc-950"
                  : "border-transparent text-zinc-450 hover:text-zinc-800"
              }`}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading View */}
      {isLoading && <ReportSkeleton />}

      {/* Error View */}
      {error && (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-zinc-200 rounded-xl text-center max-w-sm mx-auto my-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 border border-red-100 text-red-500 mb-4">
            <AlertTriangle className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900">Reports Generation Failed</h3>
          <p className="text-xs text-zinc-550 mt-1 leading-relaxed">
            Failed to fetch compiled audit metrics sheets from corporate registry records. Please try again.
          </p>
        </div>
      )}

      {/* Dashboard Metrics Content */}
      {!isLoading && !error && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <ReportSummaryCard
              title="Total Bills"
              value={summary.total_bills}
              icon={FileText}
              description="Registered this fiscal month"
              trend="+12% from last week"
              trendType="up"
            />
            <ReportSummaryCard
              title="Pending Bills"
              value={summary.pending_bills}
              icon={Clock}
              description="Awaiting workflow approval"
              trend="-4% from yesterday"
              trendType="down"
            />
            <ReportSummaryCard
              title="Completed"
              value={summary.completed_bills}
              icon={CheckCircle}
              description="Cleared to Accounts"
              trend="+18% clearance rate"
              trendType="up"
            />
            <ReportSummaryCard
              title="Rejected"
              value={summary.rejected_bills}
              icon={AlertTriangle}
              description="Failed verification audits"
              trend="Rejection records counter"
              trendType="neutral"
            />
            <ReportSummaryCard
              title="On Hold"
              value={summary.bills_on_hold}
              icon={PauseCircle}
              description="Flagged discrepancy logs"
              trend="Awaiting review action"
              trendType="neutral"
            />
            <ReportSummaryCard
              title="Total Vendors"
              value={summary.total_vendors}
              icon={Users}
              description="Registered active suppliers"
              trend="Supplier network count"
              trendType="neutral"
            />
          </div>

          {/* Filters Panel */}
          <ReportFilters
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            vendorOptions={vendorOptions}
          />

          {/* Charts area */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ReportChartCard
              title="Bills by Department"
              type="bar"
              data={processedDeptChart}
            />
            <ReportChartCard
              title="Bills by Status"
              type="pie"
              data={processedStatusChart}
            />
            <ReportChartCard
              title="Workflow Progress"
              type="progress"
              data={processedWorkflowChart}
            />
            <ReportChartCard
              title="Monthly Bills Log"
              type="line"
              data={monthlyBillsMockData}
            />
          </div>

          {/* Report Data Log Listing */}
          <div className="space-y-3">
            <div className="flex justify-between items-center select-none">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Reports Log Entries
              </h3>
              <span className="text-[10px] text-zinc-400 font-bold">
                Showing {totalCount} records matching filters
              </span>
            </div>

            {isAuditTab ? (
              <div className="bg-white border border-zinc-250/60 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left font-sans">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200/80 text-[10px] font-bold text-zinc-455 uppercase tracking-wider select-none">
                        <th className="px-4 py-3">Tracking ID</th>
                        <th className="px-4 py-3">Action</th>
                        <th className="px-4 py-3">Performed By</th>
                        <th className="px-4 py-3">From Stage</th>
                        <th className="px-4 py-3">To Stage</th>
                        <th className="px-4 py-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {currentTableData.map((log) => (
                        <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors border-b border-zinc-100 text-xs">
                          <td className="px-4 py-3.5 font-bold text-zinc-900 whitespace-nowrap">{log.tracking_id}</td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-zinc-800 whitespace-nowrap">{log.performed_by_name || "System"}</td>
                          <td className="px-4 py-3.5 text-zinc-500 font-semibold whitespace-nowrap">{log.from_status || "None"}</td>
                          <td className="px-4 py-3.5 text-zinc-555 font-semibold whitespace-nowrap">{log.to_status}</td>
                          <td className="px-4 py-3.5 text-zinc-500 font-medium whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString("en-GB")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <ReportTable bills={currentTableData} onViewDetails={handleRowClick} />
            )}

            {/* Pagination */}
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
                      <span className="font-bold text-zinc-900">{totalCount}</span> total entries)
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
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ReportsPage);
