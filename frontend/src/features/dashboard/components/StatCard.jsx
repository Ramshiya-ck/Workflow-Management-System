import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import Skeleton from "@/components/common/Skeleton";

/**
 * KPI Metric Card with visual trends and skeleton supports.
 */
const StatCard = ({ title, value, icon: Icon, trend, trendDirection = "up", isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200/80 p-5 space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
        <div className="flex justify-between items-start">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  const getTrendColor = () => {
    if (trendDirection === "up") return "text-emerald-700 bg-emerald-55/70 border-emerald-100";
    if (trendDirection === "down") return "text-red-700 bg-red-55/70 border-red-100";
    return "text-zinc-550 bg-zinc-50 border-zinc-100";
  };

  const TrendIcon = trendDirection === "up" ? ArrowUpRight : trendDirection === "down" ? ArrowDownRight : Minus;

  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 p-5 space-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all hover:translate-y-[-1px] select-none">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">{title}</span>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-200/60 text-zinc-400">
            <Icon className="size-4" />
          </div>
        )}
      </div>
      <div>
        <span className="text-2xl font-black text-zinc-900 tracking-tight">{value}</span>
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 pt-1">
          <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold border ${getTrendColor()}`}>
            <TrendIcon className="size-3 stroke-[2.5]" />
            {trend}
          </span>
          <span className="text-[10px] text-zinc-400 font-semibold">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(StatCard);
