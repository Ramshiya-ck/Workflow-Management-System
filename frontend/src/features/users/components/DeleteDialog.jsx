import React, { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const DeleteDialog = ({ isOpen, onClose, onConfirm, isLoading, userName }) => {
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
      <div 
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm" 
        onClick={onClose} 
        aria-hidden="true"
      />
      
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-user-title"
        className="bg-white rounded-xl border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.08)] max-w-sm w-full p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200 font-sans"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 p-1.5 rounded-lg transition-all cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4 select-none">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 border border-red-100 text-red-650 animate-bounce">
            <AlertTriangle className="size-6" />
          </div>

          <div className="space-y-1">
            <h3 id="delete-user-title" className="text-sm font-bold text-zinc-900">
              Deactivate User Profile
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Are you sure you want to deactivate <span className="font-bold text-zinc-900">"{userName}"</span>? This will lock the account and prevent all system logins.
            </p>
          </div>

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
              {isLoading ? "Deactivating..." : "Deactivate"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DeleteDialog);
