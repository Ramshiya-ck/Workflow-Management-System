import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import UserForm from "../components/UserForm";
import { useCreateUser } from "../hooks/useUsers";

const CreateUserPage = () => {
  const navigate = useNavigate();
  const createUserMutation = useCreateUser();
  const [apiError, setApiError] = useState(null);

  const handleSubmit = (data) => {
    setApiError(null);
    createUserMutation.mutate(
      {
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber,
        role: data.role,
        department_id: data.departmentId || null,
        is_active: data.isActive,
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
            setApiError(err.message || "Failed to create user.");
          }
        },
      }
    );
  };

  const breadcrumbs = [
    { name: "AAK Console", path: "/" },
    { name: "Users", path: "/users" },
    { name: "Add User" },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans select-none">
      <PageHeader
        title="Register New User"
        subtitle="Create an employee profile, select role permissions, and assign store divisions."
        breadcrumbs={breadcrumbs}
      />

      <UserForm
        onSubmit={handleSubmit}
        isLoading={createUserMutation.isPending}
        isEdit={false}
        apiError={apiError}
      />
    </div>
  );
};

export default CreateUserPage;
