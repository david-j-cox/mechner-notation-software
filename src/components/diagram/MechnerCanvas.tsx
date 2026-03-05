"use client";

import { useMemo, useState, useRef, useImperativeHandle, forwardRef } from "react";
import type { MechnerDiagram } from "@/model/types";
import { findElementById } from "@/model/contingency";
import { computeLayout, getColumnCenterX, COLUMN_HEADERS } from "./layout/ContingencyLayout";
import { StimulusNode } from "./elements/StimulusNode";
import { ResponseNode } from "./elements/ResponseNode";
import { ArrowConnector } from "./elements/ArrowConnector";

export interface MechnerCanvasHandle {
  getSVGElement: () => SVGSVGElement | null;
}

interface MechnerCanvasProps {
  diagram: MechnerDiagram;
}

export const MechnerCanvas = forwardRef<MechnerCanvasHandle, MechnerCanvasProps>(
  function MechnerCanvas({ diagram }, ref) {
    const layout = useMemo(() => computeLayout(diagram), [diagram]);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    useImperativeHandle(ref, () => ({
      getSVGElement: () => svgRef.current,
    }));

    if (layout.contingencies.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-slate-400">
          <div className="text-center">
            <p className="text-lg font-medium">No diagram yet</p>
            <p className="text-sm mt-1">
              Describe a behavior scenario in the chat to get started
            </p>
          </div>
        </div>
      );
    }

    return (
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="bg-white"
      >
        {/* Column headers */}
        {COLUMN_HEADERS.map(({ label, col }) => (
          <text
            key={label}
            x={getColumnCenterX(col)}
            y={20}
            textAnchor="middle"
            fontSize={11}
            fill="#94a3b8"
            fontFamily="sans-serif"
          >
            {label}
          </text>
        ))}

        {layout.contingencies.map((cont) => (
          <g key={cont.id}>
            {cont.connections.map((conn) => (
              <ArrowConnector
                key={conn.id}
                connection={conn}
                highlighted={
                  hoveredId === conn.sourceId || hoveredId === conn.targetId
                }
              />
            ))}

            {cont.elements.map((el) => {
              if (el.type === "stimulus") {
                const stimulus = findElementById(diagram.stimuli, el.id);
                if (!stimulus) return null;
                return (
                  <StimulusNode
                    key={el.id}
                    stimulus={stimulus}
                    x={el.x}
                    y={el.y}
                    width={el.width}
                    height={el.height}
                    selected={selectedId === el.id}
                    onHover={setHoveredId}
                    onClick={setSelectedId}
                  />
                );
              }
              if (el.type === "response") {
                const response = findElementById(diagram.responses, el.id);
                if (!response) return null;
                return (
                  <ResponseNode
                    key={el.id}
                    response={response}
                    x={el.x}
                    y={el.y}
                    width={el.width}
                    height={el.height}
                    selected={selectedId === el.id}
                    onHover={setHoveredId}
                    onClick={setSelectedId}
                  />
                );
              }
              return null;
            })}
          </g>
        ))}
      </svg>
    );
  }
);
