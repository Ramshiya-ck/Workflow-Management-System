import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, KeyRound, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetPasswordSchema } from "../validation/userSchemas";

const ResetPasswordDialog = ({ isOpen, onClose, onConfirm, isLoading, userName, error }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        password: "",
        confirmPassword: "",
      });
    }
  }, [isOpen, reset]);

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

  const onSubmitForm = (data) => {
    onConfirm(data.password);
  };

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
        aria-labelledby="reset-pass-title"
        className="bg-white rounded-xl border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.08)] max-w-sm w-full p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200 font-sans"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 p-1.5 rounded-lg transition-all cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 select-none">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 border border-orange-100 text-orange-600">
              <KeyRound className="size-6" />
            </div>

            <div className="space-y-1">
              <h3 id="reset-pass-title" className="text-sm font-bold text-zinc-900">
                Reset Account Password
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Set a new temporary password for user <span className="font-bold text-zinc-900">"{userName}"</span>.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                New Password
              </label>
              <input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className="w-full h-9 rounded-lg border border-zinc-200 px-3 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all placeholder-zinc-300"
              />
              {errors.password && (
                <span className="text-[10px] font-semibold text-red-500 flex items-center gap-1">
                  <AlertTriangle className="size-3" />
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Confirm Password
              </label>
              <input
                type="password"
                {...register("confirmPassword")}
                placeholder="••••••••"
                className="w-full h-9 rounded-lg border border-zinc-200 px-3 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all placeholder-zinc-300"
              />
              {errors.confirmPassword && (
                <span className="text-[10px] font-semibold text-red-500 flex items-center gap-1">
                  <AlertTriangle className="size-3" />
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-[10px] text-red-600 font-semibold text-left w-full leading-normal">
              {error}
            </div>
          )}

          <div className="flex gap-2 w-full pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 cursor-pointer border border-zinc-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-white"
            >
              {isLoading ? "Saving..." : "Save Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(ResetPasswordDialog);
