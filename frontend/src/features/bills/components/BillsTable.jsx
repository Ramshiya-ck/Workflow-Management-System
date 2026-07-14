import React from "react";
import BillRow from "./BillRow";

/**
 * Reusable table container displaying invoice workflows.
 */
const BillsTable = ({ bills, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden font-sans select-none">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left border-0">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-400 text-[10px] font-bold tracking-wider uppercase">
              <th className="p-4">Tracking ID</th>
              <th className="p-4">Bill Number</th>
              <th className="p-4">Vendor</th>
              <th className="p-4">Department</th>
              <th className="p-4">Bill Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created By</th>
              <th className="p-4">Created Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {bills.map((bill) => (
              <BillRow
                key={bill.id}
                bill={bill}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(BillsTable);
