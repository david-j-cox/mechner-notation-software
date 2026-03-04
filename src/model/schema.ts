import { z } from "zod";

export const stimulusFunctionSchema = z.enum([
  "discriminative",
  "delta",
  "reinforcer_positive",
  "reinforcer_negative",
  "punisher_positive",
  "punisher_negative",
  "establishing_operation",
  "abolishing_operation",
  "conditioned",
  "unconditioned",
  "neutral",
]);

export const scheduleTypeSchema = z.enum([
  "FR",
  "VR",
  "FI",
  "VI",
  "FT",
  "VT",
  "CRF",
  "EXT",
]);

export const connectionTypeSchema = z.enum([
  "produces",
  "occasions",
  "elicits",
  "prevents",
  "simultaneous",
]);

export const agentSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  shortLabel: z.string().min(1).max(5),
});

export const stimulusSchema = z.object({
  id: z.string().min(1),
  function: stimulusFunctionSchema,
  label: z.string().min(1),
  conditioned: z.boolean(),
  agentId: z.string().optional(),
  parameters: z.record(z.string(), z.string()).optional(),
});

export const responseSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  agentId: z.string().optional(),
  responseClass: z.string().optional(),
});

export const scheduleSchema = z.object({
  id: z.string().min(1),
  type: scheduleTypeSchema,
  value: z.number().positive().optional(),
  unit: z.string().optional(),
});

export const connectionSchema = z.object({
  id: z.string().min(1),
  type: connectionTypeSchema,
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
  scheduleId: z.string().optional(),
  negated: z.boolean().optional(),
});

export const contingencySchema = z.object({
  id: z.string().min(1),
  label: z.string().optional(),
  antecedents: z.array(z.string()),
  behavior: z.string().min(1),
  consequences: z.array(z.string()),
  connections: z.array(z.string()),
  scheduleId: z.string().optional(),
});

export const mechnerDiagramSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  agents: z.array(agentSchema),
  stimuli: z.array(stimulusSchema),
  responses: z.array(responseSchema),
  schedules: z.array(scheduleSchema),
  connections: z.array(connectionSchema),
  contingencies: z.array(contingencySchema),
});

// Schemas for tool call inputs (no ID — server generates it)
export const addAgentInputSchema = z.object({
  label: z.string().min(1),
  shortLabel: z.string().min(1).max(5),
});

export const addStimulusInputSchema = z.object({
  function: stimulusFunctionSchema,
  label: z.string().min(1),
  conditioned: z.boolean(),
  agentId: z.string().optional(),
  parameters: z.record(z.string(), z.string()).optional(),
});

export const addResponseInputSchema = z.object({
  label: z.string().min(1),
  agentId: z.string().optional(),
  responseClass: z.string().optional(),
});

export const addScheduleInputSchema = z.object({
  type: scheduleTypeSchema,
  value: z.number().positive().optional(),
  unit: z.string().optional(),
});

export const addConnectionInputSchema = z.object({
  type: connectionTypeSchema,
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
  scheduleId: z.string().optional(),
  negated: z.boolean().optional(),
});

export const addContingencyInputSchema = z.object({
  label: z.string().optional(),
  antecedents: z.array(z.string()),
  behavior: z.string().min(1),
  consequences: z.array(z.string()),
  connections: z.array(z.string()),
  scheduleId: z.string().optional(),
});

export const updateElementInputSchema = z.object({
  elementType: z.enum([
    "agent",
    "stimulus",
    "response",
    "schedule",
    "connection",
    "contingency",
  ]),
  id: z.string().min(1),
  updates: z.record(z.string(), z.unknown()),
});

export const removeElementInputSchema = z.object({
  elementType: z.enum([
    "agent",
    "stimulus",
    "response",
    "schedule",
    "connection",
    "contingency",
  ]),
  id: z.string().min(1),
});
