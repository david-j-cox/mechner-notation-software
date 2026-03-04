import { describe, it, expect } from "vitest";
import {
  agentSchema,
  stimulusSchema,
  responseSchema,
  scheduleSchema,
  connectionSchema,
  contingencySchema,
  addAgentInputSchema,
  addStimulusInputSchema,
  addResponseInputSchema,
  addScheduleInputSchema,
  addConnectionInputSchema,
  addContingencyInputSchema,
  updateElementInputSchema,
  removeElementInputSchema,
} from "@/model/schema";

describe("Agent schema", () => {
  it("accepts valid agent", () => {
    const result = agentSchema.safeParse({
      id: "agent_1",
      label: "Rat",
      shortLabel: "R",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing label", () => {
    const result = agentSchema.safeParse({
      id: "agent_1",
      shortLabel: "R",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty id", () => {
    const result = agentSchema.safeParse({
      id: "",
      label: "Rat",
      shortLabel: "R",
    });
    expect(result.success).toBe(false);
  });

  it("rejects shortLabel longer than 5 chars", () => {
    const result = agentSchema.safeParse({
      id: "agent_1",
      label: "Rat",
      shortLabel: "RatLong",
    });
    expect(result.success).toBe(false);
  });
});

describe("Stimulus schema", () => {
  it("accepts valid discriminative stimulus", () => {
    const result = stimulusSchema.safeParse({
      id: "stim_1",
      function: "discriminative",
      label: "Red light",
      conditioned: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid reinforcer with agent and parameters", () => {
    const result = stimulusSchema.safeParse({
      id: "stim_2",
      function: "reinforcer_positive",
      label: "Food pellet",
      conditioned: false,
      agentId: "agent_1",
      parameters: { amount: "5mg" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid function type", () => {
    const result = stimulusSchema.safeParse({
      id: "stim_1",
      function: "magical",
      label: "Wand",
      conditioned: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing conditioned field", () => {
    const result = stimulusSchema.safeParse({
      id: "stim_1",
      function: "discriminative",
      label: "Red light",
    });
    expect(result.success).toBe(false);
  });

  it("validates all stimulus function types", () => {
    const functions = [
      "discriminative", "delta", "reinforcer_positive", "reinforcer_negative",
      "punisher_positive", "punisher_negative", "establishing_operation",
      "abolishing_operation", "conditioned", "unconditioned", "neutral",
    ];
    for (const fn of functions) {
      const result = stimulusSchema.safeParse({
        id: `stim_${fn}`,
        function: fn,
        label: `Test ${fn}`,
        conditioned: false,
      });
      expect(result.success, `Function "${fn}" should be valid`).toBe(true);
    }
  });
});

describe("Response schema", () => {
  it("accepts valid response", () => {
    const result = responseSchema.safeParse({
      id: "resp_1",
      label: "Lever press",
    });
    expect(result.success).toBe(true);
  });

  it("accepts response with optional fields", () => {
    const result = responseSchema.safeParse({
      id: "resp_1",
      label: "Lever press",
      agentId: "agent_1",
      responseClass: "operant",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty label", () => {
    const result = responseSchema.safeParse({
      id: "resp_1",
      label: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("Schedule schema", () => {
  it("accepts CRF without value", () => {
    const result = scheduleSchema.safeParse({
      id: "sched_1",
      type: "CRF",
    });
    expect(result.success).toBe(true);
  });

  it("accepts FR with value", () => {
    const result = scheduleSchema.safeParse({
      id: "sched_1",
      type: "FR",
      value: 5,
    });
    expect(result.success).toBe(true);
  });

  it("accepts VI with value and unit", () => {
    const result = scheduleSchema.safeParse({
      id: "sched_1",
      type: "VI",
      value: 30,
      unit: "seconds",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid schedule type", () => {
    const result = scheduleSchema.safeParse({
      id: "sched_1",
      type: "XYZ",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative value", () => {
    const result = scheduleSchema.safeParse({
      id: "sched_1",
      type: "FR",
      value: -5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero value", () => {
    const result = scheduleSchema.safeParse({
      id: "sched_1",
      type: "FR",
      value: 0,
    });
    expect(result.success).toBe(false);
  });

  it("validates all schedule types", () => {
    const types = ["FR", "VR", "FI", "VI", "FT", "VT", "CRF", "EXT"];
    for (const type of types) {
      const result = scheduleSchema.safeParse({ id: `s_${type}`, type });
      expect(result.success, `Type "${type}" should be valid`).toBe(true);
    }
  });
});

describe("Connection schema", () => {
  it("accepts valid connection", () => {
    const result = connectionSchema.safeParse({
      id: "conn_1",
      type: "produces",
      sourceId: "resp_1",
      targetId: "stim_1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts connection with optional fields", () => {
    const result = connectionSchema.safeParse({
      id: "conn_1",
      type: "occasions",
      sourceId: "stim_1",
      targetId: "resp_1",
      scheduleId: "sched_1",
      negated: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid connection type", () => {
    const result = connectionSchema.safeParse({
      id: "conn_1",
      type: "teleports",
      sourceId: "a",
      targetId: "b",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty sourceId", () => {
    const result = connectionSchema.safeParse({
      id: "conn_1",
      type: "produces",
      sourceId: "",
      targetId: "stim_1",
    });
    expect(result.success).toBe(false);
  });

  it("validates all connection types", () => {
    const types = ["produces", "occasions", "elicits", "prevents", "simultaneous"];
    for (const type of types) {
      const result = connectionSchema.safeParse({
        id: `c_${type}`,
        type,
        sourceId: "a",
        targetId: "b",
      });
      expect(result.success, `Type "${type}" should be valid`).toBe(true);
    }
  });
});

describe("Contingency schema", () => {
  it("accepts valid contingency", () => {
    const result = contingencySchema.safeParse({
      id: "cont_1",
      antecedents: ["stim_1"],
      behavior: "resp_1",
      consequences: ["stim_2"],
      connections: ["conn_1", "conn_2"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts contingency with optional fields", () => {
    const result = contingencySchema.safeParse({
      id: "cont_1",
      label: "Positive reinforcement",
      antecedents: [],
      behavior: "resp_1",
      consequences: [],
      connections: [],
      scheduleId: "sched_1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing behavior", () => {
    const result = contingencySchema.safeParse({
      id: "cont_1",
      antecedents: [],
      consequences: [],
      connections: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("Tool input schemas", () => {
  describe("addAgentInputSchema", () => {
    it("accepts valid input without id", () => {
      const result = addAgentInputSchema.safeParse({
        label: "Student",
        shortLabel: "S",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing shortLabel", () => {
      const result = addAgentInputSchema.safeParse({ label: "Student" });
      expect(result.success).toBe(false);
    });
  });

  describe("addStimulusInputSchema", () => {
    it("accepts valid input", () => {
      const result = addStimulusInputSchema.safeParse({
        function: "reinforcer_positive",
        label: "Food",
        conditioned: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("addResponseInputSchema", () => {
    it("accepts minimal input", () => {
      const result = addResponseInputSchema.safeParse({ label: "Lever press" });
      expect(result.success).toBe(true);
    });
  });

  describe("addScheduleInputSchema", () => {
    it("accepts type only", () => {
      const result = addScheduleInputSchema.safeParse({ type: "CRF" });
      expect(result.success).toBe(true);
    });
  });

  describe("addConnectionInputSchema", () => {
    it("accepts valid connection input", () => {
      const result = addConnectionInputSchema.safeParse({
        type: "produces",
        sourceId: "resp_1",
        targetId: "stim_1",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("addContingencyInputSchema", () => {
    it("accepts valid contingency input", () => {
      const result = addContingencyInputSchema.safeParse({
        antecedents: ["stim_1"],
        behavior: "resp_1",
        consequences: ["stim_2"],
        connections: ["conn_1"],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateElementInputSchema", () => {
    it("accepts valid update", () => {
      const result = updateElementInputSchema.safeParse({
        elementType: "stimulus",
        id: "stim_1",
        updates: { label: "New label" },
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid element type", () => {
      const result = updateElementInputSchema.safeParse({
        elementType: "widget",
        id: "w_1",
        updates: {},
      });
      expect(result.success).toBe(false);
    });
  });

  describe("removeElementInputSchema", () => {
    it("accepts valid removal", () => {
      const result = removeElementInputSchema.safeParse({
        elementType: "connection",
        id: "conn_1",
      });
      expect(result.success).toBe(true);
    });
  });
});
