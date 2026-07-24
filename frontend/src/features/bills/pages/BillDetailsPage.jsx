import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Building2, Receipt, ShieldCheck, FileText, CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import BillInfoCard from "../components/BillInfoCard";
import StatusBadge from "../components/StatusBadge";
import TrackingBadge from "../components/TrackingBadge";
import Skeleton from "@/components/common/Skeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useBill } from "../hooks/useBill";

const STEPS_FLOW = [
  { key: "RECEIVING", label: "Draft", role: "Receiving Officer" },
  { key: "DATA_ENTRY", label: "Received", role: "Data Entry Operator" },
  { key: "SUPERVISOR", label: "Data Entry Done", role: "Supervisor" },
  { key: "DEPARTMENT_MANAGER", label: "Supervisor Approved", role: "Manager" },
  { key: "ACCOUNTS", label: "Manager Approved", role: "Finance Officer" },
];

/**
 * Detailed invoice overview page displaying vendor data and visual timeline trackers.
 */
const BillDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  // Query dynamic details
  const { data: billResponse, isLoading: isBillLoading, error: billError } = useBill(id);

  const bill = billResponse?.data;

  // Resolve timeline states dynamically based on backend current status
  const timelineSteps = useMemo(() => {
    if (!bill) return [];
    const current = bill.current_status || "RECEIVING";

    if (current === "REJECTED") {
      // Show failed status on timeline
      return STEPS_FLOW.map((s, idx) => ({
        ...s,
        time: idx === 0 ? "Completed" : "Interrupted",
        status: idx === 0 ? "completed" : "rejected",
      }));
    }

    if (current === "ACCOUNTS_CLEARED") {
      // All steps completed
      return STEPS_FLOW.map((s) => ({
        ...s,
        time: "Cleared",
        status: "completed",
      }));
    }

    const currentIndex = STEPS_FLOW.findIndex((s) => s.key === current);

    return STEPS_FLOW.map((s, idx) => {
      let status = "pending";
      let time = "Pending";

      if (idx < currentIndex) {
        status = "completed";
        time = "Approved";
      } else if (idx === currentIndex) {
        status = "active";
        time = "Active Queue";
      }

      return {
        ...s,
        time,
        status,
      };
    });
  }, [bill]);

  const breadcrumbs = useMemo(() => {
    return [
      { name: "AAK Console", path: "/" },
      { name: "Bills", path: "/bills" },
      { name: bill?.bill_number || "Invoice Details" },
    ];
  }, [bill]);

  if (isBillLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Invoice Details" subtitle="Loading invoice specs..." breadcrumbs={[{ name: "Bills", path: "/bills" }, { name: "Details" }]} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (billError || !bill) {
    return (
      <div className="space-y-6">
        <PageHeader title="Invoice Details" subtitle="Sync Failed" breadcrumbs={[{ name: "Bills", path: "/bills" }, { name: "Sync Error" }]} />
        <div className="flex flex-col items-center justify-center p-8 bg-white border border-zinc-200 rounded-xl text-center max-w-sm mx-auto my-6 font-sans">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 border border-red-100 text-red-500 mb-4">
            <AlertTriangle className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900">Sync Connection Failed</h3>
          <p className="text-xs text-zinc-550 mt-1 leading-relaxed">
            {billError?.friendlyMessage || "Unable to sync bill records with the corporate servers. Please try again."}
          </p>
        </div>
      </div>
    );
  }

  const formattedAmount = `₹${Number(bill.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6 select-none font-sans max-w-5xl">
      {/* Page Header */}
      <PageHeader
        title={`Invoice ${bill.bill_number}`}
        subtitle={`Global workflow state log details`}
        breadcrumbs={breadcrumbs}
        primaryAction={
          <Link to="/bills">
            <Button variant="outline" className="cursor-pointer gap-2 border border-zinc-200">
              <ArrowLeft className="size-4" />
              <span>Back to Bills</span>
            </Button>
          </Link>
        }
      />

      {/* Rejection Alert Banner if rejection_reason exists */}
      {bill.rejection_reason && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start gap-3 select-none text-left mb-6">
          <div className="p-2 bg-rose-100/80 rounded-lg text-rose-600 shrink-0">
            <AlertTriangle className="size-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">Invoice Rejected</h4>
            <p className="text-xs text-rose-700 leading-relaxed font-semibold">
              This invoice was returned for correction. Rejection Reason: <span className="font-bold font-sans text-rose-950 underline">{bill.rejection_reason}</span>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Columns: Core Bill parameters */}
        <div className="md:col-span-2 space-y-6">
          {/* Card 1: Bill parameters */}
          <BillInfoCard title="Invoice Information" icon={Receipt}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Tracking ID</span>
                <TrackingBadge trackingId={bill.tracking_id} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Bill Number</span>
                <span className="text-zinc-800 font-bold">{bill.bill_number}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Invoice Date</span>
                <span className="text-zinc-700 font-semibold block">{bill.bill_date}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Invoice Amount</span>
                <span className="text-zinc-950 font-bold text-sm block font-mono">{formattedAmount}</span>
              </div>
              {bill.rejection_reason && (
                <div className="space-y-1 sm:col-span-2 bg-red-50 border border-red-100 rounded-lg p-3">
                  <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">Rejection Reason</span>
                  <p className="text-red-700 font-semibold leading-relaxed">
                    {bill.rejection_reason}
                  </p>
                </div>
              )}
            </div>
          </BillInfoCard>

          {/* Card 2: Vendor details */}
          <BillInfoCard title="Associated Vendor" icon={Building2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Vendor Name</span>
                <span className="text-zinc-800 font-bold block">{bill.vendor?.name}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">GSTIN Registration</span>
                <span className="text-zinc-700 font-mono font-bold block">{bill.vendor?.gst_number || "N/A"}</span>
              </div>
            </div>
          </BillInfoCard>

          {/* Card 3: Department Details */}
          <BillInfoCard title="Assigned Department" icon={ShieldCheck}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Department Name</span>
                <span className="text-zinc-800 font-bold block">{bill.department?.name || "Unassigned"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Department Code</span>
                <span className="text-zinc-700 font-mono font-bold block">{bill.department?.code || "N/A"}</span>
              </div>
            </div>
          </BillInfoCard>


        </div>

        {/* Right Column: Workflow timeline tracker */}
        <div className="md:col-span-1 space-y-6">
          {/* Card 5: Workflow Timeline */}
          <BillInfoCard title="Clearance Lifecycle" icon={ShieldCheck}>
            <div className="space-y-4 pt-1 select-none">
              <div className="flex justify-between items-center pb-2">
                <span className="text-zinc-450 font-bold">Current Step:</span>
                <StatusBadge status={bill.current_status} />
              </div>

              {/* Timeline layout */}
              <div className="relative pl-6 space-y-5 border-l border-zinc-200 ml-3">
                {timelineSteps.map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle icon */}
                    <div className="absolute -left-[31px] top-0.5 bg-white p-0.5">
                      {step.status === "completed" ? (
                        <CheckCircle2 className="size-4 text-emerald-600 bg-white" />
                      ) : step.status === "active" ? (
                        <Circle className="size-4 text-amber-550 fill-amber-550" />
                      ) : step.status === "rejected" ? (
                        <CheckCircle2 className="size-4 text-red-650 bg-white" />
                      ) : (
                        <Circle className="size-4 text-zinc-300 fill-zinc-100" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-zinc-800 block leading-tight">{step.label}</span>
                      <span className="text-[10px] text-zinc-550 font-semibold block">{step.role}</span>
                      <span className="text-[9px] text-zinc-400 font-semibold font-mono block">{step.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BillInfoCard>
        </div>
      </div>
    </div>
  );
};

export default BillDetailsPage;
