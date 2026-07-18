import React, { useState } from "react";
import { AlertTriangle, Users, FileText, ShieldCheck, ShieldAlert, Receipt, Building2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDashboard } from "../hooks/useDashboard";
import { useDashboardBills } from "../hooks/useDashboardBills";
import { useDepartments } from "@/features/departments/hooks/useDepartments";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "../components/StatCard";
import PendingBillsCard from "../components/PendingBillsCard";
import AuditQueueCard from "../components/AuditQueueCard";
import ReceivingRegistrationCard from "../components/ReceivingRegistrationCard";
import WorkflowStatusCard from "../components/WorkflowStatusCard";
import QuickActionsCard from "../components/QuickActionsCard";
import ChartCard from "../components/ChartCard";
import RecentActivityCard from "../components/RecentActivityCard";
import Skeleton from "@/components/common/Skeleton";

/**
 * Primary dashboard view displaying metrics dynamically aggregated from the backend.
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const isSuperUser = user?.is_superuser || user?.role === "SUPER_ADMIN";
  const isAuditManager = user?.role === "AUDIT_MANAGER";
  const isAuditOrAdmin = isSuperUser || isAuditManager;
  const isReceivingRole = user?.role === "RECEIVING";

  const [view] = useState(
    isSuperUser
      ? ""
      : user?.role === "RECEIVING"
      ? "receiving"
      : user?.role === "DATA_ENTRY"
      ? "entry"
      : ""
  );

  // Dynamic audit queue filters state
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const billsParams = React.useMemo(() => {
    const params = {};
    if (isAuditOrAdmin) {
      params.page_size = 100;
      if (deptFilter) params.department = deptFilter;
      if (statusFilter) params.current_status = statusFilter;
    }
    return params;
  }, [isAuditOrAdmin, deptFilter, statusFilter]);

  // React Query hooks to fetch dashboard KPIs, pending bills lists and departments
  const { data: metricsResponse, isLoading: isMetricsLoading, error: metricsError } = useDashboard(view);
  const { data: billsResponse, isLoading: isBillsLoading, error: billsError } = useDashboardBills(billsParams);
  const { data: deptsResponse } = useDepartments({ is_active: true, page_size: 100 });
  const departments = deptsResponse?.data?.results || [];

  const metrics = metricsResponse?.data;
  const bills = billsResponse; // Since useDashboardBills already extracts raw result list or paginated data depending on params

  // Centralized Lucide Icon lookup map
  const getIconForTitle = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("vendor")) return Users;
    if (titleLower.includes("bill") || titleLower.includes("invoice")) return FileText;
    if (titleLower.includes("clear") || titleLower.includes("approve")) return ShieldCheck;
    if (titleLower.includes("reject") || titleLower.includes("return")) return ShieldAlert;
    if (titleLower.includes("department")) return Building2;
    return Receipt;
  };

  // Dynamically map KPI metric cards returned from backend service
  const kpiCards = metrics?.cards?.map((card) => ({
    title: card.title,
    value: card.value,
    description: card.description,
    icon: getIconForTitle(card.title),
  })) || [];

  // Map department-wise distribution to pipeline progress bars
  const totalAmount = metrics?.department_wise?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const pipelineDistribution = metrics?.department_wise?.map((item) => ({
    statusName: item.name,
    count: item.count,
    percentage: totalAmount > 0 ? Math.min(100, Math.round((Number(item.amount) / totalAmount) * 100)) : 0,
  })) || [];

  // Map pending bills lists retrieved from backend APIs
  const formattedPendingBills = bills?.slice(0, 5).map((bill) => ({
    billNumber: bill.bill_number,
    vendorName: bill.vendor_name || "Unknown Vendor",
    amount: `₹${Number(bill.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    status: bill.current_status_display || bill.current_status,
  })) || [];

  const handleCreateBill = React.useCallback(() => {
    alert("Trigger new bill invoice modal dialog.");
  }, []);

  const handleReviewWorkflow = React.useCallback(() => {
    alert("Navigating to workflow review panel.");
  }, []);

  const handleExportReports = React.useCallback(() => {
    alert("Export active billing metrics sheet as Excel/PDF.");
  }, []);

  const handleAuditLogs = React.useCallback(() => {
    alert("Display full system transaction logs registry.");
  }, []);

  // Filter actions based on role
  const isApprover = user?.role === "SUPERVISOR" || user?.role === "MANAGER" || user?.role === "ACCOUNTS" || user?.role === "AUDIT_MANAGER" || user?.is_superuser;

  const showCreateBill = isSuperUser || isReceivingRole;
  const showReviewWorkflow = true;
  const showExportReports = user?.is_superuser || isApprover;
  const showAuditLogs = user?.is_superuser || user?.role === "SUPER_ADMIN";

  const breadcrumbs = [{ name: "AAK Console", path: "/" }, { name: "Dashboard" }];

  // Loading Skeleton State
  if (isMetricsLoading || isBillsLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Operations Dashboard" subtitle="Syncing workspace details..." breadcrumbs={breadcrumbs} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-zinc-200/80 p-5 space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-zinc-200/80 p-5 space-y-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-zinc-200/80 p-5 space-y-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State Panel
  if (metricsError || billsError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Operations Dashboard" subtitle="Connection Failed" breadcrumbs={breadcrumbs} />
        <div className="flex flex-col items-center justify-center p-8 bg-white border border-zinc-200/80 rounded-xl text-center max-w-sm mx-auto my-6 font-sans">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 border border-red-100 text-red-500 mb-4">
            <AlertTriangle className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900">Sync Connection Failed</h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            {metricsError?.friendlyMessage || billsError?.friendlyMessage || "Unable to sync dashboard analytics with the corporate servers. Please check your authorization credentials or retry connection."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Operations Dashboard"
        subtitle={`Welcome back, ${user?.name || "Employee"}. Review your active queues.`}
        breadcrumbs={breadcrumbs}
      />

      {/* KPI Cards Grid */}
      {kpiCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((stat, idx) => (
            <StatCard
              key={idx}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.description}
              trendDirection={stat.description?.includes("-") ? "down" : stat.description?.includes("+") ? "up" : "neutral"}
            />
          ))}
        </div>
      )}

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bills and Workflow Distribution */}
        <div className="lg:col-span-2 space-y-6">
          {isAuditOrAdmin ? (
            <AuditQueueCard
              bills={bills || []}
              deptFilter={deptFilter}
              onDeptFilterChange={setDeptFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              departments={departments}
            />
          ) : isReceivingRole ? (
            <ReceivingRegistrationCard />
          ) : (
            <PendingBillsCard bills={formattedPendingBills} />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ChartCard title="Bill Clearances Trend" subtitle="Monthly clearance and volume graphs" />
            {pipelineDistribution.length > 0 && <WorkflowStatusCard distribution={pipelineDistribution} />}
          </div>
        </div>

        {/* Right Column: Activity and Quick Actions */}
        <div className="space-y-6">
          <QuickActionsCard
            onCreateBill={showCreateBill ? handleCreateBill : undefined}
            onReviewWorkflow={showReviewWorkflow ? handleReviewWorkflow : undefined}
            onExportReports={showExportReports ? handleExportReports : undefined}
            onAuditLogs={showAuditLogs ? handleAuditLogs : undefined}
          />
          {isAuditOrAdmin && (
            <RecentActivityCard activities={metrics?.recent_activities || []} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
