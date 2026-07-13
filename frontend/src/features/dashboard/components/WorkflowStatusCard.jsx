import React from "react";

/**
 * Metric progress bars representing counts of bills at each workflow level.
 */
const WorkflowStatusCard = ({ distribution = [] }) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5 space-y-4 font-sans select-none">
      <div className="border-b border-zinc-100 pb-3">
        <h3 className="text-sm font-bold text-zinc-900">Pipeline Distribution</h3>
      </div>

      <div className="space-y-3.5">
        {distribution.map((dist, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-zinc-700">{dist.statusName}</span>
              <span className="font-bold text-zinc-900">{dist.count} bills</span>
            </div>
            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-900 rounded-full transition-all duration-500"
                style={{ width: `${dist.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(WorkflowStatusCard);
