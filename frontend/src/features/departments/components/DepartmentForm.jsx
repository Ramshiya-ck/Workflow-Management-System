import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { departmentSchema } from "../validation/departmentSchemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import FormError from "@/features/auth/components/FormError";
import LoadingButton from "@/features/auth/components/LoadingButton";

/**
 * Reusable form component mapping fields to Zod constraints for departments database records.
 */
const DepartmentForm = ({ defaultValues, onSubmit, isLoading, buttonText = "Save Department", isEdit }) => {
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
          disabled={isLoading || isEdit}
          {...register("code")}
          className={errors.code ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        <FormError message={errors.code?.message} />
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
