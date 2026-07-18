import React from "react";
import { Edit2, Trash2 } from "lucide-react";

/**
 * Mobile-responsive card rendering for individual department records.
 */
const DepartmentCard = ({ department, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5 space-y-4 font-sans text-xs flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <h4 className="font-bold text-zinc-900 leading-tight">{department.name}</h4>
            <span className="font-mono font-bold text-[10px] text-zinc-400 tracking-wider">
              {department.code}
            </span>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase border
              ${department.isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-zinc-50 text-zinc-450 border-zinc-150"
              }
            `}
          >
            {department.isActive ? "Active" : "Inactive"}
          </span>
        </div>

      </div>

      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-zinc-400">
        <div className="space-y-0.5">
          <span className="text-[9px] text-zinc-400 font-bold block uppercase tracking-wider">Created Date</span>
          <span className="font-semibold text-zinc-700 block">{department.createdDate}</span>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onEdit(department)}
            className="p-1.5 rounded-md hover:bg-zinc-100 hover:text-zinc-800 transition-all cursor-pointer"
            title="Edit"
          >
            <Edit2 className="size-3.5" />
          </button>
          <button
            onClick={() => onDelete(department)}
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

export default React.memo(DepartmentCard);
