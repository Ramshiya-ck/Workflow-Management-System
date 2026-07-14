import React from "react";
import { Edit2, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Mobile-responsive card view for vendor listings.
 */
const VendorCard = ({ vendor, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5 space-y-4 font-sans text-xs flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <Link 
              to={`/vendors/${vendor.id}`}
              className="font-bold text-zinc-900 leading-tight hover:underline cursor-pointer block"
            >
              {vendor.name}
            </Link>
            <span className="font-mono font-bold text-[10px] text-zinc-400 tracking-wider">
              {vendor.code}
            </span>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase border
              ${vendor.isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-zinc-50 text-zinc-450 border-zinc-150"
              }
            `}
          >
            {vendor.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {vendor.gstNumber && (
          <div className="text-[9px] font-bold text-zinc-400 tracking-wide uppercase">
            GSTIN: {vendor.gstNumber}
          </div>
        )}
      </div>

      <div className="space-y-1.5 text-zinc-500 font-medium">
        <div className="flex justify-between">
          <span>Contact:</span>
          <span className="font-semibold text-zinc-700">{vendor.contactPerson || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span>Email:</span>
          <span className="font-semibold text-zinc-700 truncate max-w-[150px]">{vendor.email}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-zinc-400">
        <span className="text-[9px] font-bold uppercase tracking-wider">Registered: {vendor.createdDate}</span>

        <div className="flex gap-1">
          <Link
            to={`/vendors/${vendor.id}`}
            className="p-1.5 rounded-md hover:bg-zinc-100 hover:text-zinc-800 transition-all cursor-pointer"
            title="View details"
          >
            <Eye className="size-3.5" />
          </Link>
          <button
            onClick={() => onEdit(vendor)}
            className="p-1.5 rounded-md hover:bg-zinc-100 hover:text-zinc-800 transition-all cursor-pointer"
            title="Edit"
          >
            <Edit2 className="size-3.5" />
          </button>
          <button
            onClick={() => onDelete(vendor)}
            className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-650 transition-all cursor-pointer"
            title="Delete"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(VendorCard);
