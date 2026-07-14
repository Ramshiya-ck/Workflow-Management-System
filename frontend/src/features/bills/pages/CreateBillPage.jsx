import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/PageHeader";
import BillForm from "../components/BillForm";
import { useCreateBill } from "../hooks/useCreateBill";
import { getVendorOptions, getDepartmentOptions } from "../api/bills.api";

/**
 * Page container to register a new vendor invoice.
 */
const CreateBillPage = () => {
  const navigate = useNavigate();
  const createMutation = useCreateBill();

  // Retrieve dropdown lists dynamically from database ViewSets
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

  const handleSubmit = (data) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        navigate("/bills");
      },
    });
  };

  const breadcrumbs = [
    { name: "AAK Console", path: "/" },
    { name: "Bills", path: "/bills" },
    { name: "Register Invoice" },
  ];

  return (
    <div className="space-y-6 max-w-2xl select-none font-sans">
      <PageHeader
        title="Register Invoice"
        subtitle="Initiate a workflow approval pipeline by uploading billing details."
        breadcrumbs={breadcrumbs}
      />

      <div className="bg-white border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-xl p-6">
        <BillForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || isVendorsLoading || isDeptsLoading}
          vendors={vendors}
          departments={departments}
          buttonText="Register & Start Workflow"
        />
      </div>
    </div>
  );
};

export default CreateBillPage;
