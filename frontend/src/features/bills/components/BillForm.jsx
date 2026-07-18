import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { billSchema } from "../validation/billSchemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormError from "@/features/auth/components/FormError";
import LoadingButton from "@/features/auth/components/LoadingButton";

/**
 * Reusable form component mapping inputs to validation schemas.
 */
const BillForm = ({
  defaultValues,
  onSubmit,
  isLoading,
  vendors = [],
  departments = [],
  buttonText = "Save Bill",
  apiErrors = {},
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(billSchema),
    defaultValues: defaultValues || {
      vendor: "",
      department: "",
      billNumber: "",
      billDate: "",
      amount: "",
      description: "",
    },
  });

  const selectedVendor = watch("vendor");
  const selectedDept = watch("department");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans text-left text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Vendor Selector */}
        <div className="space-y-1.5">
          <Label htmlFor="vendor">Associated Vendor</Label>
          <select
            id="vendor"
            disabled={isLoading}
            value={selectedVendor}
            onChange={(e) => setValue("vendor", e.target.value)}
            className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-sans cursor-pointer h-9"
          >
            <option value="">Select a vendor...</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.gstNumber || v.code})
              </option>
            ))}
          </select>
          <FormError message={errors.vendor?.message} />
        </div>

        {/* Department Selector */}
        <div className="space-y-1.5">
          <Label htmlFor="department">Internal Department</Label>
          <select
            id="department"
            disabled={isLoading}
            value={selectedDept}
            onChange={(e) => setValue("department", e.target.value)}
            className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-sans cursor-pointer h-9"
          >
            <option value="">Select a department...</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
          <FormError message={errors.department?.message} />
        </div>

        {/* Bill Number */}
        <div className="space-y-1.5">
          <Label htmlFor="billNumber">Bill Number</Label>
          <Input
            id="billNumber"
            placeholder="e.g. INV-2026-99"
            disabled={isLoading}
            {...register("billNumber")}
            className={errors.billNumber || apiErrors?.bill_number ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          <FormError message={errors.billNumber?.message || apiErrors?.bill_number?.[0]} />
        </div>

        {/* Bill Date */}
        <div className="space-y-1.5">
          <Label htmlFor="billDate">Bill Date</Label>
          <Input
            id="billDate"
            type="date"
            disabled={isLoading}
            {...register("billDate")}
            className={errors.billDate ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          <FormError message={errors.billDate?.message} />
        </div>

        {/* Amount */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="amount">Invoice Amount (INR)</Label>
          <Input
            id="amount"
            type="text"
            placeholder="e.g. 25000.00"
            disabled={isLoading}
            {...register("amount")}
            className={errors.amount ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          <FormError message={errors.amount?.message} />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Notes / Description (Optional)</Label>
        <textarea
          id="description"
          placeholder="Details about items, packaging specs, or delivery verification comments..."
          disabled={isLoading}
          {...register("description")}
          rows={3}
          className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 resize-none font-sans"
        />
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

export default React.memo(BillForm);
