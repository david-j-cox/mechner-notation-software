export type StimulusFunction =
  | "discriminative"
  | "delta"
  | "reinforcer_positive"
  | "reinforcer_negative"
  | "punisher_positive"
  | "punisher_negative"
  | "establishing_operation"
  | "abolishing_operation"
  | "conditioned"
  | "unconditioned"
  | "neutral";

export type ScheduleType =
  | "FR"
  | "VR"
  | "FI"
  | "VI"
  | "FT"
  | "VT"
  | "CRF"
  | "EXT";

export type ConnectionType =
  | "produces"
  | "occasions"
  | "elicits"
  | "prevents"
  | "simultaneous";

export interface Agent {
  id: string;
  label: string;
  shortLabel: string;
}

export interface Stimulus {
  id: string;
  function: StimulusFunction;
  label: string;
  conditioned: boolean;
  agentId?: string;
  parameters?: Record<string, string>;
}

export interface Response {
  id: string;
  label: string;
  agentId?: string;
  responseClass?: string;
}

export interface Schedule {
  id: string;
  type: ScheduleType;
  value?: number;
  unit?: string;
}

export interface Connection {
  id: string;
  type: ConnectionType;
  sourceId: string;
  targetId: string;
  scheduleId?: string;
  negated?: boolean;
}

export interface Contingency {
  id: string;
  label?: string;
  antecedents: string[];
  behavior: string;
  consequences: string[];
  connections: string[];
  scheduleId?: string;
}

export interface MechnerDiagram {
  id: string;
  title: string;
  agents: Agent[];
  stimuli: Stimulus[];
  responses: Response[];
  schedules: Schedule[];
  connections: Connection[];
  contingencies: Contingency[];
}
