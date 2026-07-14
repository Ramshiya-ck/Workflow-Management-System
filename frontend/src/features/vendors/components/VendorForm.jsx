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
      code: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      gstNumber: "",
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

        {/* Vendor Code */}
        <div className="space-y-1.5">
          <Label htmlFor="code">Vendor Code</Label>
          <Input
            id="code"
            placeholder="e.g. RELFRESH"
            disabled={isLoading}
            {...register("code")}
            className={errors.code ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          <FormError message={errors.code?.message} />
        </div>

        {/* Contact Person */}
        <div className="space-y-1.5">
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            placeholder="e.g. Suresh Kumar"
            disabled={isLoading}
            {...register("contactPerson")}
            className={errors.contactPerson ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          <FormError message={errors.contactPerson?.message} />
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

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="e.g. info@vendor.com"
            disabled={isLoading}
            {...register("email")}
            className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          <FormError message={errors.email?.message} />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            placeholder="e.g. +91 9876543210"
            disabled={isLoading}
            {...register("phone")}
            className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          <FormError message={errors.phone?.message} />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <Label htmlFor="address">Address (Optional)</Label>
        <textarea
          id="address"
          placeholder="Corporate head office address details..."
          disabled={isLoading}
          {...register("address")}
          rows={2}
          className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 resize-none font-sans"
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
