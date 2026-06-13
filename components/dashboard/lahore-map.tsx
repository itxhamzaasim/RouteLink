"use client";

import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MapNode {
  id: string;
  name: string;
  x: number;
  y: number;
}

export const LAHORE_NODES: MapNode[] = [
  { id: "dha", name: "DHA Phase 5", x: 500, y: 320 },
  { id: "lums", name: "LUMS", x: 440, y: 220 },
  { id: "gulberg", name: "Gulberg", x: 300, y: 180 },
  { id: "model_town", name: "Model Town", x: 280, y: 280 },
  { id: "johar_town", name: "Johar Town", x: 160, y: 260 },
  { id: "fast", name: "FAST University", x: 80, y: 320 },
  { id: "mall_road", name: "Mall Road", x: 220, y: 60 },
];

export const MAP_CONNECTIONS = [
  { from: "dha", to: "lums" },
  { from: "lums", to: "gulberg" },
  { from: "gulberg", to: "mall_road" },
  { from: "gulberg", to: "model_town" },
  { from: "model_town", to: "johar_town" },
  { from: "johar_town", to: "fast" },
  { from: "johar_town", to: "gulberg" },
  { from: "model_town", to: "mall_road" },
];

interface LahoreMapProps {
  startNodeId?: string;
  destNodeId?: string;
  activeRoutes?: {
    id: string;
    originCity: string;
    destinationCity: string;
    driverName: string;
    onSelect?: () => void;
  }[];
  onSelectNode?: (type: "start" | "dest", node: MapNode | null) => void;
  interactive?: boolean;
}

export function LahoreMap({
  startNodeId,
  destNodeId,
  activeRoutes = [],
  onSelectNode,
  interactive = true,
}: LahoreMapProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const startNode = LAHORE_NODES.find((n) => n.id === startNodeId);
  const destNode = LAHORE_NODES.find((n) => n.id === destNodeId);

  const handleNodeClick = (node: MapNode) => {
    if (!interactive || !onSelectNode) return;

    if (!startNodeId) {
      onSelectNode("start", node);
    } else if (startNodeId === node.id) {
      onSelectNode("start", null);
    } else if (!destNodeId) {
      onSelectNode("dest", node);
    } else if (destNodeId === node.id) {
      onSelectNode("dest", null);
    } else {
      // Both selected, reset and set as start
      onSelectNode("start", node);
      onSelectNode("dest", null);
    }
  };

  // Find node by name for active route mapping
  const findNodeByName = (cityName: string) => {
    return LAHORE_NODES.find(
      (n) => n.name.toLowerCase() === cityName.toLowerCase() || n.id === cityName.toLowerCase()
    );
  };

  return (
    <div className="relative w-full rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl select-none overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 bg-neutral-950/80 backdrop-blur-xs px-3 py-2 rounded-xl border border-neutral-800">
        <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Interactive Map</div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="size-2.5 rounded-full bg-emerald-500" />
          <span className="text-neutral-300">Start Point</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="size-2.5 rounded-full bg-red-500" />
          <span className="text-neutral-300">Destination</span>
        </div>
        {activeRoutes.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs border-t border-neutral-800 pt-1 mt-1">
            <span className="size-2.5 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-brand-400 font-medium">Active Passenger Commutes</span>
          </div>
        )}
      </div>

      <svg
        viewBox="0 0 600 380"
        className="w-full h-auto overflow-visible"
        style={{ minHeight: "280px" }}
      >
        {/* Connection Roads */}
        {MAP_CONNECTIONS.map((conn, idx) => {
          const fromNode = LAHORE_NODES.find((n) => n.id === conn.from);
          const toNode = LAHORE_NODES.find((n) => n.id === conn.to);
          if (!fromNode || !toNode) return null;

          return (
            <line
              key={`road-${idx}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              className="stroke-neutral-800"
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}

        {/* Selected Route Path */}
        {startNode && destNode && (
          <path
            d={`M ${startNode.x} ${startNode.y} L ${destNode.x} ${destNode.y}`}
            className="stroke-emerald-500/40 fill-none"
            strokeWidth="6"
            strokeLinecap="round"
          />
        )}
        {startNode && destNode && (
          <path
            d={`M ${startNode.x} ${startNode.y} L ${destNode.x} ${destNode.y}`}
            className="stroke-emerald-500 fill-none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="8 6"
            style={{ animation: "dash 20s linear infinite" }}
          />
        )}

        {/* Render Active Commute Passenger Routes */}
        {activeRoutes.map((route) => {
          const oNode = findNodeByName(route.originCity);
          const dNode = findNodeByName(route.destinationCity);
          if (!oNode || !dNode) return null;

          return (
            <g
              key={`active-route-${route.id}`}
              className="cursor-pointer group"
              onClick={route.onSelect}
            >
              <line
                x1={oNode.x}
                y1={oNode.y}
                x2={dNode.x}
                y2={dNode.y}
                className="stroke-brand-500/20 group-hover:stroke-brand-500/40 transition-colors"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <line
                x1={oNode.x}
                y1={oNode.y}
                x2={dNode.x}
                y2={dNode.y}
                className="stroke-brand-500 fill-none"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="6 8"
                style={{ animation: "dash 15s linear infinite" }}
              />
            </g>
          );
        })}

        {/* Nodes */}
        {LAHORE_NODES.map((node) => {
          const isStart = startNodeId === node.id;
          const isDest = destNodeId === node.id;
          const isHovered = hoveredNode === node.id;

          let nodeColor = "fill-neutral-950 stroke-neutral-700";
          let glowColor = "rgba(100, 116, 139, 0.4)";
          if (isStart) {
            nodeColor = "fill-emerald-500 stroke-white";
            glowColor = "rgba(16, 185, 129, 0.6)";
          } else if (isDest) {
            nodeColor = "fill-red-500 stroke-white";
            glowColor = "rgba(239, 68, 68, 0.6)";
          } else if (isHovered) {
            nodeColor = "fill-neutral-800 stroke-brand-500";
            glowColor = "rgba(99, 102, 241, 0.5)";
          }

          return (
            <g
              key={node.id}
              className="cursor-pointer"
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Outer Glow Circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isHovered || isStart || isDest ? 14 : 9}
                className="transition-all duration-200 pointer-events-none"
                style={{ fill: glowColor }}
              />
              {/* Core Node Circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isHovered || isStart || isDest ? 7 : 5}
                className={cn("transition-all duration-200 stroke-[2px]", nodeColor)}
              />
              {/* Label */}
              <text
                x={node.x}
                y={node.y - 18}
                textAnchor="middle"
                className={cn(
                  "text-[10px] font-semibold tracking-wider transition-all pointer-events-none",
                  isStart
                    ? "fill-emerald-400 font-bold"
                    : isDest
                    ? "fill-red-400 font-bold"
                    : isHovered
                    ? "fill-brand-400"
                    : "fill-neutral-400"
                )}
              >
                {node.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Embedded Animations */}
      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -1000;
          }
        }
      `}</style>
    </div>
  );
}
