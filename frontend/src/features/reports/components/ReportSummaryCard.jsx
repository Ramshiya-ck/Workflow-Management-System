import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const ReportSummaryCard = ({ title, value, icon: Icon, description, trend, trendType = "neutral" }) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-3 font-sans select-none text-left flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-450 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2 bg-zinc-50 border border-zinc-200/60 rounded-lg text-zinc-600 shrink-0">
            <Icon className="size-4" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl font-extrabold tracking-tight text-zinc-900">{value}</h3>
        {description && (
          <p className="text-[10px] text-zinc-400 font-semibold">{description}</p>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-100/50">
          {trendType === "up" ? (
            <ArrowUpRight className="size-3.5 text-emerald-600 shrink-0" />
          ) : trendType === "down" ? (
            <ArrowDownRight className="size-3.5 text-rose-500 shrink-0" />
          ) : null}
          <span
            className={`text-[10px] font-bold tracking-tight ${
              trendType === "up"
                ? "text-emerald-700"
                : trendType === "down"
                ? "text-rose-600"
                : "text-zinc-500"
            }`}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(ReportSummaryCard);
