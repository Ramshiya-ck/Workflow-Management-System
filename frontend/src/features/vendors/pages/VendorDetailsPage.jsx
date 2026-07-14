import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Building2, User, Phone, MapPin, Receipt, Mail, Sparkles, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import VendorInfoCard from "../components/VendorInfoCard";
import Skeleton from "@/components/common/Skeleton";

import { useVendor } from "../hooks/useVendor";
import { useDashboardBills } from "@/features/dashboard/hooks/useDashboardBills";

/**
 * Detailed presentation view for individual vendor records. Displays profile specs and associated invoice queues.
 */
const VendorDetailsPage = () => {
  const { id } = useParams();

  // React Query Hooks
  const { data: vendorResponse, isLoading: isVendorLoading, error: vendorError } = useVendor(id);
  const { data: bills, isLoading: isBillsLoading, error: billsError } = useDashboardBills({ vendor: id });

  const vendor = vendorResponse?.data;

  // Map Backend Results to camelCase Frontend Presentation properties
  const mappedVendor = useMemo(() => {
    if (!vendor) return null;
    return {
      id: vendor.id,
      name: vendor.name,
      code: vendor.gst_number ? vendor.gst_number.substring(2, 7) : `VND-${vendor.id}`,
      contactPerson: "Account Manager", // fallback
      email: "info@vendor.com", // fallback
      phone: vendor.mobile_number || "N/A",
      address: vendor.address || "N/A",
      gstNumber: vendor.gst_number || "",
      isActive: vendor.is_active !== undefined ? vendor.is_active : true,
      createdDate: vendor.created_at 
        ? new Date(vendor.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "N/A",
    };
  }, [vendor]);

  // Map recent bills array
  const mappedBills = useMemo(() => {
    if (!bills) return [];
    return bills.slice(0, 5).map((bill) => ({
      id: bill.id,
      billNumber: bill.bill_number,
      amount: `₹${Number(bill.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      date: bill.bill_date 
        ? new Date(bill.bill_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "N/A",
      status: bill.current_status,
      statusLabel: bill.current_status_display || bill.current_status,
    }));
  }, [bills]);

  const breadcrumbs = useMemo(() => {
    return [
      { name: "AAK Console", path: "/" },
      { name: "Vendors", path: "/vendors" },
      { name: mappedVendor?.name || "Vendor Profile" },
    ];
  }, [mappedVendor]);

  // Loading skeleton layout state
  if (isVendorLoading || isBillsLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Vendor Profile" subtitle="Syncing profile parameters..." breadcrumbs={[{ name: "Vendors", path: "/vendors" }, { name: "Profile" }]} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-zinc-200/80 p-5 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="bg-white rounded-xl border border-zinc-200/80 p-5 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-zinc-200/80 p-5 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error boundary panels
  if (vendorError || billsError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Vendor Profile" subtitle="Sync Failed" breadcrumbs={[{ name: "Vendors", path: "/vendors" }, { name: "Sync Error" }]} />
        <div className="flex flex-col items-center justify-center p-8 bg-white border border-zinc-200 rounded-xl text-center max-w-sm mx-auto my-6 font-sans">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 border border-red-100 text-red-500 mb-4">
            <AlertTriangle className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900">Sync Connection Failed</h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            {vendorError?.friendlyMessage || billsError?.friendlyMessage || "Unable to sync profile details with the corporate servers. Please try again."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none font-sans max-w-5xl">
      {/* Page Header */}
      <PageHeader
        title={mappedVendor.name}
        subtitle={`System tracking records for code index: ${mappedVendor.code}`}
        breadcrumbs={breadcrumbs}
        primaryAction={
          <Link to="/vendors">
            <Button variant="outline" className="cursor-pointer gap-2 border border-zinc-200">
              <ArrowLeft className="size-4" />
              <span>Back to Vendors</span>
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Vendor General & Contact Cards */}
        <div className="md:col-span-1 space-y-6">
          {/* Card 1: Vendor details */}
          <VendorInfoCard title="Vendor Profile" icon={Building2}>
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-zinc-450 font-semibold">Vendor Code:</span>
                <span className="font-mono font-bold text-zinc-900">{mappedVendor.code}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-455 font-semibold">Active Status:</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase border
                    ${mappedVendor.isActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-zinc-50 text-zinc-450 border-zinc-150"
                    }
                  `}
                >
                  {mappedVendor.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-450 font-semibold">GST Number:</span>
                <span className="font-mono font-bold text-zinc-800">{mappedVendor.gstNumber || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-450 font-semibold">Registration Date:</span>
                <span className="text-zinc-700 font-semibold">{mappedVendor.createdDate}</span>
              </div>
            </div>
          </VendorInfoCard>

          {/* Card 2: Contact info */}
          <VendorInfoCard title="Contact Registry" icon={User}>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <Sparkles className="size-4 text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Contact Name</span>
                  <span className="font-bold text-zinc-800 block">{mappedVendor.contactPerson || "N/A"}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="size-4 text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Email Address</span>
                  <span className="font-semibold text-zinc-700 block truncate max-w-[180px]">{mappedVendor.email}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="size-4 text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Phone Number</span>
                  <span className="font-bold text-zinc-700 block font-mono">{mappedVendor.phone || "N/A"}</span>
                </div>
              </div>
            </div>
          </VendorInfoCard>
        </div>

        {/* Right Column: Address and Invoices queues */}
        <div className="md:col-span-2 space-y-6">
          {/* Card 3: Corporate Address */}
          <VendorInfoCard title="Registered Address" icon={MapPin}>
            <div className="flex gap-2.5 text-zinc-700 font-semibold leading-relaxed">
              <MapPin className="size-4.5 text-zinc-400 shrink-0 mt-0.5" />
              <p>{mappedVendor.address || "No office address registered for this supplier record."}</p>
            </div>
          </VendorInfoCard>

          {/* Card 4: Recent Invoices activity */}
          <VendorInfoCard title="Recent Invoice Actions" icon={Receipt}>
            {mappedBills.length === 0 ? (
              <div className="p-4 text-center text-zinc-400 font-medium">
                No invoices have been registered for this vendor.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-zinc-200/80">
                <table className="w-full border-collapse text-left text-xs font-sans">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-450 font-bold uppercase text-[9px] tracking-wider">
                      <th className="p-3">Invoice Number</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Billing Date</th>
                      <th className="p-3 text-right">Workflow Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700 font-medium">
                    {mappedBills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="p-3 font-bold text-zinc-900">{bill.billNumber}</td>
                        <td className="p-3 font-mono font-bold text-zinc-800">{bill.amount}</td>
                        <td className="p-3 text-zinc-400 font-semibold">{bill.date}</td>
                        <td className="p-3 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase border
                              ${bill.status === "ACCOUNTS_CLEARED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : bill.status === "REJECTED"
                                ? "bg-red-50 text-red-700 border-red-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                              }
                            `}
                          >
                            {bill.statusLabel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </VendorInfoCard>
        </div>
      </div>
    </div>
  );
};

export default VendorDetailsPage;
