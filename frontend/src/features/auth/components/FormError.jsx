import React from "react";
import { AlertTriangle } from "lucide-react";

const FormError = ({ message }) => {
  if (!message) return null;
  return (
    <div
      className="text-xs font-semibold text-red-700 bg-red-50 border border-red-100/80 rounded-md p-2.5 flex items-start gap-2 mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
      role="alert"
    >
      <AlertTriangle className="size-3.5 shrink-0 mt-0.5 text-red-500" />
      <span>{message}</span>
    </div>
  );
};

export default React.memo(FormError);
