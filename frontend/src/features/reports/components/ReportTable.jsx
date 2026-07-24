import React from "react";
import ReportRow from "./ReportRow";
import ReportEmptyState from "./ReportEmptyState";

const ReportTable = ({ bills = [], onViewDetails }) => {
  if (bills.length === 0) {
    return <ReportEmptyState />;
  }

  return (
    <div className="bg-white border border-zinc-250/60 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left font-sans">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200/80 text-[10px] font-bold text-zinc-450 uppercase tracking-wider select-none">
              <th className="px-4 py-3">Tracking ID</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Current Status</th>
              <th className="px-4 py-3">Current Stage</th>
              <th className="px-4 py-3">Current Owner</th>
              <th className="px-4 py-3 text-right">Bill Amount</th>
              <th className="px-4 py-3">Created Date</th>
              <th className="px-4 py-3 text-center">Age</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {bills.map((bill) => (
              <ReportRow key={bill.id} bill={bill} onViewDetails={onViewDetails} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(ReportTable);
