import React from "react";
import { useParams, Link } from "react-router-dom";
import { CornerUpLeft, Edit2, User, Mail, Phone, Calendar, UserCheck } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import Skeleton from "@/components/common/Skeleton";
import UserStatusBadge from "../components/UserStatusBadge";
import { useUser } from "../hooks/useUsers";

const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  RECEIVING: "Receiving",
  DATA_ENTRY: "Data Entry",
  SUPERVISOR: "Supervisor",
  MANAGER: "Manager",
  ACCOUNTS: "Accounts",
  AUDIT_MANAGER: "Audit Manager",
};

const UserDetailsPage = () => {
  const { id } = useParams();
  const { data: userResponse, isLoading, error } = useUser(id);
  const user = userResponse?.data;

  const breadcrumbs = [
    { name: "AAK Console", path: "/" },
    { name: "Users", path: "/users" },
    { name: "User Details" },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans select-none">
      <PageHeader
        title="User Profile Details"
        subtitle="Detailed configuration information, access logs, and registration details."
        breadcrumbs={breadcrumbs}
      >
        <div className="flex gap-2">
          <Link to="/users">
            <Button
              variant="outline"
              className="text-xs h-9 border border-zinc-200 cursor-pointer flex items-center gap-1.5"
            >
              <CornerUpLeft className="size-3.5" />
              Back to List
            </Button>
          </Link>
          {user && (
            <Link to={`/users/${user.id}/edit`}>
              <Button className="text-xs h-9 cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1.5 shadow-sm">
                <Edit2 className="size-3.5" />
                Edit Profile
              </Button>
            </Link>
          )}
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="w-full h-12 bg-zinc-100 rounded-xl" />
          <Skeleton className="w-full h-64 bg-zinc-50 rounded-xl" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center text-red-650">
          Failed to load user details: {error.message || "An unexpected error occurred."}
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
          {/* Cover / Profile Banner */}
          <div className="px-6 py-8 border-b border-zinc-150 bg-gradient-to-r from-zinc-50 to-white flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-lg border-2 border-white shadow-md shadow-zinc-100">
              {user.first_name[0]?.toUpperCase() || <User className="size-6" />}
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-zinc-950">
                  {user.first_name} {user.last_name || ""}
                </h3>
                <UserStatusBadge isActive={user.is_active} />
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                {ROLE_LABELS[user.role] || user.role} • {user.department ? `${user.department.name} (${user.department.code})` : "No Assigned Department"}
              </p>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Contact details
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-zinc-700">
                  <Mail className="size-4 text-zinc-400" />
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Email Address</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-700">
                  <Phone className="size-4 text-zinc-400" />
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Phone Number</span>
                    <span className="font-medium">{user.phone_number || "No Phone Number Registered"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Audit Registry Logs
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-zinc-700">
                  <Calendar className="size-4 text-zinc-400" />
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Registered On</span>
                    <span className="font-medium">
                      {new Date(user.created_at).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-700">
                  <UserCheck className="size-4 text-zinc-400" />
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Created By</span>
                    <span className="font-medium">
                      {user.created_by ? `${user.created_by.first_name} ${user.created_by.last_name || ""} (${user.created_by.email})` : "System / Seeds"}
                    </span>
                  </div>
                </div>
                {user.updated_by && (
                  <div className="flex items-center gap-3 text-xs text-zinc-700">
                    <UserCheck className="size-4 text-zinc-400" />
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Last Updated By</span>
                      <span className="font-medium">
                        {user.updated_by.first_name} {user.updated_by.last_name || ""} ({user.updated_by.email})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetailsPage;
