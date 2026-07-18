import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVendorOptions } from "@/features/bills/api/bills.api";
import { useCreateBill } from "@/features/bills/hooks/useCreateBill";
import { FileText, Save, CheckCircle, AlertTriangle } from "lucide-react";

const ReceivingRegistrationCard = () => {
  const queryClient = useQueryClient();
  const [vendor, setVendor] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  // Query vendors
  const { data: vendors = [], isLoading: isVendorsLoading } = useQuery({
    queryKey: ["vendor-options"],
    queryFn: getVendorOptions,
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useCreateBill();

  const validate = () => {
    const errs = {};
    if (!vendor) errs.vendor = "Please select a vendor";
    if (!billNumber.trim()) errs.billNumber = "Bill number is required";
    if (!billDate) errs.billDate = "Invoice date is required";
    if (!amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      errs.amount = "Please enter a valid positive decimal amount";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      vendor,
      billNumber: billNumber.trim(),
      billDate,
      amount: amount.trim(),
      department: "", // Optional for receiving department
      description: "Submitted from Receiving Department dashboard.",
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        setMessage({ type: "success", text: "Bill registered successfully! Status set to 'Received'." });
        setVendor("");
        setBillNumber("");
        setBillDate("");
        setAmount("");
        setErrors({});
        queryClient.invalidateQueries({ queryKey: ["dashboardBills"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        setTimeout(() => setMessage(null), 5000);
      },
      onError: (err) => {
        const backendErrors = err?.response?.data?.errors || {};
        if (backendErrors.bill_number) {
          setErrors((prev) => ({ ...prev, billNumber: backendErrors.bill_number[0] }));
        } else {
          const backendError = err?.response?.data?.message || err?.message || "Failed to submit bill.";
          setMessage({ type: "error", text: backendError });
        }
      },
    });
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5 space-y-4 font-sans select-none text-left">
      <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
        <div className="p-1.5 bg-zinc-50 border border-zinc-200/60 text-zinc-650 rounded-lg">
          <FileText className="size-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-900">Register Incoming Bill</h3>
          <p className="text-[11px] text-zinc-400 font-medium">Record a vendor invoice details to start the approval pipeline.</p>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
            message.type === "success"
              ? "bg-emerald-50 border border-emerald-100 text-emerald-800"
              : "bg-red-50 border border-red-100 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="size-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="size-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-zinc-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Vendor selection */}
          <div className="space-y-1.5">
            <label htmlFor="vendor" className="text-zinc-500 font-bold">Associated Vendor *</label>
            <select
              id="vendor"
              disabled={isVendorsLoading || createMutation.isPending}
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-sans cursor-pointer h-9"
            >
              <option value="">Select a vendor...</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.gstNumber || v.code})
                </option>
              ))}
            </select>
            {errors.vendor && <p className="text-[10px] text-red-500 mt-0.5">{errors.vendor}</p>}
          </div>

          {/* Bill Number */}
          <div className="space-y-1.5">
            <label htmlFor="billNumber" className="text-zinc-500 font-bold">Bill Number *</label>
            <input
              id="billNumber"
              type="text"
              placeholder="e.g. INV-2026-99"
              disabled={createMutation.isPending}
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              className={`w-full text-xs bg-white border rounded-lg p-2.5 focus:outline-none focus:ring-1 font-sans h-9 ${
                errors.billNumber ? "border-red-500 focus:ring-red-500" : "border-zinc-200 focus:ring-zinc-950"
              }`}
            />
            {errors.billNumber && <p className="text-[10px] text-red-500 mt-0.5">{errors.billNumber}</p>}
          </div>

          {/* Bill Date */}
          <div className="space-y-1.5">
            <label htmlFor="billDate" className="text-zinc-500 font-bold">Bill Date *</label>
            <input
              id="billDate"
              type="date"
              disabled={createMutation.isPending}
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-sans h-9 text-zinc-700"
            />
            {errors.billDate && <p className="text-[10px] text-red-500 mt-0.5">{errors.billDate}</p>}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label htmlFor="amount" className="text-zinc-500 font-bold">Invoice Amount (INR) *</label>
            <input
              id="amount"
              type="text"
              placeholder="e.g. 25000.00"
              disabled={createMutation.isPending}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-sans h-9"
            />
            {errors.amount && <p className="text-[10px] text-red-500 mt-0.5">{errors.amount}</p>}
          </div>

        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full sm:w-auto px-5 py-2.5 bg-zinc-950 hover:bg-zinc-905 text-white font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="size-4" />
            <span>{createMutation.isPending ? "Submitting Invoice..." : "Submit Invoice"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default React.memo(ReceivingRegistrationCard);
