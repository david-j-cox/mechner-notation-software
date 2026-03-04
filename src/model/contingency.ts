import type { MechnerDiagram, Stimulus, Connection, Schedule } from "./types";

let counter = 0;

export function generateId(prefix: string): string {
  counter++;
  return `${prefix}_${Date.now()}_${counter}`;
}

export function resetIdCounter(): void {
  counter = 0;
}

export function createEmptyDiagram(title: string = "Untitled Diagram"): MechnerDiagram {
  return {
    id: generateId("diagram"),
    title,
    agents: [],
    stimuli: [],
    responses: [],
    schedules: [],
    connections: [],
    contingencies: [],
  };
}

export function findElementById<T extends { id: string }>(
  elements: T[],
  id: string
): T | undefined {
  return elements.find((el) => el.id === id);
}

export function getStimulusNotation(stimulus: Stimulus): string {
  const superscripts: Record<string, string> = {
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
  const sup = superscripts[stimulus.function] ?? "";
  return `S${sup}`;
}

export function getScheduleNotation(schedule: Schedule): string {
  if (schedule.type === "CRF" || schedule.type === "EXT") {
    return schedule.type;
  }
  return `${schedule.type}${schedule.value ?? ""}`;
}

export function getConnectionsForElement(
  diagram: MechnerDiagram,
  elementId: string
): Connection[] {
  return diagram.connections.filter(
    (c) => c.sourceId === elementId || c.targetId === elementId
  );
}
