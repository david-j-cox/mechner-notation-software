"use client";

import type { Stimulus } from "@/model/types";

interface StimulusNodeProps {
  stimulus: Stimulus;
  x: number;
  y: number;
  width: number;
  height: number;
  selected?: boolean;
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
}

const SUPERSCRIPT_MAP: Record<string, string> = {
  discriminative: "D",
  delta: "Δ",
  reinforcer_positive: "R+",
  reinforcer_negative: "R−",
  punisher_positive: "P+",
  punisher_negative: "P−",
  establishing_operation: "EO",
  abolishing_operation: "AO",
  conditioned: "C",
  unconditioned: "UC",
  neutral: "",
};

export function StimulusNode({
  stimulus,
  x,
  y,
  width,
  height,
  selected,
  onHover,
  onClick,
}: StimulusNodeProps) {
  const superscript = SUPERSCRIPT_MAP[stimulus.function] ?? "";
  const cx = x + width / 2;
  const cy = y + height / 2;

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => onHover?.(stimulus.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(stimulus.id)}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        fill={selected ? "#dbeafe" : "#f8fafc"}
        stroke={selected ? "#3b82f6" : "#334155"}
        strokeWidth={selected ? 2 : 1.5}
      />
      {/* Main S */}
      <text
        x={cx - (superscript ? 4 : 0)}
        y={cy + 6}
        textAnchor="middle"
        fontSize={22}
        fontFamily="serif"
        fontStyle="italic"
        fill="#0f172a"
      >
        S
      </text>
      {/* Superscript */}
      {superscript && (
        <text
          x={cx + 10}
          y={cy - 6}
          textAnchor="start"
          fontSize={12}
          fontFamily="sans-serif"
          fontWeight="bold"
          fill="#0f172a"
        >
          {superscript}
        </text>
      )}
      {/* Subscript label below box */}
      <text
        x={cx}
        y={y + height + 14}
        textAnchor="middle"
        fontSize={10}
        fontFamily="sans-serif"
        fill="#64748b"
      >
        {stimulus.label}
      </text>
      <title>{stimulus.label}</title>
    </g>
  );
}
