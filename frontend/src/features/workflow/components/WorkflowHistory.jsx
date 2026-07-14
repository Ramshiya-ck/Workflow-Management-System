import React from "react";
import WorkflowStatusBadge from "./WorkflowStatusBadge";

/**
 * Audit trail history log records for invoice transitions.
 */
const WorkflowHistory = ({ history = [] }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
      <table className="w-full text-left border-collapse font-sans text-xs">
        <thead>
          <tr className="bg-zinc-50 border-b border-zinc-200">
            <th className="p-3 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">From Status</th>
            <th className="p-3 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">To Status</th>
            <th className="p-3 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Action</th>
            <th className="p-3 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Performed By</th>
            <th className="p-3 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Date & Time</th>
            <th className="p-3 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Reason Code</th>
            <th className="p-3 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Comments</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {history.length === 0 ? (
            <tr>
              <td colSpan="7" className="p-6 text-center text-zinc-400 font-semibold">
                No workflow action history log records found.
              </td>
            </tr>
          ) : (
            history.map((step, idx) => (
              <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                <td className="p-3">
                  {step.fromStatus ? <WorkflowStatusBadge status={step.fromStatus} /> : <span className="text-zinc-400">—</span>}
                </td>
                <td className="p-3">
                  <WorkflowStatusBadge status={step.toStatus} />
                </td>
                <td className="p-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                    step.action === "APPROVE" || step.action === "SUBMIT"
                      ? "bg-emerald-50 text-emerald-700"
                      : step.action === "REJECT"
                      ? "bg-rose-50 text-rose-700"
                      : step.action === "HOLD"
                      ? "bg-orange-50 text-orange-700"
                      : "bg-blue-50 text-blue-700"
                  }`}>
                    {step.action}
                  </span>
                </td>
                <td className="p-3 font-semibold text-zinc-800">{step.performedBy}</td>
                <td className="p-3 text-zinc-550 font-medium font-mono">{step.dateTime}</td>
                <td className="p-3">
                  {step.reason ? (
                    <span className="text-xs font-bold text-rose-700">{step.reason}</span>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
                <td className="p-3 text-zinc-700 leading-relaxed max-w-xs truncate" title={step.comment}>
                  {step.comment || <span className="text-zinc-400">—</span>}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(WorkflowHistory);
