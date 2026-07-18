import React, { useState, useCallback } from "react";
import { Plus, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import Skeleton from "@/components/common/Skeleton";
import UserFilters from "../components/UserFilters";
import UserTable from "../components/UserTable";
import UserCard from "../components/UserCard";
import DeleteDialog from "../components/DeleteDialog";
import ResetPasswordDialog from "../components/ResetPasswordDialog";
import {
  useUsers,
  useActivateUser,
  useDeactivateUser,
  useResetPassword
} from "../hooks/useUsers";

const UserListPage = () => {
  const navigate = useNavigate();

  // Filter and pagination state
  const [page, setPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({
    search: "",
    role: "",
    department: "",
    is_active: "",
  });

  // Modal Dialogs state
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  // Queries and mutations
  const queryParams = {
    page,
    search: activeFilters.search || undefined,
    role: activeFilters.role || undefined,
    department: activeFilters.department || undefined,
    is_active: activeFilters.is_active || undefined,
  };

  const { data: usersResponse, isLoading, error } = useUsers(queryParams);
  const users = usersResponse?.data?.results || [];
  const count = usersResponse?.data?.count || 0;
  const totalPages = Math.ceil(count / 10) || 1;

  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();
  const resetPasswordMutation = useResetPassword();

  // Search and Filter callbacks
  const handleSearch = useCallback((searchTerm) => {
    setActiveFilters((prev) => ({ ...prev, search: searchTerm }));
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    if (key === "clear_all") {
      setActiveFilters({ search: "", role: "", department: "", is_active: "" });
    } else {
      setActiveFilters((prev) => ({ ...prev, [key]: value }));
    }
    setPage(1);
  }, []);

  // Action Click Handlers
  const handleView = useCallback((id) => {
    navigate(`/users/${id}`);
  }, [navigate]);

  const handleEdit = useCallback((id) => {
    navigate(`/users/${id}/edit`);
  }, [navigate]);

  const handleResetPasswordClick = useCallback((user) => {
    setSelectedUser(user);
    setIsResetOpen(true);
  }, []);

  const handleResetConfirm = useCallback((newPassword) => {
    if (!selectedUser) return;
    resetPasswordMutation.mutate(
      { id: selectedUser.id, password: newPassword },
      {
        onSuccess: () => {
          setIsResetOpen(false);
          setSelectedUser(null);
        },
      }
    );
  }, [selectedUser, resetPasswordMutation]);

  const handleToggleStatus = useCallback((user) => {
    if (user.is_active) {
      setSelectedUser(user);
      setIsDeactivateOpen(true);
    } else {
      activateMutation.mutate(user.id);
    }
  }, [activateMutation]);

  const handleDeactivateConfirm = useCallback(() => {
    if (!selectedUser) return;
    deactivateMutation.mutate(selectedUser.id, {
      onSuccess: () => {
        setIsDeactivateOpen(false);
        setSelectedUser(null);
      },
    });
  }, [selectedUser, deactivateMutation]);

  const breadcrumbs = [
    { name: "AAK Console", path: "/" },
    { name: "Users" },
  ];

  return (
    <div className="space-y-6 font-sans select-none">
      {/* Header */}
      <PageHeader
        title="User Profiles"
        subtitle="Manage custom system users, role authorizations, and department division assignments."
        breadcrumbs={breadcrumbs}
        primaryAction={
          <Link to="/users/new">
            <Button className="text-xs h-9 cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1.5 shadow-sm">
              <Plus className="size-4" />
              Add User
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <UserFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        activeFilters={activeFilters}
      />

      {/* Lists & Skeletons */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="w-full h-12 bg-zinc-100 rounded-xl" />
          <Skeleton className="w-full h-64 bg-zinc-50 rounded-xl" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center text-red-600">
          Failed to load users data: {error.message || "An unexpected error occurred."}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-zinc-50 border border-zinc-100 text-zinc-400 flex items-center justify-center">
            <Users className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-900">No Users Found</h3>
            <p className="text-xs text-zinc-500 max-w-xs">
              No employee accounts match the selected search string or access filters.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <UserTable
              users={users}
              onView={handleView}
              onEdit={handleEdit}
              onResetPassword={handleResetPasswordClick}
              onToggleStatus={handleToggleStatus}
            />
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onView={handleView}
                onEdit={handleEdit}
                onResetPassword={handleResetPasswordClick}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-150 pt-4">
              <span className="text-xs text-zinc-500 font-medium">
                Page {page} of {totalPages} ({count} users total)
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  variant="outline"
                  className="text-xs h-8 border border-zinc-200 cursor-pointer"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  variant="outline"
                  className="text-xs h-8 border border-zinc-200 cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deactivate Dialog */}
      <DeleteDialog
        isOpen={isDeactivateOpen}
        onClose={() => setIsDeactivateOpen(false)}
        onConfirm={handleDeactivateConfirm}
        isLoading={deactivateMutation.isPending}
        userName={`${selectedUser?.first_name} ${selectedUser?.last_name || ""}`}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={handleResetConfirm}
        isLoading={resetPasswordMutation.isPending}
        userName={`${selectedUser?.first_name} ${selectedUser?.last_name || ""}`}
        error={resetPasswordMutation.error?.response?.data?.password?.[0]}
      />
    </div>
  );
};

export default UserListPage;
