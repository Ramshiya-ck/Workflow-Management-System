import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";

// Lazy loaded Auth Pages
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/features/auth/pages/ResetPasswordPage"));
const AccessDenied = lazy(() => import("@/pages/AccessDenied"));

// Lazy loaded Dashboard Layout and pages
const DashboardLayout = lazy(() => import("@/layouts/DashboardLayout"));
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const SettingsPage = lazy(() => import("@/features/dashboard/pages/SettingsPage"));
const DepartmentsPage = lazy(() => import("@/features/departments/pages/DepartmentsPage"));
const VendorsPage = lazy(() => import("@/features/vendors/pages/VendorsPage"));
const VendorDetailsPage = lazy(() => import("@/features/vendors/pages/VendorDetailsPage"));

const LoadingFallback = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />

        {/* Protected Layout and Screens */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route
            path="departments"
            element={<DepartmentsPage />}
          />
          <Route
            path="vendors"
            element={<VendorsPage />}
          />
          <Route
            path="vendors/:id"
            element={<VendorDetailsPage />}
          />
          <Route
            path="bills"
            element={
              <div className="p-6 bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
                <h2 className="text-lg font-bold text-zinc-900 font-sans">Bills Registry</h2>
                <p className="text-xs text-zinc-500 font-sans mt-1">Invoice collections and approval state registries.</p>
              </div>
            }
          />
          <Route
            path="workflow"
            element={
              <div className="p-6 bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
                <h2 className="text-lg font-bold text-zinc-900 font-sans">Workflow Approval Board</h2>
                <p className="text-xs text-zinc-500 font-sans mt-1">Board displaying transitions across levels.</p>
              </div>
            }
          />
          <Route
            path="reports"
            element={
              <div className="p-6 bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
                <h2 className="text-lg font-bold text-zinc-900 font-sans">System Reports</h2>
                <p className="text-xs text-zinc-500 font-sans mt-1">Generate clearance metrics sheets.</p>
              </div>
            }
          />
          <Route
            path="notifications"
            element={
              <div className="p-6 bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
                <h2 className="text-lg font-bold text-zinc-900 font-sans">Notifications Center</h2>
                <p className="text-xs text-zinc-500 font-sans mt-1">System warning messages logs database.</p>
              </div>
            }
          />
          <Route
            path="settings"
            element={<SettingsPage />}
          />
        </Route>

        <Route
          path="/access-denied"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AccessDenied />
            </Suspense>
          }
        />

        {/* Catch All Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};
