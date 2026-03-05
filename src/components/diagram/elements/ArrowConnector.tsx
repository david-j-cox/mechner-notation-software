"use client";

import type { PositionedConnection } from "../layout/ContingencyLayout";

interface ArrowConnectorProps {
  connection: PositionedConnection;
  highlighted?: boolean;
}

export function ArrowConnector({ connection, highlighted }: ArrowConnectorProps) {
  const { x1, y1, x2, y2, negated, scheduleLabel } = connection;
  const color = highlighted ? "#3b82f6" : "#334155";
  const strokeWidth = highlighted ? 2 : 1.5;
  const markerId = `arrow-${connection.id}`;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <g>
      <defs>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={color} />
        </marker>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        markerEnd={`url(#${markerId})`}
      />
      {negated && (
        <text
          x={midX}
          y={midY - 8}
          textAnchor="middle"
          fontSize={16}
          fill={color}
        >
          ~
        </text>
      )}
      {scheduleLabel && (
        <text
          x={midX}
          y={midY - 8}
          textAnchor="middle"
          fontSize={11}
          fontFamily="sans-serif"
          fontWeight="600"
          fill="#6366f1"
        >
          {scheduleLabel}
        </text>
      )}
    </g>
  );
}
