import {
  LayoutDashboard,
  Building2,
  Users,
  Receipt,
  GitPullRequest,
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
    roles: ["SUPER_ADMIN", "DATA_ENTRY", "SUPERVISOR", "DEPARTMENT_MANAGER", "ACCOUNTS"],
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
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Bills",
    path: "/bills",
    icon: Receipt,
    roles: ["SUPER_ADMIN", "DATA_ENTRY", "SUPERVISOR", "DEPARTMENT_MANAGER", "ACCOUNTS"],
  },
  {
    name: "Workflow",
    path: "/workflow",
    icon: GitPullRequest,
    roles: ["SUPER_ADMIN", "DATA_ENTRY", "SUPERVISOR", "DEPARTMENT_MANAGER", "ACCOUNTS"],
  },
  {
    name: "Reports",
    path: "/reports",
    icon: BarChart3,
    roles: ["SUPER_ADMIN", "DEPARTMENT_MANAGER", "ACCOUNTS"],
  },
  {
    name: "Notifications",
    path: "/notifications",
    icon: Bell,
    roles: ["SUPER_ADMIN", "DATA_ENTRY", "SUPERVISOR", "DEPARTMENT_MANAGER", "ACCOUNTS"],
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN"],
  }
];
