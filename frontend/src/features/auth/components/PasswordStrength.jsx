import React from "react";
import { Check } from "lucide-react";

const PasswordStrength = ({ password }) => {
  if (!password) return null;

  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };

  const strengthCount = Object.values(checks).filter(Boolean).length;

  const strengthLabel = () => {
    if (strengthCount <= 1) return { text: "Very Weak", color: "bg-red-500" };
    if (strengthCount === 2) return { text: "Weak", color: "bg-orange-500" };
    if (strengthCount === 3) return { text: "Medium", color: "bg-amber-500" };
    if (strengthCount === 4) return { text: "Strong", color: "bg-emerald-500" };
    return { text: "Very Strong", color: "bg-green-600" };
  };

  const strength = strengthLabel();

  return (
    <div className="space-y-3 w-full select-none">
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-zinc-400 font-semibold tracking-wide uppercase">Password Security</span>
          <span className={`font-bold ${strengthCount >= 4 ? "text-emerald-600" : strengthCount === 3 ? "text-amber-600" : "text-red-500"}`}>
            {strength.text}
          </span>
        </div>
        <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden flex gap-0.5">
          <div className={`h-full flex-1 transition-all duration-300 ${strengthCount >= 1 ? strength.color : "bg-transparent"}`} />
          <div className={`h-full flex-1 transition-all duration-300 ${strengthCount >= 2 ? strength.color : "bg-transparent"}`} />
          <div className={`h-full flex-1 transition-all duration-300 ${strengthCount >= 3 ? strength.color : "bg-transparent"}`} />
          <div className={`h-full flex-1 transition-all duration-300 ${strengthCount >= 4 ? strength.color : "bg-transparent"}`} />
          <div className={`h-full flex-1 transition-all duration-300 ${strengthCount >= 5 ? strength.color : "bg-transparent"}`} />
        </div>
      </div>

      <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200/60 space-y-2">
        <span className="text-[10px] font-bold text-zinc-400 block tracking-wider uppercase">Complexity Requirements</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
          {[
            { label: "8+ characters", check: checks.length },
            { label: "Lowercase letter", check: checks.lowercase },
            { label: "Uppercase letter", check: checks.uppercase },
            { label: "Number digit", check: checks.number },
            { label: "Special symbol", check: checks.special },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs text-zinc-500">
              <div className={`size-3.5 rounded-full flex items-center justify-center border shrink-0 transition-all ${item.check ? "border-emerald-600 bg-emerald-50 text-emerald-600" : "border-zinc-300 bg-white"}`}>
                {item.check && <Check className="size-2.5 stroke-[3.5]" />}
              </div>
              <span className={`text-[11px] ${item.check ? "text-emerald-800 font-semibold" : "text-zinc-500 font-medium"}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(PasswordStrength);
