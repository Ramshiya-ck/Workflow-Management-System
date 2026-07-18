import React, { useEffect } from "react";
import { X } from "lucide-react";
import DepartmentForm from "./DepartmentForm";

/**
 * Modal dialog to update details of an existing department. Supports keyboard close gestures and screen-reader tags.
 */
const EditDepartmentDialog = ({ isOpen, onClose, onSubmit, isLoading, department, error }) => {
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

  const defaultValues = department
    ? {
        name: department.name,
        code: department.code,
        isActive: department.is_active !== undefined ? department.is_active : !!department.isActive,
      }
    : null;

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
        aria-labelledby="edit-dept-title"
        className="bg-white rounded-xl border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.08)] max-w-md w-full p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-455 hover:bg-zinc-100 hover:text-zinc-800 p-1.5 rounded-lg transition-all cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        <div className="mb-4">
          <h3 id="edit-dept-title" className="text-base font-bold text-zinc-900 leading-tight">
            Edit Department
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1 font-semibold leading-normal">
            Modify department name, code, or status configurations.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-100 rounded-lg text-[10px] text-red-600 font-semibold text-left leading-normal">
            {error}
          </div>
        )}

        <DepartmentForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isLoading={isLoading}
          buttonText="Save Changes"
          isEdit={true}
        />
      </div>
    </div>
  );
};

export default React.memo(EditDepartmentDialog);
