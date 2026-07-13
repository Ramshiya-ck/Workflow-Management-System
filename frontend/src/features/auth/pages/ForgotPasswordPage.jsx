import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { forgotPasswordSchema } from "../validation/authSchemas";
import { useForgotPassword } from "../hooks/useForgotPassword";
import AuthLayout from "../components/AuthLayout";
import AuthHeader from "../components/AuthHeader";
import AuthCard from "../components/AuthCard";
import SuccessMessage from "../components/SuccessMessage";
import LoadingButton from "../components/LoadingButton";
import FormError from "../components/FormError";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ForgotPasswordPage = () => {
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: sendLink, isPending, error } = useForgotPassword(() => {
    setIsSuccess(true);
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = React.useCallback((data) => {
    sendLink(data.email);
  }, [sendLink]);

  return (
    <AuthLayout>
      <AuthCard>
        {isSuccess ? (
          <SuccessMessage
            title="Reset Link Sent"
            message="If an account exists with that email address, we have sent a secure password reset link. Please check your inbox and spam folders."
          />
        ) : (
          <>
            <AuthHeader
              title="Reset your password"
              description="Enter the email associated with your account and we will send you a reset link."
            />

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-xs font-semibold text-destructive animate-in fade-in duration-200">
                {error.friendlyMessage || error.message}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Email address */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  aria-invalid={errors.email ? "true" : "false"}
                  {...register("email")}
                  className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                  disabled={isPending}
                  autoComplete="email"
                  required
                />
                <FormError message={errors.email?.message} />
              </div>

              {/* Submit Button */}
              <LoadingButton
                type="submit"
                isLoading={isPending}
                loadingText="Sending Link..."
                className="w-full cursor-pointer mt-2"
              >
                Send Reset Link
              </LoadingButton>

              <div className="text-center pt-2">
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

export default ForgotPasswordPage;
