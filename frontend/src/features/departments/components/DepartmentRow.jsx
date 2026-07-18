import React from "react";
import { Edit2, Trash2 } from "lucide-react";

/**
 * Standard table row layout for department records.
 */
const DepartmentRow = ({ department, onEdit, onDelete }) => {
  return (
    <tr className="hover:bg-zinc-50/50 transition-colors border-b border-zinc-100 last:border-0 font-sans text-xs">
      {/* Department Name */}
      <td className="p-4 align-middle">
        <div className="font-bold text-zinc-900">{department.name}</div>
      </td>

      {/* Code */}
      <td className="p-4 align-middle font-mono font-bold text-zinc-650 tracking-wider">
        {department.code}
      </td>

      {/* Status Badge */}
      <td className="p-4 align-middle">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border
            ${department.isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-zinc-50 text-zinc-450 border-zinc-150"
            }
          `}
        >
          {department.isActive ? "Active" : "Inactive"}
        </span>
      </td>

      {/* Created Date */}
      <td className="p-4 align-middle text-zinc-400 font-semibold">
        {department.createdDate}
      </td>

      {/* Action Buttons */}
      <td className="p-4 align-middle text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onEdit(department)}
            className="p-1.5 rounded-md text-zinc-450 hover:bg-zinc-100 hover:text-zinc-800 transition-all cursor-pointer"
            title="Edit Department"
          >
            <Edit2 className="size-3.5" />
          </button>
          <button
            onClick={() => onDelete(department)}
            className="p-1.5 rounded-md text-zinc-450 hover:bg-red-50 hover:text-red-650 transition-all cursor-pointer"
            title="Delete Department"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default React.memo(DepartmentRow);
