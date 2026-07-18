import React, { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Dialog overlay asking confirmation before executing permanent deletion of vendor records.
 */
const DeleteVendorDialog = ({ isOpen, onClose, onConfirm, isLoading, vendorName, error }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm" 
        onClick={onClose} 
        aria-hidden="true"
      />
      
      {/* Modal Card */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-vendor-title"
        className="bg-white rounded-xl border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.08)] max-w-sm w-full p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-455 hover:bg-zinc-100 hover:text-zinc-800 p-1.5 rounded-lg transition-all cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4 font-sans select-none">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 border border-red-100 text-red-650 animate-bounce">
            <AlertTriangle className="size-6" />
          </div>

          <div className="space-y-1">
            <h3 id="delete-vendor-title" className="text-sm font-bold text-zinc-900">
              Delete Vendor
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-zinc-900">"{vendorName}"</span>? This action is permanent and will remove associated history logs.
            </p>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-[10px] text-red-600 font-semibold text-left w-full leading-normal">
              {error}
            </div>
          )}

          <div className="flex gap-2 w-full pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 cursor-pointer border border-zinc-200"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 cursor-pointer"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DeleteVendorDialog);
