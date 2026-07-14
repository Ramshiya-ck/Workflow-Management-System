import React, { useState, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Receipt, ShieldCheck, FileText, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import BillInfoCard from "@/features/bills/components/BillInfoCard";
import TrackingBadge from "@/features/bills/components/TrackingBadge";
import WorkflowStatusBadge from "../components/WorkflowStatusBadge";
import WorkflowTimeline from "../components/WorkflowTimeline";
import WorkflowHistory from "../components/WorkflowHistory";
import HoldingBanner from "../components/HoldingBanner";
import ActionButtons from "../components/ActionButtons";
import WorkflowSkeleton from "../components/WorkflowSkeleton";

import ApproveWorkflowDialog from "../components/ApproveWorkflowDialog";
import RejectWorkflowDialog from "../components/RejectWorkflowDialog";
import HoldWorkflowDialog from "../components/HoldWorkflowDialog";
import ResumeWorkflowDialog from "../components/ResumeWorkflowDialog";

import { useWorkflowBill } from "../hooks/useWorkflowBill";
import { useWorkflowHistory } from "../hooks/useWorkflowHistory";
import { useApproveWorkflow } from "../hooks/useApproveWorkflow";
import { useRejectWorkflow } from "../hooks/useRejectWorkflow";
import { useHoldWorkflow } from "../hooks/useHoldWorkflow";
import { useResumeWorkflow } from "../hooks/useResumeWorkflow";

import { useAuth } from "@/features/auth/AuthContext";

const STATUS_OWNER_MAP = {
  RECEIVING: "Receiving Officer",
  DATA_ENTRY: "Data Entry Operator",
  SUPERVISOR: "Supervisor",
  DEPARTMENT_MANAGER: "Manager",
  ACCOUNTS: "Finance Officer",
  HOLDING: "Held Queue",
};

/**
 * Workflow detailed review page. Receives state and actions strictly from Hooks.
 */
const WorkflowDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Query Details and History from Hooks
  const { data: billResponse, isLoading: isBillLoading, error: billError } = useWorkflowBill(id);
  const { data: historyResponse, isLoading: isHistoryLoading } = useWorkflowHistory(id);

  const bill = billResponse?.data;
  const history = useMemo(() => historyResponse?.data || [], [historyResponse]);

  // State mutation hooks
  const approveMutation = useApproveWorkflow();
  const rejectMutation = useRejectWorkflow();
  const holdMutation = useHoldWorkflow();
  const resumeMutation = useResumeWorkflow();

  // Dialog overlays triggers
  const [activeDialog, setActiveDialog] = useState(null); // 'approve' | 'reject' | 'hold' | 'resume' | null

  // Map history to presentation layout format
  const mappedHistory = useMemo(() => {
    return history.map((h) => ({
      fromStatus: h.from_status,
      toStatus: h.to_status,
      action: h.action,
      performedBy: h.performed_by?.email || "System",
      dateTime: h.created_at
        ? new Date(h.created_at).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "N/A",
      reason: h.reason_code,
      comment: h.reason_note || h.comments,
    }));
  }, [history]);

  // Extract hold banner info from last hold transition entry
  const holdingInfo = useMemo(() => {
    if (bill?.current_status !== "HOLDING") return null;
    const holdEntry = [...history].reverse().find((h) => h.action === "HOLD");
    if (!holdEntry) return null;
    return {
      heldBy: holdEntry.performed_by?.email || "System",
      holdReason: holdEntry.reason_code || "Unknown",
      holdDate: holdEntry.created_at
        ? new Date(holdEntry.created_at).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "N/A",
      customNote: holdEntry.reason_note || holdEntry.comments || "Placed on hold.",
    };
  }, [bill, history]);

  // Enterprise Role-Based Queue Actions authorization check
  const canAct = useMemo(() => {
    if (!user || !bill) return false;
    if (user.is_superuser || user.role === "SUPER_ADMIN") return true;

    let checkStatus = bill.current_status;
    if (checkStatus === "HOLDING") {
      const lastHold = [...history].reverse().find((h) => h.action === "HOLD");
      checkStatus = lastHold ? lastHold.from_status : "RECEIVING";
    }

    const ROLE_MAP = {
      RECEIVING: "DATA_ENTRY",
      DATA_ENTRY: "DATA_ENTRY",
      SUPERVISOR: "SUPERVISOR",
      DEPARTMENT_MANAGER: "DEPARTMENT_MANAGER",
      ACCOUNTS: "ACCOUNTS",
    };

    const requiredRole = ROLE_MAP[checkStatus];
    return user.role === requiredRole;
  }, [user, bill, history]);

  // Callback handlers calling mutation hooks
  const handleApproveConfirm = useCallback(() => {
    approveMutation.mutate(
      { id, comments: "Approved." },
      {
        onSuccess: () => {
          setActiveDialog(null);
          navigate("/workflow");
        },
      }
    );
  }, [id, approveMutation, navigate]);

  const handleRejectConfirm = useCallback((data) => {
    rejectMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          setActiveDialog(null);
          navigate("/workflow");
        },
      }
    );
  }, [id, rejectMutation, navigate]);

  const handleHoldConfirm = useCallback((data) => {
    holdMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          setActiveDialog(null);
          navigate("/workflow");
        },
      }
    );
  }, [id, holdMutation, navigate]);

  const handleResumeConfirm = useCallback(() => {
    resumeMutation.mutate(
      { id, comments: "Resumed." },
      {
        onSuccess: () => {
          setActiveDialog(null);
          navigate("/workflow");
        },
      }
    );
  }, [id, resumeMutation, navigate]);

  const breadcrumbs = useMemo(() => {
    return [
      { name: "AAK Console", path: "/" },
      { name: "Workflow Queue", path: "/workflow" },
      { name: bill?.bill_number || "Invoice Review" },
    ];
  }, [bill]);

  if (isBillLoading || isHistoryLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Review Invoice" subtitle="Loading invoice specs..." breadcrumbs={[{ name: "Queue", path: "/workflow" }, { name: "Review" }]} />
        <WorkflowSkeleton view="table" />
      </div>
    );
  }

  if (billError || !bill) {
    return (
      <div className="space-y-6">
        <PageHeader title="Review Invoice" subtitle="Sync Failed" breadcrumbs={[{ name: "Queue", path: "/workflow" }, { name: "Sync Error" }]} />
        <div className="flex flex-col items-center justify-center p-8 bg-white border border-zinc-200 rounded-xl text-center max-w-sm mx-auto my-6 font-sans">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 border border-red-100 text-red-500 mb-4">
            <AlertTriangle className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900">Sync Connection Failed</h3>
          <p className="text-xs text-zinc-550 mt-1 leading-relaxed">
            {billError?.friendlyMessage || "Unable to sync workflow records with the corporate servers. Please try again."}
          </p>
        </div>
      </div>
    );
  }

  const formattedAmount = `₹${Number(bill.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const isMutating = approveMutation.isPending || rejectMutation.isPending || holdMutation.isPending || resumeMutation.isPending;

  const currentPriority = parseFloat(bill.amount) > 100000 ? "High" : parseFloat(bill.amount) > 20000 ? "Medium" : "Low";

  return (
    <div className="space-y-6 select-none font-sans max-w-5xl">
      {/* Page Header */}
      <PageHeader
        title={`Review Invoice: ${bill.bill_number}`}
        subtitle="Perform verification steps and authorize next stage approvals."
        breadcrumbs={breadcrumbs}
        primaryAction={
          <Link to="/workflow">
            <Button variant="outline" className="cursor-pointer gap-2 border border-zinc-200">
              <ArrowLeft className="size-4" />
              <span>Back to Queue</span>
            </Button>
          </Link>
        }
      />

      {/* Holding Alert Banner if status matches */}
      {bill.current_status === "HOLDING" && holdingInfo && (
        <HoldingBanner
          heldBy={holdingInfo.heldBy}
          holdReason={holdingInfo.holdReason}
          holdDate={holdingInfo.holdDate}
          customNote={holdingInfo.customNote}
          onResume={() => setActiveDialog("resume")}
          disabled={isMutating}
        />
      )}

      {/* Workflow Visual Timeline */}
      <WorkflowTimeline currentStatus={bill.current_status} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left main columns */}
        <div className="md:col-span-2 space-y-6">
          {/* Card 1: Core Bill Information */}
          <BillInfoCard title="Invoice Information" icon={Receipt}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Tracking ID</span>
                <TrackingBadge trackingId={bill.tracking_id} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Bill Number</span>
                <span className="text-zinc-900 font-bold">{bill.bill_number}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Invoice Date</span>
                <span className="text-zinc-700 font-semibold block">{bill.bill_date}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Invoice Amount</span>
                <span className="text-zinc-950 font-bold block font-mono">{formattedAmount}</span>
              </div>
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
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Verification checks</span>
                <span className="text-emerald-700 font-bold block">Verified Supplier</span>
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
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Verification status</span>
                <span className="text-zinc-650 font-semibold block">Mapped via Data Entry</span>
              </div>
            </div>
          </BillInfoCard>

          {/* Card 4: Attachments scan slots */}
          <BillInfoCard title="Attachments & Invoices scan files" icon={FileText}>
            <div className="border border-dashed border-zinc-200 rounded-xl p-6 text-center text-zinc-400 font-semibold flex flex-col items-center gap-2">
              <FileText className="size-8 text-zinc-300" />
              <p className="text-xs">No scan attachment uploads found.</p>
            </div>
          </BillInfoCard>

          {/* Card 5: Action buttons (Only show if user role matches active stage) */}
          {canAct && (
            <ActionButtons
              currentStatus={bill.current_status}
              onApprove={() => setActiveDialog("approve")}
              onReject={() => setActiveDialog("reject")}
              onHold={() => setActiveDialog("hold")}
              onResume={() => setActiveDialog("resume")}
              disabled={isMutating}
            />
          )}
        </div>

        {/* Right timeline audit logs column */}
        <div className="md:col-span-1 space-y-6">
          <BillInfoCard title="Approval Trail" icon={ShieldCheck}>
            <div className="space-y-4 pt-1">
              <div className="flex justify-between items-center pb-2">
                <span className="text-zinc-450 font-bold">Queue status:</span>
                <WorkflowStatusBadge status={bill.current_status} />
              </div>

              {/* Status details summary */}
              <div className="bg-zinc-50 border border-zinc-250/60 rounded-lg p-3 space-y-2 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase block leading-none mb-0.5">Current Owner</span>
                  <span className="text-zinc-800 font-bold">{STATUS_OWNER_MAP[bill.current_status] || "System"}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase block leading-none mb-0.5">Queue Priority</span>
                  <span className={`font-bold ${currentPriority === "High" ? "text-red-700" : "text-zinc-700"}`}>
                    {currentPriority} Priority
                  </span>
                </div>
              </div>
            </div>
          </BillInfoCard>
        </div>

        {/* Full width bottom history log table */}
        <div className="md:col-span-3 space-y-3">
          <h3 className="text-sm font-bold text-zinc-900 px-1">Transition Audit Log History</h3>
          <WorkflowHistory history={mappedHistory} />
        </div>
      </div>

      {/* Interaction Dialog overlays */}
      <ApproveWorkflowDialog
        isOpen={activeDialog === "approve"}
        onClose={() => setActiveDialog(null)}
        onConfirm={handleApproveConfirm}
        isLoading={isMutating}
      />

      <RejectWorkflowDialog
        isOpen={activeDialog === "reject"}
        onClose={() => setActiveDialog(null)}
        onConfirm={handleRejectConfirm}
        isLoading={isMutating}
      />

      <HoldWorkflowDialog
        isOpen={activeDialog === "hold"}
        onClose={() => setActiveDialog(null)}
        onConfirm={handleHoldConfirm}
        isLoading={isMutating}
      />

      <ResumeWorkflowDialog
        isOpen={activeDialog === "resume"}
        onClose={() => setActiveDialog(null)}
        onConfirm={handleResumeConfirm}
        isLoading={isMutating}
      />
    </div>
  );
};

export default WorkflowDetailsPage;
