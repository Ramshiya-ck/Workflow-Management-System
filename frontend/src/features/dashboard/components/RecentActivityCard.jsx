import React from "react";
import { ShieldCheck, XCircle, ArrowRightLeft } from "lucide-react";

/**
 * Audit log timeline tracking recent bill actions and notes.
 */
const RecentActivityCard = ({ activities = [] }) => {
  const getIcon = (action) => {
    if (action === "APPROVE") return { icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
    if (action === "REJECT") return { icon: XCircle, color: "text-red-600 bg-red-50 border-red-100" };
    return { icon: ArrowRightLeft, color: "text-zinc-500 bg-zinc-50 border-zinc-200" };
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5 space-y-4 font-sans select-none">
      <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
        <h3 className="text-sm font-bold text-zinc-900">Recent Activity Logs</h3>
        <span className="text-xs text-zinc-400 font-semibold cursor-pointer hover:underline">View All</span>
      </div>

      {activities.length === 0 ? (
        <p className="text-xs text-zinc-400 text-center py-6 font-medium">No recent transitions recorded.</p>
      ) : (
        <div className="max-h-[260px] overflow-y-auto relative border-l border-zinc-100 ml-3.5 pl-5 pr-2 space-y-5 py-1">
          {activities.map((act, index) => {
            const { icon: Icon, color } = getIcon(act.action);
            return (
              <div key={index} className="relative">
                {/* Node icon placement */}
                <div className={`absolute right-full mr-5 translate-x-1/2 top-0.5 flex h-7 w-7 items-center justify-center rounded-full border ${color} z-10`}>
                  <Icon className="size-3.5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-800">{act.billNumber}</span>
                    <span className="text-[10px] text-zinc-400 font-semibold">{act.timestamp}</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-normal">
                    <span className="font-bold text-zinc-900">{act.userName}</span> transitioned bill from{" "}
                    <span className="font-semibold text-zinc-700">{act.fromStatus}</span> to{" "}
                    <span className="font-semibold text-zinc-700">{act.toStatus}</span>.
                  </p>
                  {act.note && (
                    <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-md text-[10px] text-zinc-500 mt-1 leading-normal italic">
                      "{act.note}"
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(RecentActivityCard);
