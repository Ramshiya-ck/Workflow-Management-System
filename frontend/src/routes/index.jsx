import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "@/features/auth/AuthContext";

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
const WorkflowLogsPage = lazy(() => import("@/features/workflow/pages/WorkflowLogsPage"));
const NotificationsPage = lazy(() => import("@/features/notifications/pages/NotificationsPage"));

// Lazy loaded Reports Page
const ReportsPage = lazy(() => import("@/features/reports/pages/ReportsPage"));

// Lazy loaded Users Pages
const UserListPage = lazy(() => import("@/features/users/pages/UserListPage"));
const CreateUserPage = lazy(() => import("@/features/users/pages/CreateUserPage"));
const EditUserPage = lazy(() => import("@/features/users/pages/EditUserPage"));
const UserDetailsPage = lazy(() => import("@/features/users/pages/UserDetailsPage"));

const ReportAccessRoute = ({ children }) => {
  const { user } = useAuth();
  if (user && user.role !== "SUPER_ADMIN" && user.role !== "AUDIT_MANAGER" && !user.is_superuser) {
    return <Navigate to="/access-denied" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user && user.role !== "SUPER_ADMIN" && !user.is_superuser) {
    return <Navigate to="/access-denied" replace />;
  }
  return children;
};

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
            path="users"
            element={
              <AdminRoute>
                <UserListPage />
              </AdminRoute>
            }
          />
          <Route
            path="users/new"
            element={
              <AdminRoute>
                <CreateUserPage />
              </AdminRoute>
            }
          />
          <Route
            path="users/:id"
            element={
              <AdminRoute>
                <UserDetailsPage />
              </AdminRoute>
            }
          />
          <Route
            path="users/:id/edit"
            element={
              <AdminRoute>
                <EditUserPage />
              </AdminRoute>
            }
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
            path="logs"
            element={<WorkflowLogsPage />}
          />
          <Route
            path="reports"
            element={
              <ReportAccessRoute>
                <ReportsPage />
              </ReportAccessRoute>
            }
          />
          <Route
            path="notifications"
            element={<NotificationsPage />}
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
