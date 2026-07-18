import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import Skeleton from "@/components/common/Skeleton";
import UserForm from "../components/UserForm";
import { useUser, useUpdateUser } from "../hooks/useUsers";

const EditUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);

  const { data: userResponse, isLoading, error } = useUser(id);
  const user = userResponse?.data;
  const updateUserMutation = useUpdateUser();

  const defaultValues = useMemo(() => {
    if (!user) return null;
    return {
      firstName: user.first_name,
      lastName: user.last_name || "",
      email: user.email,
      phoneNumber: user.phone_number || "",
      role: user.role,
      departmentId: user.department?.id || "",
      isActive: user.is_active,
    };
  }, [user]);

  const handleSubmit = (data) => {
    setApiError(null);
    updateUserMutation.mutate(
      {
        id,
        data: {
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phoneNumber,
          role: data.role,
          department_id: data.departmentId || null,
          is_active: data.isActive,
        },
      },
      {
        onSuccess: () => {
          navigate("/users");
        },
        onError: (err) => {
          const resData = err.response?.data;
          if (resData && typeof resData === "object") {
            const firstKey = Object.keys(resData)[0];
            const val = resData[firstKey];
            const errorMsg = Array.isArray(val) ? val[0] : String(val);
            setApiError(`${firstKey}: ${errorMsg}`);
          } else {
            setApiError(err.message || "Failed to update user profile.");
          }
        },
      }
    );
  };

  const breadcrumbs = [
    { name: "AAK Console", path: "/" },
    { name: "Users", path: "/users" },
    { name: "Edit Profile" },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans select-none">
      <PageHeader
        title="Edit User Profile"
        subtitle="Modify profile fields, update access privileges, or reassign store departments."
        breadcrumbs={breadcrumbs}
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="w-full h-12 bg-zinc-100 rounded-xl" />
          <Skeleton className="w-full h-64 bg-zinc-50 rounded-xl" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center text-red-650">
          Failed to load user profile: {error.message || "An unexpected error occurred."}
        </div>
      ) : (
        <UserForm
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
          isLoading={updateUserMutation.isPending}
          isEdit={true}
          apiError={apiError}
        />
      )}
    </div>
  );
};

export default EditUserPage;
