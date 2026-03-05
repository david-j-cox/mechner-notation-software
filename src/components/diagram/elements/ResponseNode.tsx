"use client";

import type { Response } from "@/model/types";

interface ResponseNodeProps {
  response: Response;
  x: number;
  y: number;
  width: number;
  height: number;
  selected?: boolean;
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
}

export function ResponseNode({
  response,
  x,
  y,
  width,
  height,
  selected,
  onHover,
  onClick,
}: ResponseNodeProps) {
  const cx = x + width / 2;
  const cy = y + height / 2;

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => onHover?.(response.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(response.id)}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        fill={selected ? "#dcfce7" : "#f8fafc"}
        stroke={selected ? "#22c55e" : "#334155"}
        strokeWidth={selected ? 2 : 1.5}
      />
      <text
        x={cx}
        y={cy + 6}
        textAnchor="middle"
        fontSize={22}
        fontFamily="serif"
        fontStyle="italic"
        fill="#0f172a"
      >
        R
      </text>
      {/* Subscript label below box */}
      <text
        x={cx}
        y={y + height + 14}
        textAnchor="middle"
        fontSize={10}
        fontFamily="sans-serif"
        fill="#64748b"
      >
        {response.label}
      </text>
      <title>{response.label}</title>
    </g>
  );
}
