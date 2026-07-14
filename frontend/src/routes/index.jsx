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
const BillsPage = lazy(() => import("@/features/bills/pages/BillsPage"));
const BillDetailsPage = lazy(() => import("@/features/bills/pages/BillDetailsPage"));
const CreateBillPage = lazy(() => import("@/features/bills/pages/CreateBillPage"));
const EditBillPage = lazy(() => import("@/features/bills/pages/EditBillPage"));

// Lazy loaded Workflow Pages
const WorkflowQueuePage = lazy(() => import("@/features/workflow/pages/WorkflowQueuePage"));
const WorkflowDetailsPage = lazy(() => import("@/features/workflow/pages/WorkflowDetailsPage"));

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
            element={<BillsPage />}
          />
          <Route
            path="bills/:id"
            element={<BillDetailsPage />}
          />
          <Route
            path="bills/create"
            element={<CreateBillPage />}
          />
          <Route
            path="bills/:id/edit"
            element={<EditBillPage />}
          />
          <Route
            path="workflow"
            element={<WorkflowQueuePage />}
          />
          <Route
            path="workflow/:id"
            element={<WorkflowDetailsPage />}
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
