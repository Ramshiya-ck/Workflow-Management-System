import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/", roles: ["SUPER_ADMIN", "DATA_ENTRY", "SUPERVISOR", "DEPARTMENT_MANAGER", "ACCOUNTS"] },
    { name: "Bills & Workflows", path: "/bills", roles: ["SUPER_ADMIN", "DATA_ENTRY", "SUPERVISOR", "DEPARTMENT_MANAGER", "ACCOUNTS"] },
    { name: "Departments", path: "/departments", roles: ["SUPER_ADMIN"] },
    { name: "Vendors", path: "/vendors", roles: ["SUPER_ADMIN"] },
    { name: "Reports & Exports", path: "/reports", roles: ["SUPER_ADMIN", "DATA_ENTRY", "SUPERVISOR", "DEPARTMENT_MANAGER", "ACCOUNTS"] },
    { name: "Users & Roles", path: "/users", roles: ["SUPER_ADMIN"] },
    { name: "Audit Trails", path: "/audit-logs", roles: ["SUPER_ADMIN"] },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col justify-between shadow-xl">
      <div>
        {/* Header / Brand Logo */}
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="text-xl font-bold tracking-wider text-blue-400">
            AAK Workflow
          </Link>
          <div className="mt-1 text-xs text-slate-400 font-mono">Hypermarket WMS</div>
        </div>

        {/* Navigation List */}
        <nav className="mt-6 px-4 space-y-1">
          {menuItems.map((item) => {
            if (item.roles && !hasRole(item.roles)) return null;
            const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-350 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="truncate mr-2">
            <div className="text-sm font-semibold truncate">
              {user?.first_name} {user?.last_name}
            </div>
            <div className="text-xs text-blue-400 font-medium truncate">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-red-650 hover:text-white transition-colors"
            title="Log Out"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
