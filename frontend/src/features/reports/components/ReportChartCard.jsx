import React from "react";

const ReportChartCard = ({ title, type = "bar", data = [] }) => {
  // Simple custom CSS drawings to mock high-fidelity chart components cleanly
  const renderChart = () => {
    switch (type) {
      case "pie": {
        const colorMap = {
          "bg-emerald-500": "#10b981",
          "bg-blue-500": "#3b82f6",
          "bg-rose-500": "#f43f5e",
          "bg-amber-500": "#f59e0b",
          "bg-purple-500": "#a855f7",
          "bg-zinc-500": "#71717a",
          "bg-indigo-500": "#6366f1",
          "bg-zinc-400": "#a1a1aa",
        };
        let cumulativePercent = 0;
        const gradientSlices = data.map((d) => {
          const start = cumulativePercent;
          cumulativePercent += d.value;
          const hexColor = colorMap[d.color] || "#d4d4d8";
          return `${hexColor} ${start}% ${cumulativePercent}%`;
        });
        const backgroundStyle = gradientSlices.length > 0 
          ? `conic-gradient(${gradientSlices.join(", ")})`
          : "conic-gradient(#e4e4e7 0% 100%)";

        return (
          <div className="h-44 flex items-center justify-center gap-6">
            <div 
              style={{ background: backgroundStyle }} 
              className="size-28 rounded-full relative flex items-center justify-center shadow-inner shrink-0"
            >
              <div className="size-20 rounded-full bg-white flex items-center justify-center shadow-sm">
                <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Status</span>
              </div>
            </div>
            <div className="space-y-1.5 text-left text-[10px] font-bold text-zinc-500 overflow-hidden">
              {data.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`size-2.5 rounded-full shrink-0 ${d.color || "bg-zinc-300"}`} />
                  <span className="truncate">{d.label}: {d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "progress":
        return (
          <div className="space-y-4 py-2">
            {data.map((d, i) => (
              <div key={i} className="space-y-1.5 text-left">
                <div className="flex justify-between text-[10px] font-bold text-zinc-650 uppercase tracking-tight">
                  <span>{d.label}</span>
                  <span>{d.value}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 border border-zinc-200/50 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${d.value}%` }}
                    className={`h-full ${d.color || "bg-zinc-950"} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case "line":
        return (
          <div className="h-44 flex flex-col justify-between pt-2">
            <div className="flex-1 flex items-end gap-1.5 border-b border-l border-zinc-200/80 px-2 relative">
              {/* Fake Line Chart SVGs or Bars representing monthly count details */}
              <div className="absolute inset-0 px-4 py-2 flex flex-col justify-between pointer-events-none select-none opacity-20">
                <div className="border-t border-dashed border-zinc-400 w-full" />
                <div className="border-t border-dashed border-zinc-400 w-full" />
                <div className="border-t border-dashed border-zinc-400 w-full" />
              </div>
              {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  <div
                    style={{ height: `${d.value}%` }}
                    className="w-full bg-gradient-to-t from-zinc-950 to-zinc-800 rounded-t-sm group-hover:opacity-85 transition-opacity"
                  />
                  <div className="absolute bottom-full mb-1 bg-zinc-900 text-white text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none select-none transition-opacity whitespace-nowrap">
                    {d.count} Bills
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[8px] font-bold text-zinc-400 pt-1.5 px-2 uppercase tracking-wider">
              {data.map((d, i) => (
                <span key={i}>{d.label}</span>
              ))}
            </div>
          </div>
        );

      case "bar":
      default:
        return (
          <div className="h-44 flex flex-col justify-between pt-2">
            <div className="flex-1 flex items-end gap-3.5 border-b border-l border-zinc-200/80 px-3 relative">
              {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  <div
                    style={{ height: `${d.value}%` }}
                    className={`w-full ${d.color || "bg-zinc-950"} rounded-t-md group-hover:opacity-85 transition-opacity`}
                  />
                  <div className="absolute bottom-full mb-1 bg-zinc-900 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none select-none transition-opacity whitespace-nowrap">
                    {d.count || d.value}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[8px] font-bold text-zinc-400 pt-1.5 px-3 uppercase tracking-wider">
              {data.map((d, i) => (
                <span key={i} className="truncate max-w-[40px]" title={d.label}>
                  {d.label}
                </span>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] font-sans select-none flex flex-col justify-between">
      <div className="pb-3 border-b border-zinc-100 text-left">
        <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
          {title}
        </h4>
      </div>
      <div className="pt-4 flex-1">
        {renderChart()}
      </div>
    </div>
  );
};

export default React.memo(ReportChartCard);
