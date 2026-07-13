import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { Menu, X, ChevronLeft, ChevronRight, User, LogOut, Bell, Search } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { NAVIGATION_ITEMS } from "@/constants/navigation";

/**
 * Main application frame layout rendered for authenticated sessions.
 */
const DashboardLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { mutate: performLogout } = useLogout(() => {
    navigate("/login", { replace: true });
  });

  // Filter navigation items by role
  const menuItems = NAVIGATION_ITEMS.filter((item) => {
    if (!user) return false;
    if (user.is_superuser || user.role === "SUPER_ADMIN") return true;
    return item.roles.includes(item.roles.includes(user.role) ? user.role : "");
  });

  // Handle click outside profile dropdown to close it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans antialiased text-zinc-900">
      {/* Mobile Drawer Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Sidebar: Desktop Collapsible and Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-zinc-200/80 transition-all duration-300
          ${isDrawerOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-16" : "lg:w-64"}
        `}
      >
        {/* Brand Logo and Name */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-100">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden select-none">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-white font-bold text-sm shadow-sm">
              AAK
            </div>
            {!isCollapsed && (
              <span className="font-bold tracking-tight text-zinc-900 text-sm whitespace-nowrap">
                AAK Workflows
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-zinc-655 p-1 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold select-none transition-all group relative
                  ${isActive
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-500 hover:bg-zinc-55 hover:text-zinc-900"
                  }
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`size-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? "text-zinc-900" : "text-zinc-400"}`} />
                {!isCollapsed && <span>{item.name}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-900 text-zinc-50 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer and Collapse Toggle */}
        <div className="p-3 border-t border-zinc-100 space-y-1">
          <button
            onClick={() => performLogout()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 select-none transition-all group relative cursor-pointer"
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="size-4 shrink-0 text-red-500" />
            {!isCollapsed && <span>Sign Out</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-red-650 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Sign Out
              </div>
            )}
          </button>

          <button
            onClick={toggleSidebar}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-lg hover:bg-zinc-50 text-zinc-400 hover:text-zinc-600 cursor-pointer"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>
      </aside>

      {/* Main Panel Content Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300
          ${isCollapsed ? "lg:pl-16" : "lg:pl-64"}
        `}
      >
        {/* Header Dashboard Bar */}
        <header className="h-16 bg-white border-b border-zinc-200/80 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 cursor-pointer"
              aria-label="Open sidebar menu"
            >
              <Menu className="size-5" />
            </button>

            <span className="hidden sm:inline text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
              System Gateway
            </span>
          </div>

          {/* Header Right Tools */}
          <div className="flex items-center gap-3.5">
            {/* Global Search Bar (UI Mock) */}
            <div className="hidden md:flex items-center relative w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Quick search... (⌘K)"
                className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 placeholder:text-zinc-400"
                readOnly
              />
            </div>

            {/* Notification Placeholder Bell */}
            <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-lg relative cursor-pointer">
              <Bell className="size-4.5" />
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 hover:bg-zinc-50 rounded-lg p-1.5 transition-colors cursor-pointer"
                aria-haspopup="true"
                aria-expanded={isProfileDropdownOpen}
              >
                <div className="h-7 w-7 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-100 flex items-center justify-center text-xs font-bold shadow-sm select-none">
                  {getInitials(user?.name)}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-xs font-bold text-zinc-800">{user?.name || "Employee"}</span>
                  <span className="text-[10px] font-semibold text-zinc-450">{user?.role || "Staff"}</span>
                </div>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-155">
                  <div className="px-4 py-2 border-b border-zinc-100 leading-tight">
                    <p className="text-xs font-bold text-zinc-900">{user?.name || "Corporate User"}</p>
                    <p className="text-[10px] font-semibold text-zinc-400 mt-0.5">{user?.email}</p>
                  </div>
                  <div className="px-1 py-1">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 rounded-lg cursor-pointer text-left"
                    >
                      <User className="size-3.5 text-zinc-400" />
                      My Profile
                    </button>
                    <button
                      onClick={() => performLogout()}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer text-left"
                    >
                      <LogOut className="size-3.5 text-red-400" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Render Panel */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
