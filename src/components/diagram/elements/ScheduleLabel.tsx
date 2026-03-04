"use client";

import type { Schedule } from "@/model/types";
import { getScheduleNotation } from "@/model/contingency";

interface ScheduleLabelProps {
  schedule: Schedule;
  x: number;
  y: number;
}

export function ScheduleLabel({ schedule, x, y }: ScheduleLabelProps) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize={12}
      fontFamily="sans-serif"
      fontWeight="600"
      fill="#6366f1"
    >
      {getScheduleNotation(schedule)}
    </text>
  );
}
