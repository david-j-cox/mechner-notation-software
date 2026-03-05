import type { MechnerDiagram, Stimulus } from "@/model/types";
import { findElementById, getScheduleNotation } from "@/model/contingency";

export interface PositionedElement {
  id: string;
  type: "stimulus" | "response";
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PositionedConnection {
  id: string;
  sourceId: string;
  targetId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  negated: boolean;
  scheduleLabel?: string;
}

export interface PositionedContingency {
  id: string;
  label?: string;
  y: number;
  elements: PositionedElement[];
  connections: PositionedConnection[];
}

export interface DiagramLayout {
  width: number;
  height: number;
  contingencies: PositionedContingency[];
}

// Layout constants
const NODE_WIDTH = 80;
const NODE_HEIGHT = 50;
const COL_GAP = 120;
const ROW_GAP = 80;
const PADDING = 40;

// Column positions: MO | Antecedent | Behavior | Consequence
const COLUMNS = {
  mo: 0,
  antecedent: 1,
  behavior: 2,
  consequence: 3,
};

export function getColumnCenterX(col: number): number {
  return PADDING + col * (NODE_WIDTH + COL_GAP) + NODE_WIDTH / 2;
}

export const COLUMN_HEADERS = [
  { label: "MO", col: COLUMNS.mo },
  { label: "Antecedent", col: COLUMNS.antecedent },
  { label: "Behavior", col: COLUMNS.behavior },
  { label: "Consequence", col: COLUMNS.consequence },
];

interface ElementEdges {
  left: { x: number; y: number };
  right: { x: number; y: number };
}

function getColumnX(col: number): number {
  return PADDING + col * (NODE_WIDTH + COL_GAP);
}

function getStimulusColumn(stimulus: Stimulus): number {
  switch (stimulus.function) {
    case "establishing_operation":
    case "abolishing_operation":
      return COLUMNS.mo;
    case "discriminative":
    case "delta":
    case "conditioned":
    case "unconditioned":
    case "neutral":
      return COLUMNS.antecedent;
    case "reinforcer_positive":
    case "reinforcer_negative":
    case "punisher_positive":
    case "punisher_negative":
      return COLUMNS.consequence;
    default:
      return COLUMNS.antecedent;
  }
}

function computeEdges(x: number, y: number): ElementEdges {
  const cy = y + NODE_HEIGHT / 2;
  return {
    left: { x, y: cy },
    right: { x: x + NODE_WIDTH, y: cy },
  };
}

export function computeLayout(diagram: MechnerDiagram): DiagramLayout {
  if (diagram.contingencies.length === 0) {
    return { width: 600, height: 400, contingencies: [] };
  }

  const positioned: PositionedContingency[] = [];
  let currentY = PADDING;

  for (const contingency of diagram.contingencies) {
    const elements: PositionedElement[] = [];
    const elementEdges = new Map<string, ElementEdges>();

    // Position antecedent stimuli
    let antecedentOffset = 0;
    for (const antId of contingency.antecedents) {
      const stimulus = findElementById(diagram.stimuli, antId);
      if (stimulus) {
        const col = getStimulusColumn(stimulus);
        const x = getColumnX(col);
        const y = currentY + antecedentOffset * (NODE_HEIGHT + 10);
        elements.push({
          id: stimulus.id,
          type: "stimulus",
          x,
          y,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
        });
        elementEdges.set(stimulus.id, computeEdges(x, y));
        antecedentOffset++;
      }
    }

    // Position behavior
    const behaviorResponse = findElementById(diagram.responses, contingency.behavior);
    if (behaviorResponse) {
      const x = getColumnX(COLUMNS.behavior);
      const y = currentY;
      elements.push({
        id: behaviorResponse.id,
        type: "response",
        x,
        y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
      elementEdges.set(behaviorResponse.id, computeEdges(x, y));
    }

    // Position consequence stimuli
    let consequenceOffset = 0;
    for (const consId of contingency.consequences) {
      const stimulus = findElementById(diagram.stimuli, consId);
      if (stimulus) {
        const x = getColumnX(COLUMNS.consequence);
        const y = currentY + consequenceOffset * (NODE_HEIGHT + 10);
        elements.push({
          id: stimulus.id,
          type: "stimulus",
          x,
          y,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
        });
        elementEdges.set(stimulus.id, computeEdges(x, y));
        consequenceOffset++;
      }
    }

    // Position connections — use right edge for source, left edge for target
    const connections: PositionedConnection[] = [];
    for (const connId of contingency.connections) {
      const conn = findElementById(diagram.connections, connId);
      if (conn) {
        const sourceEdges = elementEdges.get(conn.sourceId);
        const targetEdges = elementEdges.get(conn.targetId);
        if (sourceEdges && targetEdges) {
          // Resolve schedule label if present
          let scheduleLabel: string | undefined;
          if (conn.scheduleId) {
            const schedule = findElementById(diagram.schedules, conn.scheduleId);
            if (schedule) {
              scheduleLabel = getScheduleNotation(schedule);
            }
          }

          connections.push({
            id: conn.id,
            sourceId: conn.sourceId,
            targetId: conn.targetId,
            x1: sourceEdges.right.x,
            y1: sourceEdges.right.y,
            x2: targetEdges.left.x,
            y2: targetEdges.left.y,
            negated: conn.negated ?? false,
            scheduleLabel,
          });
        }
      }
    }

    const maxElements = Math.max(1, antecedentOffset, consequenceOffset);
    const rowHeight = maxElements * (NODE_HEIGHT + 10) - 10;

    positioned.push({
      id: contingency.id,
      label: contingency.label,
      y: currentY,
      elements,
      connections,
    });

    currentY += rowHeight + ROW_GAP;
  }

  const totalWidth = getColumnX(4) + PADDING;
  const totalHeight = currentY + PADDING;

  return {
    width: totalWidth,
    height: totalHeight,
    contingencies: positioned,
  };
}
