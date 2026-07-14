import React from "react";
import VendorRow from "./VendorRow";

/**
 * Table container for suppliers database.
 */
const VendorTable = ({ vendors, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden font-sans select-none">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left border-0">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-400 text-[10px] font-bold tracking-wider uppercase">
              <th className="p-4 w-1/4">Vendor Name</th>
              <th className="p-4">Code</th>
              <th className="p-4">Contact Person</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {vendors.map((vendor) => (
              <VendorRow
                key={vendor.id}
                vendor={vendor}
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

export default React.memo(VendorTable);
