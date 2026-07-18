import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

const UserStatusBadge = ({ isActive }) => {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
        <CheckCircle2 className="size-3" />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-50 text-zinc-650 border border-zinc-150">
      <XCircle className="size-3" />
      Inactive
    </span>
  );
};

export default React.memo(UserStatusBadge);
