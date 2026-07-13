import React from "react";
import { AreaChart } from "lucide-react";

/**
 * Clean wrapper housing analytic graphics or placeholder messaging.
 */
const ChartCard = ({ title, subtitle }) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5 space-y-4 font-sans select-none flex flex-col justify-between min-h-[300px]">
      <div className="border-b border-zinc-100 pb-3">
        <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
        {subtitle && <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-100 rounded-xl bg-zinc-50/50 p-6 text-center">
        <AreaChart className="size-8 text-zinc-300 stroke-[1.5] mb-2" />
        <span className="text-xs font-bold text-zinc-700">Analytical chart container</span>
        <span className="text-[10px] text-zinc-400 font-semibold mt-0.5">Integration pending real-time data connection</span>
      </div>
    </div>
  );
};

export default React.memo(ChartCard);
