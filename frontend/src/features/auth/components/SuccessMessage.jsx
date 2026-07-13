import React from "react";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const SuccessMessage = ({ title, message, linkText = "Back to Sign In", linkUrl = "/login" }) => {
  return (
    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200 select-none">
      <div className="flex items-center gap-2 text-emerald-600 mb-2">
        <CheckCircle className="size-6 shrink-0" />
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 leading-none">{title}</h1>
      </div>
      <p className="text-sm text-zinc-500 leading-relaxed font-medium">
        {message}
      </p>
      <div className="pt-2">
        <Link to={linkUrl} className="inline-flex items-center gap-2 text-sm font-bold text-zinc-900 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 rounded px-1 transition-colors">
          <ArrowLeft className="size-4" />
          {linkText}
        </Link>
      </div>
    </div>
  );
};

export default React.memo(SuccessMessage);
