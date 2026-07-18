import React from "react";
import { Eye, Edit2, KeyRound, UserCheck, UserX } from "lucide-react";
import UserStatusBadge from "./UserStatusBadge";

const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  RECEIVING: "Receiving",
  DATA_ENTRY: "Data Entry",
  SUPERVISOR: "Supervisor",
  MANAGER: "Manager",
  ACCOUNTS: "Accounts",
  AUDIT_MANAGER: "Audit Manager",
};

const UserCard = ({ user, onView, onEdit, onResetPassword, onToggleStatus }) => {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-4 space-y-4 font-sans select-none">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-zinc-900">
            {user.first_name} {user.last_name || ""}
          </h4>
          <p className="text-xs text-zinc-500">{user.email}</p>
        </div>
        <UserStatusBadge isActive={user.is_active} />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 text-xs">
        <div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Access Role
          </span>
          <span className="text-zinc-700 font-medium mt-0.5 inline-block">
            {ROLE_LABELS[user.role] || user.role}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Department
          </span>
          <span className="text-zinc-700 font-medium mt-0.5 inline-block">
            {user.department ? `${user.department.name} (${user.department.code})` : "—"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
        <span className="text-[10px] text-zinc-400 font-medium">
          Added {new Date(user.created_at).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onView(user.id)}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all cursor-pointer"
            title="View Details"
          >
            <Eye className="size-4" />
          </button>
          <button
            onClick={() => onEdit(user.id)}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all cursor-pointer"
            title="Edit User"
          >
            <Edit2 className="size-4" />
          </button>
          <button
            onClick={() => onResetPassword(user)}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all cursor-pointer"
            title="Reset Password"
          >
            <KeyRound className="size-4" />
          </button>
          <button
            onClick={() => onToggleStatus(user)}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              user.is_active
                ? "text-red-500 hover:bg-red-50 hover:text-red-650"
                : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
            title={user.is_active ? "Deactivate User" : "Activate User"}
          >
            {user.is_active ? <UserX className="size-4" /> : <UserCheck className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(UserCard);
