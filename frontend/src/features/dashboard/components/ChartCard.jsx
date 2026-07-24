import React, { useState, useMemo } from "react";

/**
 * High-fidelity, pure SVG interactive Area/Line chart rendering monthly clearance trends.
 * Supports hover tooltips, smooth gradients, and zero external dependencies.
 */
const ChartCard = ({ title, subtitle, trends = [] }) => {
  const [activeIdx, setActiveIdx] = useState(null);

  // Fallback mock data if server metrics are empty
  const chartData = useMemo(() => {
    if (trends && trends.length >= 2) {
      return trends.map(t => ({
        month: t.month.split(" ")[0], // Extract month name abbreviation
        amount: Number(t.amount),
        count: Number(t.count)
      }));
    }
    return [
      { month: "Feb", count: 3, amount: 45000 },
      { month: "Mar", count: 7, amount: 89000 },
      { month: "Apr", count: 5, amount: 62000 },
      { month: "May", count: 12, amount: 154000 },
      { month: "Jun", count: 9, amount: 110000 },
      { month: "Jul", count: 15, amount: 198000 },
    ];
  }, [trends]);

  // Dimension coordinates
  const svgWidth = 500;
  const svgHeight = 180;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 25;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Max value calculations
  const maxAmount = useMemo(() => {
    const maxVal = Math.max(...chartData.map((d) => d.amount), 0);
    return maxVal > 0 ? maxVal * 1.15 : 10000; // 15% headroom
  }, [chartData]);

  // Calculate coordinates
  const points = useMemo(() => {
    return chartData.map((d, idx) => {
      const x = paddingLeft + idx * (chartWidth / (chartData.length - 1));
      const y = svgHeight - paddingBottom - (d.amount / maxAmount) * chartHeight;
      return { x, y, ...d };
    });
  }, [chartData, chartWidth, chartHeight, maxAmount]);

  // SVG Path definitions
  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    return points.reduce((path, pt, idx) => {
      return path + `${idx === 0 ? "M" : "L"} ${pt.x} ${pt.y}`;
    }, "");
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const first = points[0];
    const last = points[points.length - 1];
    const bottomY = svgHeight - paddingBottom;
    return `${linePath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [points, linePath]);

  // Format currency labels
  const formatYLabel = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  // Generate 4 Y-axis division labels
  const yTicks = [0, maxAmount * 0.33, maxAmount * 0.66, maxAmount];

  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5 space-y-4 font-sans select-none flex flex-col justify-between min-h-[300px] relative">
      <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
          {subtitle && <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">{subtitle}</p>}
        </div>
        {activeIdx !== null && (
          <div className="text-right animate-in fade-in slide-in-from-top-1 duration-150">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Hovered Amount</span>
            <span className="text-xs font-bold text-indigo-600 block">
              ₹{Number(points[activeIdx].amount).toLocaleString("en-IN")}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 relative flex items-center justify-center pt-2">
        <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, idx) => {
            const y = svgHeight - paddingBottom - (tick / maxAmount) * chartHeight;
            return (
              <g key={idx} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#e4e4e7"
                  strokeWidth="1"
                  strokeDasharray={idx === 0 ? "0" : "4 4"}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-zinc-400 font-bold"
                >
                  {formatYLabel(tick)}
                </text>
              </g>
            );
          })}

          {/* Area under the line */}
          <path d={areaPath} fill="url(#areaGrad)" />

          {/* Trend line */}
          <path
            d={linePath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_2px_8px_rgba(99,102,241,0.2)]"
          />

          {/* Hover highlight vertical guide line */}
          {activeIdx !== null && (
            <line
              x1={points[activeIdx].x}
              y1={paddingTop}
              x2={points[activeIdx].x}
              y2={svgHeight - paddingBottom}
              stroke="#6366f1"
              strokeWidth="1"
              strokeDasharray="3 3"
              className="opacity-60"
            />
          )}

          {/* Data point circles & hover overlays */}
          {points.map((pt, idx) => {
            const isHovered = activeIdx === idx;
            return (
              <g key={idx}>
                {/* Visual Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5.5 : 3.5}
                  fill={isHovered ? "#ffffff" : "#6366f1"}
                  stroke="#6366f1"
                  strokeWidth={isHovered ? 2.5 : 1}
                  className="transition-all duration-150 cursor-pointer"
                />

                {/* X-Axis labels */}
                <text
                  x={pt.x}
                  y={svgHeight - paddingBottom + 16}
                  textAnchor="middle"
                  className={`text-[9px] font-bold transition-all duration-150 ${
                    isHovered ? "fill-zinc-900" : "fill-zinc-400"
                  }`}
                >
                  {pt.month}
                </text>

                {/* Larger invisible trigger rectangle for smooth hover target */}
                <rect
                  x={pt.x - 20}
                  y={paddingTop}
                  width="40"
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveIdx(idx)}
                  onMouseLeave={() => setActiveIdx(null)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default React.memo(ChartCard);
