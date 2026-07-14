import React, { useEffect } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Standard confirmation dialog for approving workflow tasks.
 */
const ApproveWorkflowDialog = ({ isOpen, onClose, onConfirm, isLoading }) => {
  useEffect(() => {
    if (!isOpen) return;
    const originalActiveElement = document.activeElement;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const container = document.getElementById("approve-dialog-container");
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
      const container = document.getElementById("approve-dialog-container");
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs font-sans select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="approve-title"
    >
      <div
        id="approve-dialog-container"
        className="w-full max-w-md bg-white border border-zinc-200 rounded-xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 mb-4">
          <Check className="size-6" />
        </div>

        <h3 id="approve-title" className="text-sm font-bold text-zinc-900">
          Approve Workflow Invoice
        </h3>
        <p className="text-xs text-zinc-550 mt-2 leading-relaxed">
          Are you sure you want to approve this invoice? This will forward the bill to the next department level in the clearance pipeline.
        </p>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            onClick={onClose}
            disabled={isLoading}
            variant="outline"
            className="text-xs cursor-pointer border border-zinc-200"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="text-xs cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-sm"
          >
            {isLoading ? "Approving..." : "Approve Invoice"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ApproveWorkflowDialog);
