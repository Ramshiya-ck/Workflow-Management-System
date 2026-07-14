import React from "react";
import { Edit2, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Standard table row layout for vendor records.
 */
const VendorRow = ({ vendor, onEdit, onDelete }) => {
  return (
    <tr className="hover:bg-zinc-50/50 transition-colors border-b border-zinc-100 last:border-0 font-sans text-xs">
      {/* Vendor Name */}
      <td className="p-4 align-middle">
        <Link 
          to={`/vendors/${vendor.id}`}
          className="font-bold text-zinc-900 hover:text-zinc-950 hover:underline cursor-pointer"
        >
          {vendor.name}
        </Link>
        {vendor.gstNumber && (
          <div className="text-[9px] font-bold text-zinc-400 tracking-wide uppercase mt-0.5">
            GSTIN: {vendor.gstNumber}
          </div>
        )}
      </td>

      {/* Code */}
      <td className="p-4 align-middle font-mono font-bold text-zinc-650 tracking-wider">
        {vendor.code}
      </td>

      {/* Contact Person */}
      <td className="p-4 align-middle text-zinc-700 font-medium">
        {vendor.contactPerson || "N/A"}
      </td>

      {/* Email */}
      <td className="p-4 align-middle text-zinc-450 font-semibold truncate max-w-xs">
        {vendor.email}
      </td>

      {/* Phone */}
      <td className="p-4 align-middle text-zinc-450 font-semibold font-mono">
        {vendor.phone || "N/A"}
      </td>

      {/* Status Badge */}
      <td className="p-4 align-middle">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border
            ${vendor.isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-zinc-50 text-zinc-450 border-zinc-150"
            }
          `}
        >
          {vendor.isActive ? "Active" : "Inactive"}
        </span>
      </td>

      {/* Created Date */}
      <td className="p-4 align-middle text-zinc-400 font-semibold">
        {vendor.createdDate || "N/A"}
      </td>

      {/* Actions */}
      <td className="p-4 align-middle text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/vendors/${vendor.id}`}
            className="p-1.5 rounded-md text-zinc-455 hover:bg-zinc-100 hover:text-zinc-800 transition-all cursor-pointer"
            title="View Details"
          >
            <Eye className="size-3.5" />
          </Link>
          <button
            onClick={() => onEdit(vendor)}
            className="p-1.5 rounded-md text-zinc-455 hover:bg-zinc-100 hover:text-zinc-800 transition-all cursor-pointer"
            title="Edit Vendor"
          >
            <Edit2 className="size-3.5" />
          </button>
          <button
            onClick={() => onDelete(vendor)}
            className="p-1.5 rounded-md text-zinc-455 hover:bg-red-50 hover:text-red-650 transition-all cursor-pointer"
            title="Delete Vendor"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default React.memo(VendorRow);
