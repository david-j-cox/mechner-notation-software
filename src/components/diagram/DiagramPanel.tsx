"use client";

import { useDiagramStore } from "@/hooks/useDiagram";
import { MechnerCanvas } from "./MechnerCanvas";

export function DiagramPanel() {
  const diagram = useDiagramStore((state) => state.diagram);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-700">Diagram</h2>
      </div>
      <div className="flex-1 overflow-auto">
        <MechnerCanvas diagram={diagram} />
      </div>
    </div>
  );
}
