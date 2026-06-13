"use client";

import { useState } from "react";

interface ChartDataPoint {
  label: string;
  count: number;
}

interface ChartProps {
  data: ChartDataPoint[];
  title: string;
  gradientFrom?: string;
  gradientTo?: string;
  accentColor?: string;
}

export function LineChart({
  data,
  title,
  gradientFrom = "var(--color-brand-500)",
  gradientTo = "var(--color-brand-600)",
  accentColor = "#10b981", // Emerald accent
}: ChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/50 text-neutral-500">
        No trend data available.
      </div>
    );
  }

  const padding = { top: 30, right: 20, bottom: 40, left: 40 };
  const chartWidth = 500;
  const chartHeight = 220;

  const maxVal = Math.max(...data.map((d) => d.count), 5); // default min height scale of 5
  
  // Calculate points
  const points = data.map((d, index) => {
    const x = padding.left + (index / (data.length - 1)) * (chartWidth - padding.left - padding.right);
    const y = padding.top + (1 - d.count / maxVal) * (chartHeight - padding.top - padding.bottom);
    return { x, y, label: d.label, count: d.count };
  });

  // Generate path string for polyline
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Generate path string for gradient area under the line
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${points[0].x} ${chartHeight - padding.bottom} Z`
    : "";

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
          {title}
        </h3>
        {hoveredIndex !== null && (
          <span className="text-xs font-semibold text-neutral-200 bg-neutral-850 px-2 py-1 rounded-md border border-neutral-800 animate-fade-in">
            {points[hoveredIndex].label}:{" "}
            <span className="text-brand-400 font-bold">{points[hoveredIndex].count}</span> signups
          </span>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientFrom} stopOpacity={0.25} />
              <stop offset="100%" stopColor={gradientFrom} stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={gradientFrom} />
              <stop offset="100%" stopColor={gradientTo} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + ratio * (chartHeight - padding.top - padding.bottom);
            const val = Math.round(maxVal * (1 - ratio));
            return (
              <g key={i} className="opacity-20">
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#ffffff"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="#ffffff"
                  fontSize="10"
                  textAnchor="end"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Gradient area */}
          {areaPath && (
            <path d={areaPath} fill="url(#areaGradient)" />
          )}

          {/* Trend line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#strokeGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interaction circles */}
          {points.map((p, i) => (
            <g key={i}>
              {/* Invisible interactive zone */}
              <circle
                cx={p.x}
                cy={p.y}
                r="12"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              {/* Visible circle */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === i ? "6" : "4"}
                fill={hoveredIndex === i ? accentColor : "#1f2937"}
                stroke={hoveredIndex === i ? "#ffffff" : gradientFrom}
                strokeWidth={hoveredIndex === i ? "2" : "1.5"}
                className="pointer-events-none transition-all duration-150"
              />
            </g>
          ))}

          {/* X-axis labels */}
          {points.map((p, i) => {
            // Only show labels for first, mid, and last points to avoid crowding
            const showLabel = i === 0 || i === Math.floor(points.length / 2) || i === points.length - 1;
            if (!showLabel) return null;

            // Format date label (e.g. Jun 12)
            const dateObj = new Date(p.label);
            const formattedLabel = isNaN(dateObj.getTime())
              ? p.label
              : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

            return (
              <text
                key={i}
                x={p.x}
                y={chartHeight - 15}
                fill="#9ca3af"
                fontSize="10"
                textAnchor="middle"
                className="opacity-70"
              >
                {formattedLabel}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function BarChart({
  data,
  title,
  gradientFrom = "#8b5cf6", // Violet
  gradientTo = "#c084fc", // Light Purple
  accentColor = "#c084fc",
}: ChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/50 text-neutral-500">
        No statistics data available.
      </div>
    );
  }

  const padding = { top: 30, right: 20, bottom: 40, left: 40 };
  const chartWidth = 500;
  const chartHeight = 220;

  const maxVal = Math.max(...data.map((d) => d.count), 5); // default min height scale of 5
  
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const barWidth = (innerWidth / data.length) * 0.6;
  const gap = (innerWidth / data.length) * 0.4;

  const bars = data.map((d, index) => {
    const x = padding.left + index * (barWidth + gap) + gap / 2;
    const barHeight = (d.count / maxVal) * innerHeight;
    const y = chartHeight - padding.bottom - barHeight;
    return { x, y, width: barWidth, height: barHeight, label: d.label, count: d.count };
  });

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
          {title}
        </h3>
        {hoveredIndex !== null && (
          <span className="text-xs font-semibold text-neutral-200 bg-neutral-850 px-2 py-1 rounded-md border border-neutral-800 animate-fade-in">
            {bars[hoveredIndex].label}:{" "}
            <span className="text-purple-400 font-bold">{bars[hoveredIndex].count}</span> rides
          </span>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientFrom} />
              <stop offset="100%" stopColor={gradientTo} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + ratio * innerHeight;
            const val = Math.round(maxVal * (1 - ratio));
            return (
              <g key={i} className="opacity-20">
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#ffffff"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="#ffffff"
                  fontSize="10"
                  textAnchor="end"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Trend bars */}
          {bars.map((bar, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g key={i}>
                <rect
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={Math.max(bar.height, 2)} // min height 2px for visual trace
                  rx="3"
                  fill="url(#barGradient)"
                  className="transition-all duration-150 cursor-pointer"
                  style={{
                    opacity: hoveredIndex === null || isHovered ? 1.0 : 0.6,
                    filter: isHovered ? `drop-shadow(0px 0px 6px ${accentColor})` : "none",
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}

          {/* X-axis labels */}
          {bars.map((bar, i) => {
            // Only show labels for first, mid, and last points to avoid crowding
            const showLabel = i === 0 || i === Math.floor(bars.length / 2) || i === bars.length - 1;
            if (!showLabel) return null;

            // Format date label (e.g. Jun 12)
            const dateObj = new Date(bar.label);
            const formattedLabel = isNaN(dateObj.getTime())
              ? bar.label
              : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

            return (
              <text
                key={i}
                x={bar.x + bar.width / 2}
                y={chartHeight - 15}
                fill="#9ca3af"
                fontSize="10"
                textAnchor="middle"
                className="opacity-70"
              >
                {formattedLabel}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
