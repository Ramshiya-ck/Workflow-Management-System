import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vendorSchema } from "../validation/vendorSchemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import FormError from "@/features/auth/components/FormError";
import LoadingButton from "@/features/auth/components/LoadingButton";

/**
 * Reusable form component mapping inputs to validation schemas.
 */
const VendorForm = ({ defaultValues, onSubmit, isLoading, buttonText = "Save Vendor" }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vendorSchema),
    defaultValues: defaultValues || {
      name: "",
      address: "",
      mobileNumber: "",
      gstNumber: "",
      creditDays: 30,
      isActive: true,
    },
  });

  const isActiveVal = watch("isActive");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans text-left text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Vendor Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Vendor Name</Label>
          <Input
            id="name"
            placeholder="e.g. Reliance Fresh"
            disabled={isLoading}
            {...register("name")}
            className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          <FormError message={errors.name?.message} />
        </div>

        {/* GST Number */}
        <div className="space-y-1.5">
          <Label htmlFor="gstNumber">GST Number</Label>
          <Input
            id="gstNumber"
            placeholder="e.g. 29GGGGG1314R1Z0"
            disabled={isLoading}
            {...register("gstNumber")}
            className={errors.gstNumber ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          <FormError message={errors.gstNumber?.message} />
        </div>

        {/* Mobile Number */}
        <div className="space-y-1.5">
          <Label htmlFor="mobileNumber">Mobile Number</Label>
          <Input
            id="mobileNumber"
            placeholder="e.g. +919876543210"
            disabled={isLoading}
            {...register("mobileNumber")}
            className={errors.mobileNumber ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          <FormError message={errors.mobileNumber?.message} />
        </div>

        {/* Credit Days */}
        <div className="space-y-1.5">
          <Label htmlFor="creditDays">Credit Days</Label>
          <Input
            id="creditDays"
            type="number"
            placeholder="e.g. 30"
            disabled={isLoading}
            {...register("creditDays")}
            className={errors.creditDays ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          <FormError message={errors.creditDays?.message} />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <Label htmlFor="address">Address</Label>
        <textarea
          id="address"
          placeholder="Corporate head office address details..."
          disabled={isLoading}
          {...register("address")}
          rows={2}
          className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 resize-none font-sans"
        />
        <FormError message={errors.address?.message} />
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
          Vendor is Active
        </Label>
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex justify-end">
        <LoadingButton type="submit" isLoading={isLoading} className="w-full cursor-pointer">
          {buttonText}
        </LoadingButton>
      </div>
    </form>
  );
};

export default React.memo(VendorForm);
