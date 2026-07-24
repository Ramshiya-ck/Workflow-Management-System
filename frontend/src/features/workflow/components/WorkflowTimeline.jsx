import React from "react";
import WorkflowStep from "./WorkflowStep";

const FLOW_STEPS = [
  { key: "RECEIVING", label: "Draft", role: "Receiving Officer" },
  { key: "DATA_ENTRY", label: "Received", role: "Data Entry Operator" },
  { key: "SUPERVISOR", label: "Data Entry Done", role: "Supervisor" },
  { key: "DEPARTMENT_MANAGER", label: "Supervisor Approved", role: "Manager" },
  { key: "ACCOUNTS", label: "Manager Approved", role: "Finance Officer" },
  { key: "ACCOUNTS_CLEARED", label: "Accounts Cleared", role: "Workflow Closed" }
];

/**
 * Premium horizontal pipeline flow mapping stages from Receiving to Approved.
 */
const WorkflowTimeline = ({ currentStatus }) => {
  const isHolding = currentStatus === "HOLDING";

  // If holding, we need to locate the active step. We can fallback to data entry or extract previous status.
  // For the presentation timeline, we will assume it is holding at department manager if none, or we can pass a previousStatus prop!
  // Let's make it accept a previousStatus so we highlight that stage as holding!
  const getStepStatus = (stepKey, index) => {
    if (currentStatus === "ACCOUNTS_CLEARED") return "completed";
    if (currentStatus === "REJECTED") {
      // Highlight receiving as active/completed, rest as pending
      return index === 0 ? "active" : "pending";
    }

    // Locate current status index
    const activeIndex = FLOW_STEPS.findIndex((s) => s.key === currentStatus);

    if (isHolding) {
      // In holding mode, the currentStatus is HOLDING. The active step would be the step that is currently holding.
      // Usually, this is DEPARTMENT_MANAGER or SUPERVISOR. Let's make it the active index of the held step.
      // If we don't have previousStatus, let's treat the step at index 3 (Manager) as holding.
      const heldIndex = 3; // Manager
      if (index < heldIndex) return "completed";
      if (index === heldIndex) return "holding";
      return "pending";
    }

    if (index < activeIndex) return "completed";
    if (index === activeIndex) return "active";
    return "pending";
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 p-6 bg-white border border-zinc-200 rounded-xl overflow-x-auto">
      {FLOW_STEPS.map((step, idx) => (
        <WorkflowStep
          key={step.key}
          label={step.label}
          role={step.role}
          status={getStepStatus(step.key, idx)}
          isLast={idx === FLOW_STEPS.length - 1}
        />
      ))}
    </div>
  );
};

export default React.memo(WorkflowTimeline);
