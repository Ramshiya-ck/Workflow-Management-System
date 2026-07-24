import React from "react";
import { CheckCircle2, Circle, AlertCircle, Clock } from "lucide-react";

/**
 * Single step state node in the workflow path.
 */
const WorkflowStep = ({ label, role, status, isLast }) => {
  const icon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="size-5 text-emerald-600 bg-white" />;
      case "active":
        return <Circle className="size-5 text-amber-500 fill-amber-500 animate-pulse bg-white" />;
      case "holding":
        return <AlertCircle className="size-5 text-orange-500 fill-orange-100 bg-white" />;
      case "pending":
      default:
        return <Clock className="size-5 text-zinc-300 bg-white" />;
    }
  };

  const textStyle = () => {
    switch (status) {
      case "completed":
        return "text-emerald-700 font-bold";
      case "active":
        return "text-zinc-950 font-bold";
      case "holding":
        return "text-orange-700 font-bold";
      default:
        return "text-zinc-400 font-semibold";
    }
  };

  return (
    <div className="flex flex-1 items-start gap-3 relative min-w-[140px] md:min-w-0">
      {/* Visual dot & line */}
      <div className="flex flex-col items-center">
        <div className="z-10 relative">{icon()}</div>
        {!isLast && (
          <div className={`hidden md:block absolute left-2.5 top-2.5 w-[calc(100%-12px)] h-0.5 z-0 ${
            status === "completed" ? "bg-emerald-500" : "bg-zinc-200"
          }`} />
        )}
      </div>

      {/* Texts details */}
      <div className="space-y-0.5 select-none pt-0.5 bg-white z-10 relative pr-2">
        <span className={`text-xs block leading-tight ${textStyle()}`}>{label}</span>
        <span className="text-[10px] text-zinc-400 font-bold block">{role}</span>
      </div>
    </div>
  );
};

export default React.memo(WorkflowStep);
