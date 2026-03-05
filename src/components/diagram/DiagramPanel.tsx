"use client";

import { useRef } from "react";
import { useDiagramStore } from "@/hooks/useDiagram";
import { MechnerCanvas, type MechnerCanvasHandle } from "./MechnerCanvas";
import { exportSVG, exportPNG } from "@/lib/svgExport";

export function DiagramPanel() {
  const diagram = useDiagramStore((state) => state.diagram);
  const canvasRef = useRef<MechnerCanvasHandle>(null);
  const hasDiagram = diagram.contingencies.length > 0;

  const handleExportSVG = () => {
    const svg = canvasRef.current?.getSVGElement();
    if (svg) exportSVG(svg);
  };

  const handleExportPNG = () => {
    const svg = canvasRef.current?.getSVGElement();
    if (svg) exportPNG(svg);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-700">Diagram</h2>
        {hasDiagram && (
          <div className="flex gap-1">
            <button
              onClick={handleExportSVG}
              className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
            >
              SVG
            </button>
            <button
              onClick={handleExportPNG}
              className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
            >
              PNG
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        <MechnerCanvas ref={canvasRef} diagram={diagram} />
      </div>
    </div>
  );
}
