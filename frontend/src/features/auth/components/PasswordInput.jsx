import React, { useState, useEffect } from "react";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormError from "./FormError";

const PasswordInput = React.forwardRef(
  ({ label = "Password", id = "password", error, disabled, autoComplete = "current-password", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [capsLockActive, setCapsLockActive] = useState(false);

    const checkCapsLock = (e) => {
      if (e.getModifierState && e.getModifierState("CapsLock")) {
        setCapsLockActive(true);
      } else {
        setCapsLockActive(false);
      }
    };

    useEffect(() => {
      const handleKeyUp = (e) => checkCapsLock(e);
      window.addEventListener("keyup", handleKeyUp);
      return () => window.removeEventListener("keyup", handleKeyUp);
    }, []);

    const togglePasswordVisibility = React.useCallback(() => {
      setShowPassword((prev) => !prev);
    }, []);

    return (
      <div className="space-y-1.5 w-full">
        <div className="flex items-center justify-between">
          <Label htmlFor={id}>{label}</Label>
        </div>
        <div className="relative">
          <Input
            id={id}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            onKeyDown={checkCapsLock}
            aria-invalid={error ? "true" : "false"}
            ref={ref}
            className={error ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
            disabled={disabled}
            autoComplete={autoComplete}
            required
            {...props}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded p-0.5 cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={disabled}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <FormError message={error?.message} />
        {capsLockActive && (
          <p className="text-xs font-medium text-amber-600 flex items-center gap-1.5 mt-1" role="alert">
            <AlertTriangle className="size-3" />
            Caps Lock is ON
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default React.memo(PasswordInput);
