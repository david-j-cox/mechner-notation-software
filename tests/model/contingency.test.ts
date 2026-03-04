import { describe, it, expect, beforeEach } from "vitest";
import {
  generateId,
  resetIdCounter,
  createEmptyDiagram,
  findElementById,
  getStimulusNotation,
  getScheduleNotation,
  getConnectionsForElement,
} from "@/model/contingency";
import type { Stimulus, Schedule, MechnerDiagram } from "@/model/types";

beforeEach(() => {
  resetIdCounter();
});

describe("generateId", () => {
  it("generates unique IDs with prefix", () => {
    const id1 = generateId("agent");
    const id2 = generateId("agent");
    expect(id1).toMatch(/^agent_/);
    expect(id2).toMatch(/^agent_/);
    expect(id1).not.toBe(id2);
  });

  it("uses different prefixes", () => {
    const agentId = generateId("agent");
    const stimId = generateId("stim");
    expect(agentId).toMatch(/^agent_/);
    expect(stimId).toMatch(/^stim_/);
  });

  it("generates many unique IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId("test"));
    }
    expect(ids.size).toBe(100);
  });
});

describe("createEmptyDiagram", () => {
  it("creates diagram with default title", () => {
    const diagram = createEmptyDiagram();
    expect(diagram.title).toBe("Untitled Diagram");
    expect(diagram.id).toMatch(/^diagram_/);
  });

  it("creates diagram with custom title", () => {
    const diagram = createEmptyDiagram("My Diagram");
    expect(diagram.title).toBe("My Diagram");
  });

  it("creates diagram with empty collections", () => {
    const diagram = createEmptyDiagram();
    expect(diagram.agents).toEqual([]);
    expect(diagram.stimuli).toEqual([]);
    expect(diagram.responses).toEqual([]);
    expect(diagram.schedules).toEqual([]);
    expect(diagram.connections).toEqual([]);
    expect(diagram.contingencies).toEqual([]);
  });
});

describe("findElementById", () => {
  it("finds existing element", () => {
    const items = [
      { id: "a", name: "first" },
      { id: "b", name: "second" },
    ];
    expect(findElementById(items, "b")).toEqual({ id: "b", name: "second" });
  });

  it("returns undefined for missing element", () => {
    const items = [{ id: "a", name: "first" }];
    expect(findElementById(items, "z")).toBeUndefined();
  });

  it("returns undefined for empty array", () => {
    expect(findElementById([], "a")).toBeUndefined();
  });
});

describe("getStimulusNotation", () => {
  const cases: Array<[Stimulus["function"], string]> = [
    ["discriminative", "SD"],
    ["delta", "SΔ"],
    ["reinforcer_positive", "SR+"],
    ["reinforcer_negative", "SR−"],
    ["punisher_positive", "SP+"],
    ["punisher_negative", "SP−"],
    ["establishing_operation", "SEO"],
    ["abolishing_operation", "SAO"],
    ["conditioned", "SC"],
    ["unconditioned", "SUC"],
    ["neutral", "S"],
  ];

  for (const [fn, expected] of cases) {
    it(`returns "${expected}" for ${fn}`, () => {
      const stimulus: Stimulus = {
        id: "test",
        function: fn,
        label: "Test",
        conditioned: false,
      };
      expect(getStimulusNotation(stimulus)).toBe(expected);
    });
  }
});

describe("getScheduleNotation", () => {
  it("returns CRF for continuous reinforcement", () => {
    const schedule: Schedule = { id: "s1", type: "CRF" };
    expect(getScheduleNotation(schedule)).toBe("CRF");
  });

  it("returns EXT for extinction", () => {
    const schedule: Schedule = { id: "s1", type: "EXT" };
    expect(getScheduleNotation(schedule)).toBe("EXT");
  });

  it("returns FR5 for fixed ratio 5", () => {
    const schedule: Schedule = { id: "s1", type: "FR", value: 5 };
    expect(getScheduleNotation(schedule)).toBe("FR5");
  });

  it("returns VI30 for variable interval 30", () => {
    const schedule: Schedule = { id: "s1", type: "VI", value: 30 };
    expect(getScheduleNotation(schedule)).toBe("VI30");
  });

  it("returns FR without value when none provided", () => {
    const schedule: Schedule = { id: "s1", type: "FR" };
    expect(getScheduleNotation(schedule)).toBe("FR");
  });
});

describe("getConnectionsForElement", () => {
  it("finds connections where element is source", () => {
    const diagram: MechnerDiagram = {
      ...createEmptyDiagram(),
      connections: [
        { id: "c1", type: "produces", sourceId: "r1", targetId: "s1" },
        { id: "c2", type: "occasions", sourceId: "s2", targetId: "r1" },
        { id: "c3", type: "produces", sourceId: "r2", targetId: "s3" },
      ],
    };
    const conns = getConnectionsForElement(diagram, "r1");
    expect(conns).toHaveLength(2);
    expect(conns.map((c) => c.id).sort()).toEqual(["c1", "c2"]);
  });

  it("returns empty array when no connections match", () => {
    const diagram: MechnerDiagram = {
      ...createEmptyDiagram(),
      connections: [
        { id: "c1", type: "produces", sourceId: "r1", targetId: "s1" },
      ],
    };
    expect(getConnectionsForElement(diagram, "unknown")).toEqual([]);
  });
});
