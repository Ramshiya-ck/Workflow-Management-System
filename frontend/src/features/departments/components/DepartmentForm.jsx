import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { departmentSchema } from "../validation/departmentSchemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import FormError from "@/features/auth/components/FormError";
import LoadingButton from "@/features/auth/components/LoadingButton";

const MOCK_MANAGERS = [
  { id: "mgr-1", name: "Santhosh Kumar (IT Manager)" },
  { id: "mgr-2", name: "Anjali Nair (Accounts Head)" },
  { id: "mgr-3", name: "Faisal Rahman (Operations Manager)" },
  { id: "mgr-4", name: "Deepa Menon (HR Director)" },
];

/**
 * Reusable form component mapping fields to Zod constraints for departments database records.
 */
const DepartmentForm = ({ defaultValues, onSubmit, isLoading, buttonText = "Save Department" }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: defaultValues || {
      name: "",
      code: "",
      managerId: "",
      description: "",
      isActive: true,
    },
  });

  const isActiveVal = watch("isActive");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans text-left">
      {/* Department Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Department Name</Label>
        <Input
          id="name"
          placeholder="e.g. Information Technology"
          disabled={isLoading}
          {...register("name")}
          className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        <FormError message={errors.name?.message} />
      </div>

      {/* Department Code */}
      <div className="space-y-1.5">
        <Label htmlFor="code">Department Code</Label>
        <Input
          id="code"
          placeholder="e.g. INFTECH"
          disabled={isLoading}
          {...register("code")}
          className={errors.code ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        <FormError message={errors.code?.message} />
      </div>

      {/* Department Manager Select */}
      <div className="space-y-1.5">
        <Label htmlFor="managerId">Department Manager</Label>
        <select
          id="managerId"
          disabled={isLoading}
          {...register("managerId")}
          className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-950"
        >
          <option value="">Select Manager...</option>
          {MOCK_MANAGERS.map((mgr) => (
            <option key={mgr.id} value={mgr.id}>
              {mgr.name}
            </option>
          ))}
        </select>
        <FormError message={errors.managerId?.message} />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description (Optional)</Label>
        <textarea
          id="description"
          placeholder="Write a brief description..."
          disabled={isLoading}
          {...register("description")}
          rows={3}
          className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 resize-none"
        />
      </div>

      {/* Active Checkbox */}
      <div className="flex items-center space-x-2 pt-1">
        <Checkbox
          id="isActive"
          checked={isActiveVal}
          disabled={isLoading}
          onCheckedChange={(checked) => setValue("isActive", !!checked)}
        />
        <Label
          htmlFor="isActive"
          className="text-xs font-semibold text-zinc-700 cursor-pointer select-none"
        >
          Department is Active
        </Label>
      </div>

      {/* Form Submission Button */}
      <div className="pt-2 flex justify-end">
        <LoadingButton type="submit" isLoading={isLoading} className="w-full cursor-pointer">
          {buttonText}
        </LoadingButton>
      </div>
    </form>
  );
};

export default React.memo(DepartmentForm);
