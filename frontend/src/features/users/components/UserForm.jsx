import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CornerUpLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRoles } from "../hooks/useUsers";
import { useDepartments } from "@/features/departments/hooks/useDepartments";
import { userCreateSchema, userUpdateSchema } from "../validation/userSchemas";

const UserForm = ({ onSubmit, defaultValues = null, isLoading = false, isEdit = false, apiError = null }) => {
  const { data: rolesResponse } = useRoles();
  const roles = rolesResponse?.data || [];

  const { data: deptsResponse } = useDepartments({ is_active: true, page_size: 100 });
  const departments = deptsResponse?.data?.results || [];

  const schema = isEdit ? userUpdateSchema : userCreateSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      role: "",
      departmentId: "",
      password: "",
      confirmPassword: "",
      isActive: true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-zinc-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 space-y-6 font-sans">
      
      {apiError && (
        <div className="p-3.5 bg-red-50 border border-red-100 rounded-lg text-xs font-semibold text-red-650 flex items-start gap-2.5">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <div className="leading-normal">{apiError}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* First Name */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("firstName")}
            placeholder="John"
            className="w-full h-9 rounded-lg border border-zinc-200 px-3 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all placeholder-zinc-300"
          />
          {errors.firstName && (
            <span className="text-[10px] font-semibold text-red-500 flex items-center gap-1">
              <AlertTriangle className="size-3" />
              {errors.firstName.message}
            </span>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Last Name
          </label>
          <input
            type="text"
            {...register("lastName")}
            placeholder="Doe"
            className="w-full h-9 rounded-lg border border-zinc-200 px-3 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all placeholder-zinc-300"
          />
          {errors.lastName && (
            <span className="text-[10px] font-semibold text-red-500 flex items-center gap-1">
              <AlertTriangle className="size-3" />
              {errors.lastName.message}
            </span>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            {...register("email")}
            placeholder="johndoe@aak.com"
            className="w-full h-9 rounded-lg border border-zinc-200 px-3 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all placeholder-zinc-300 disabled:bg-zinc-50 disabled:text-zinc-500 disabled:cursor-not-allowed"
          />
          {errors.email && (
            <span className="text-[10px] font-semibold text-red-500 flex items-center gap-1">
              <AlertTriangle className="size-3" />
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Phone Number
          </label>
          <input
            type="text"
            {...register("phoneNumber")}
            placeholder="+919876543210"
            className="w-full h-9 rounded-lg border border-zinc-200 px-3 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all placeholder-zinc-300"
          />
          {errors.phoneNumber && (
            <span className="text-[10px] font-semibold text-red-500 flex items-center gap-1">
              <AlertTriangle className="size-3" />
              {errors.phoneNumber.message}
            </span>
          )}
        </div>

        {/* Role Choice */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Assigned Access Role <span className="text-red-500">*</span>
          </label>
          <select
            {...register("role")}
            className="w-full h-9 rounded-lg border border-zinc-200 px-3 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer"
          >
            <option value="">Select a Role</option>
            {roles.map((role) => {
              const val = typeof role === "object" ? role?.value : role;
              const lbl = typeof role === "object" ? role?.label : String(role).replace("_", " ");
              return (
                <option key={val} value={val}>
                  {lbl}
                </option>
              );
            })}
          </select>
          {errors.role && (
            <span className="text-[10px] font-semibold text-red-500 flex items-center gap-1">
              <AlertTriangle className="size-3" />
              {errors.role.message}
            </span>
          )}
        </div>


        {/* Password fields only during creation */}
        {!isEdit && (
          <>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Temporary Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className="w-full h-9 rounded-lg border border-zinc-200 px-3 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all placeholder-zinc-300"
              />
              {errors.password && (
                <span className="text-[10px] font-semibold text-red-500 flex items-center gap-1">
                  <AlertTriangle className="size-3" />
                  {errors.password.message}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...register("confirmPassword")}
                placeholder="••••••••"
                className="w-full h-9 rounded-lg border border-zinc-200 px-3 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all placeholder-zinc-300"
              />
              {errors.confirmPassword && (
                <span className="text-[10px] font-semibold text-red-500 flex items-center gap-1">
                  <AlertTriangle className="size-3" />
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
          </>
        )}

        {/* User Active Status Selection */}
        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="isActive"
            {...register("isActive")}
            className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 transition-all cursor-pointer"
          />
          <label htmlFor="isActive" className="text-xs text-zinc-700 font-medium cursor-pointer">
            Mark Profile Status as Active
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
        <Link to="/users">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            className="text-xs h-9 cursor-pointer border border-zinc-200 flex items-center gap-1.5"
          >
            <CornerUpLeft className="size-3.5" />
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={isLoading}
          className="text-xs h-9 cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1.5"
        >
          <Save className="size-3.5" />
          {isLoading ? "Saving..." : "Save User"}
        </Button>
      </div>
    </form>
  );
};

export default React.memo(UserForm);
