import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/PageHeader";
import BillForm from "../components/BillForm";
import Skeleton from "@/components/common/Skeleton";
import { useBill } from "../hooks/useBill";
import { useUpdateBill } from "../hooks/useUpdateBill";
import { getVendorOptions, getDepartmentOptions } from "../api/bills.api";

/**
 * Page container to modify active invoice specifications.
 */
const EditBillPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Query details and dropdown options
  const { data: billResponse, isLoading: isBillLoading } = useBill(id);
  const updateMutation = useUpdateBill();
  const [apiErrors, setApiErrors] = useState({});

  const { data: vendors = [], isLoading: isVendorsLoading } = useQuery({
    queryKey: ["vendor-options"],
    queryFn: getVendorOptions,
    staleTime: 5 * 60 * 1000,
  });

  const { data: departments = [], isLoading: isDeptsLoading } = useQuery({
    queryKey: ["department-options"],
    queryFn: getDepartmentOptions,
    staleTime: 5 * 60 * 1000,
  });

  const bill = billResponse?.data;

  // Resolve form defaults
  const defaultValues = useMemo(() => {
    if (!bill) return null;
    return {
      vendor: bill.vendor?.id ? String(bill.vendor.id) : "",
      department: bill.department?.id ? String(bill.department.id) : "",
      billNumber: bill.bill_number || "",
      billDate: bill.bill_date || "",
      amount: String(bill.amount || ""),
      description: bill.rejection_reason || "",
    };
  }, [bill]);

  const handleSubmit = (data) => {
    setApiErrors({});
    updateMutation.mutate(
      {
        id,
        data,
      },
      {
        onSuccess: () => {
          navigate("/bills");
        },
        onError: (err) => {
          const errors = err?.response?.data?.errors || {};
          setApiErrors(errors);
        },
      }
    );
  };

  const breadcrumbs = [
    { name: "AAK Console", path: "/" },
    { name: "Bills", path: "/bills" },
    { name: `Edit ${bill?.bill_number || "Invoice"}` },
  ];

  const isPageLoading = isBillLoading || isVendorsLoading || isDeptsLoading;

  return (
    <div className="space-y-6 max-w-2xl select-none font-sans">
      <PageHeader
        title={`Edit Bill: ${bill?.bill_number || ""}`}
        subtitle="Modify active invoice parameters before clearance checks run."
        breadcrumbs={breadcrumbs}
      />

      <div className="bg-white border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-xl p-6">
        {isPageLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32 ml-auto" />
          </div>
        ) : (
          <BillForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isLoading={updateMutation.isPending}
            vendors={vendors}
            departments={departments}
            buttonText="Save Invoice Changes"
            apiErrors={apiErrors}
          />
        )}
      </div>
    </div>
  );
};

export default EditBillPage;
