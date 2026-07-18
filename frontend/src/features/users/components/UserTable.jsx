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

const UserTable = ({ users, onView, onEdit, onResetPassword, onToggleStatus }) => {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden font-sans select-none">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/50">
              <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Name
              </th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Email
              </th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Role
              </th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Department
              </th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Status
              </th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Created At
              </th>
              <th className="p-4 text-right text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-150">
            {users.map((user) => (
              <tr 
                key={user.id} 
                className="hover:bg-zinc-50/40 transition-colors group"
              >
                {/* Name */}
                <td className="p-4 align-middle text-xs font-semibold text-zinc-900">
                  {user.first_name} {user.last_name || ""}
                </td>

                {/* Email */}
                <td className="p-4 align-middle text-xs text-zinc-500">
                  {user.email}
                </td>

                {/* Role */}
                <td className="p-4 align-middle text-xs text-zinc-700">
                  <span className="inline-flex px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-medium text-[10px]">
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                </td>

                {/* Department */}
                <td className="p-4 align-middle text-xs text-zinc-650">
                  {user.department ? (
                    <span>
                      {user.department.name} <span className="text-[10px] text-zinc-400 font-bold">({user.department.code})</span>
                    </span>
                  ) : (
                    <span className="text-zinc-300 font-medium">—</span>
                  )}
                </td>

                {/* Status */}
                <td className="p-4 align-middle">
                  <UserStatusBadge isActive={user.is_active} />
                </td>

                {/* Created At */}
                <td className="p-4 align-middle text-xs text-zinc-450">
                  {new Date(user.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>

                {/* Actions */}
                <td className="p-4 align-middle text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onView(user.id)}
                      className="p-1.5 rounded-md text-zinc-450 hover:bg-zinc-100 hover:text-zinc-800 transition-all cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="size-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit(user.id)}
                      className="p-1.5 rounded-md text-zinc-450 hover:bg-zinc-100 hover:text-zinc-800 transition-all cursor-pointer"
                      title="Edit User"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      onClick={() => onResetPassword(user)}
                      className="p-1.5 rounded-md text-zinc-450 hover:bg-zinc-100 hover:text-zinc-800 transition-all cursor-pointer"
                      title="Reset Password"
                    >
                      <KeyRound className="size-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(user)}
                      className={`p-1.5 rounded-md transition-all cursor-pointer ${
                        user.is_active
                          ? "text-red-500 hover:bg-red-50 hover:text-red-650"
                          : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                      title={user.is_active ? "Deactivate User" : "Activate User"}
                    >
                      {user.is_active ? <UserX className="size-3.5" /> : <UserCheck className="size-3.5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(UserTable);
