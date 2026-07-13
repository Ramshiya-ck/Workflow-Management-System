import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { resetPasswordSchema } from "../validation/authSchemas";
import { useResetPassword } from "../hooks/useResetPassword";
import AuthLayout from "../components/AuthLayout";
import AuthHeader from "../components/AuthHeader";
import AuthCard from "../components/AuthCard";
import SuccessMessage from "../components/SuccessMessage";
import PasswordInput from "../components/PasswordInput";
import PasswordStrength from "../components/PasswordStrength";
import LoadingButton from "../components/LoadingButton";
import FormError from "../components/FormError";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [isSuccess, setIsSuccess] = useState(false);

  const email = searchParams.get("email") || "";
  const code = searchParams.get("code") || "";

  const { mutate: performReset, isPending, error } = useResetPassword(() => {
    setIsSuccess(true);
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordVal = watch("password", "");

  const onSubmit = React.useCallback((data) => {
    performReset({
      email,
      code,
      newPassword: data.password,
    });
  }, [performReset, email, code]);

  return (
    <AuthLayout>
      <AuthCard>
        {isSuccess ? (
          <SuccessMessage
            title="Password Reset"
            message="Your password has been successfully updated. You can now use your new credentials to log into the Workflow Management System."
            linkText="Sign In Now"
          />
        ) : (
          <>
            <AuthHeader
              title="Create new password"
              description="Enter a strong password to complete security verification."
            />

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-xs font-semibold text-destructive animate-in fade-in duration-200">
                {error.friendlyMessage || error.message}
              </div>
            )}

            {(!email || !code) && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-250 rounded-md text-xs font-medium text-amber-800 animate-in fade-in duration-200">
                Warning: Missing verification token query parameter details. Please use the exact link sent to your work email.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* New Password */}
              <PasswordInput
                id="password"
                label="New Password"
                error={errors.password}
                disabled={isPending}
                autoComplete="new-password"
                {...register("password")}
              />

              {/* Password strength meter */}
              <PasswordStrength password={passwordVal} />

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                  {...register("confirmPassword")}
                  className={errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}
                  disabled={isPending}
                  autoComplete="new-password"
                  required
                />
                <FormError message={errors.confirmPassword?.message} />
              </div>

              {/* Submit */}
              <LoadingButton
                type="submit"
                isLoading={isPending}
                loadingText="Resetting Password..."
                className="w-full cursor-pointer mt-2"
                disabled={!email || !code || isPending}
              >
                Reset Password
              </LoadingButton>

              <div className="text-center pt-1">
                <Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded px-1">
                  <ArrowLeft className="size-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          </>
        )}
      </AuthCard>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
