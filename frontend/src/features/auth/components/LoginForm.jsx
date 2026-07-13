import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { loginSchema } from "../validation/authSchemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import PasswordInput from "./PasswordInput";
import LoadingButton from "./LoadingButton";
import FormError from "./FormError";

const LoginForm = ({ onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans" noValidate>
      {/* Email address */}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@company.com"
          aria-invalid={errors.email ? "true" : "false"}
          {...register("email")}
          className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
          disabled={isLoading}
          autoComplete="username"
          required
        />
        <FormError message={errors.email?.message} />
      </div>

      {/* Password */}
      <div>
        <div className="relative">
          <PasswordInput
            id="password"
            label="Password"
            error={errors.password}
            disabled={isLoading}
            autoComplete="current-password"
            {...register("password")}
          />
        </div>
      </div>

      {/* Remember Me & Forgot Password link */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            disabled={isLoading}
            onCheckedChange={(checked) => {
              const el = document.getElementById("rememberMe-hidden");
              if (el) {
                el.checked = !!checked;
                el.dispatchEvent(new Event("change", { bubbles: true }));
              }
            }}
          />
          <input
            id="rememberMe-hidden"
            type="checkbox"
            className="sr-only"
            {...register("rememberMe")}
          />
          <Label
            htmlFor="rememberMe"
            className="text-xs font-normal text-muted-foreground select-none cursor-pointer"
          >
            Keep me signed in
          </Label>
        </div>
        <Link
          to="/forgot-password"
          className="text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded px-1"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <LoadingButton
        type="submit"
        isLoading={isLoading}
        loadingText="Authenticating..."
        className="w-full cursor-pointer mt-2"
      >
        Sign In
      </LoadingButton>
    </form>
  );
};

export default React.memo(LoginForm);
