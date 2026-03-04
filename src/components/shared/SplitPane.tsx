"use client";

import { useState, useCallback, useRef } from "react";

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultSplit?: number; // percentage for left pane, 0-100
  minLeft?: number;
  minRight?: number;
}

export function SplitPane({
  left,
  right,
  defaultSplit = 40,
  minLeft = 20,
  minRight = 20,
}: SplitPaneProps) {
  const [split, setSplit] = useState(defaultSplit);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.max(minLeft, Math.min(100 - minRight, pct));
      setSplit(clamped);
    };

    const handleMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [minLeft, minRight]);

  return (
    <div ref={containerRef} className="flex h-full w-full">
      <div style={{ width: `${split}%` }} className="h-full overflow-hidden">
        {left}
      </div>
      <div
        className="w-1 bg-slate-200 hover:bg-slate-400 cursor-col-resize shrink-0 transition-colors"
        onMouseDown={handleMouseDown}
      />
      <div style={{ width: `${100 - split}%` }} className="h-full overflow-hidden">
        {right}
      </div>
    </div>
  );
}
