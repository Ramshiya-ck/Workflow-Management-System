import {
  LayoutDashboard,
  Building2,
  Users,
  Receipt,
  GitPullRequest,
  History,
  BarChart3,
  Bell,
  Settings
} from "lucide-react";

/**
 * Centeralized navigation schema mapping path items to employee roles.
 */
export const NAVIGATION_ITEMS = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "RECEIVING", "DATA_ENTRY", "SUPERVISOR", "MANAGER", "ACCOUNTS", "AUDIT_MANAGER"],
  },
  {
    name: "Departments",
    path: "/departments",
    icon: Building2,
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Vendors",
    path: "/vendors",
    icon: Users,
    roles: ["SUPER_ADMIN", "RECEIVING"],
  },
  {
    name: "Users",
    path: "/users",
    icon: Users,
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Bills",
    path: "/bills",
    icon: Receipt,
    roles: ["SUPER_ADMIN", "RECEIVING", "DATA_ENTRY", "SUPERVISOR", "MANAGER", "ACCOUNTS", "AUDIT_MANAGER"],
  },
  {
    name: "Workflow",
    path: "/workflow",
    icon: GitPullRequest,
    roles: ["SUPER_ADMIN", "RECEIVING", "DATA_ENTRY", "SUPERVISOR", "MANAGER", "ACCOUNTS", "AUDIT_MANAGER"],
  },
  {
    name: "Logs",
    path: "/logs",
    icon: History,
    roles: ["SUPER_ADMIN", "AUDIT_MANAGER"],
  },
  {
    name: "Reports",
    path: "/reports",
    icon: BarChart3,
    roles: ["SUPER_ADMIN", "AUDIT_MANAGER"],
  },
  {
    name: "Notifications",
    path: "/notifications",
    icon: Bell,
    roles: ["SUPER_ADMIN", "RECEIVING", "DATA_ENTRY", "SUPERVISOR", "MANAGER", "ACCOUNTS", "AUDIT_MANAGER"],
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN"],
  }
];
