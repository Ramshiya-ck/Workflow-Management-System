import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { holdWorkflowSchema } from "../validation/workflowSchemas";

/**
 * Form modal dialog for placing bills on hold.
 */
const HoldWorkflowDialog = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(holdWorkflowSchema),
    defaultValues: {
      reason_code: "",
      reason_note: "",
      comments: ""
    }
  });

  const selectedCode = watch("reason_code");

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (!isOpen) return;
    const originalActiveElement = document.activeElement;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const container = document.getElementById("hold-dialog-container");
        if (!container) return;
        const selectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const elements = Array.from(container.querySelectorAll(selectors)).filter(
          (el) => !el.disabled && el.tabIndex !== -1
        );
        if (elements.length === 0) return;
        const first = elements[0];
        const last = elements[elements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    // Focus first focusable element
    setTimeout(() => {
      const container = document.getElementById("hold-dialog-container");
      const firstBtn = container?.querySelector("button");
      if (firstBtn) firstBtn.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (originalActiveElement && typeof originalActiveElement.focus === "function") {
        originalActiveElement.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    onConfirm(data);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs font-sans select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hold-title"
    >
      <div
        id="hold-dialog-container"
        className="w-full max-w-md bg-white border border-zinc-200 rounded-xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 border border-orange-100 text-orange-655 mb-4">
          <HelpCircle className="size-6" />
        </div>

        <h3 id="hold-title" className="text-sm font-bold text-zinc-900">
          Place Invoice on Hold
        </h3>
        <p className="text-xs text-zinc-550 mt-1 mb-4 leading-relaxed">
          Temporarily pause clearance checks for this invoice by selecting a hold reason code.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          {/* Reason Code */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Hold Reason Code
            </label>
            <select
              {...register("reason_code")}
              className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-sans cursor-pointer"
            >
              <option value="">Select a reason code...</option>
              <option value="Vendor Clarification Pending">Vendor Clarification Pending</option>
              <option value="Credit Note Pending">Credit Note Pending</option>
              <option value="Price Verification Pending">Price Verification Pending</option>
              <option value="GST Verification Pending">GST Verification Pending</option>
              <option value="Awaiting Management Decision">Awaiting Management Decision</option>
              <option value="Other">Other (Require details)</option>
            </select>
            {errors.reason_code && (
              <p className="text-[10px] text-red-600 font-semibold">{errors.reason_code.message}</p>
            )}
          </div>

          {/* Reason Note */}
          {selectedCode === "Other" && (
            <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-150">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Detailed Reason Note
              </label>
              <textarea
                {...register("reason_note")}
                rows="2"
                placeholder="Specify what clarification or check is outstanding..."
                className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-sans resize-none"
              />
              {errors.reason_note && (
                <p className="text-[10px] text-red-600 font-semibold">{errors.reason_note.message}</p>
              )}
            </div>
          )}

          {/* Comments */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Optional Comments
            </label>
            <textarea
              {...register("comments")}
              rows="2"
              placeholder="Internal tracking notes..."
              className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-sans resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              variant="outline"
              className="text-xs cursor-pointer border border-zinc-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="text-xs cursor-pointer bg-orange-600 hover:bg-orange-700 text-white border-none shadow-sm font-semibold"
            >
              {isLoading ? "Placing Hold..." : "Confirm Hold"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(HoldWorkflowDialog);
