import { describe, it, expect, beforeEach } from "vitest";
import { processToolCall } from "@/ai/parseToolOutput";
import { resetIdCounter } from "@/model/contingency";

beforeEach(() => {
  resetIdCounter();
});

describe("processToolCall", () => {
  describe("add_agent", () => {
    it("processes valid agent", () => {
      const result = processToolCall("add_agent", {
        label: "Rat",
        shortLabel: "R",
      });
      expect(result.error).toBeUndefined();
      expect(result.mutation).not.toBeNull();
      expect(result.mutation!.type).toBe("add");
      expect(result.mutation!.elementType).toBe("agent");
      expect(result.mutation!.id).toMatch(/^agent_/);
      expect(result.mutation!.data).toMatchObject({
        label: "Rat",
        shortLabel: "R",
      });

      const toolResult = JSON.parse(result.toolResult);
      expect(toolResult.success).toBe(true);
      expect(toolResult.id).toBe(result.mutation!.id);
    });

    it("rejects invalid agent (missing label)", () => {
      const result = processToolCall("add_agent", { shortLabel: "R" });
      expect(result.mutation).toBeNull();
      expect(result.error).toBeDefined();

      const toolResult = JSON.parse(result.toolResult);
      expect(toolResult.error).toBeDefined();
    });
  });

  describe("add_stimulus", () => {
    it("processes valid stimulus", () => {
      const result = processToolCall("add_stimulus", {
        function: "reinforcer_positive",
        label: "Food pellet",
        conditioned: false,
      });
      expect(result.mutation).not.toBeNull();
      expect(result.mutation!.elementType).toBe("stimulus");
      expect(result.mutation!.id).toMatch(/^stim_/);
      expect(result.mutation!.data).toMatchObject({
        function: "reinforcer_positive",
        label: "Food pellet",
        conditioned: false,
      });
    });

    it("rejects invalid stimulus function", () => {
      const result = processToolCall("add_stimulus", {
        function: "magical",
        label: "Wand",
        conditioned: false,
      });
      expect(result.mutation).toBeNull();
      expect(result.error).toBeDefined();
    });

    it("rejects missing conditioned field", () => {
      const result = processToolCall("add_stimulus", {
        function: "discriminative",
        label: "Light",
      });
      expect(result.mutation).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe("add_response", () => {
    it("processes valid response", () => {
      const result = processToolCall("add_response", {
        label: "Lever press",
      });
      expect(result.mutation).not.toBeNull();
      expect(result.mutation!.elementType).toBe("response");
      expect(result.mutation!.id).toMatch(/^resp_/);
    });

    it("processes response with optional fields", () => {
      const result = processToolCall("add_response", {
        label: "Lever press",
        agentId: "agent_1",
        responseClass: "operant",
      });
      expect(result.mutation!.data).toMatchObject({
        agentId: "agent_1",
        responseClass: "operant",
      });
    });

    it("rejects empty label", () => {
      const result = processToolCall("add_response", { label: "" });
      expect(result.mutation).toBeNull();
    });
  });

  describe("add_schedule", () => {
    it("processes CRF schedule", () => {
      const result = processToolCall("add_schedule", { type: "CRF" });
      expect(result.mutation).not.toBeNull();
      expect(result.mutation!.elementType).toBe("schedule");
      expect(result.mutation!.id).toMatch(/^sched_/);
    });

    it("processes FR schedule with value", () => {
      const result = processToolCall("add_schedule", {
        type: "FR",
        value: 5,
      });
      expect(result.mutation!.data).toMatchObject({ type: "FR", value: 5 });
    });

    it("rejects invalid schedule type", () => {
      const result = processToolCall("add_schedule", { type: "INVALID" });
      expect(result.mutation).toBeNull();
    });
  });

  describe("add_connection", () => {
    it("processes valid connection", () => {
      const result = processToolCall("add_connection", {
        type: "produces",
        sourceId: "resp_1",
        targetId: "stim_1",
      });
      expect(result.mutation).not.toBeNull();
      expect(result.mutation!.elementType).toBe("connection");
      expect(result.mutation!.id).toMatch(/^conn_/);
    });

    it("processes connection with optional fields", () => {
      const result = processToolCall("add_connection", {
        type: "produces",
        sourceId: "resp_1",
        targetId: "stim_1",
        scheduleId: "sched_1",
        negated: true,
      });
      expect(result.mutation!.data).toMatchObject({
        scheduleId: "sched_1",
        negated: true,
      });
    });
  });

  describe("add_contingency", () => {
    it("processes valid contingency", () => {
      const result = processToolCall("add_contingency", {
        antecedents: ["stim_1"],
        behavior: "resp_1",
        consequences: ["stim_2"],
        connections: ["conn_1", "conn_2"],
      });
      expect(result.mutation).not.toBeNull();
      expect(result.mutation!.elementType).toBe("contingency");
      expect(result.mutation!.id).toMatch(/^cont_/);
    });

    it("processes contingency with label", () => {
      const result = processToolCall("add_contingency", {
        label: "Positive reinforcement",
        antecedents: [],
        behavior: "resp_1",
        consequences: [],
        connections: [],
      });
      expect(result.mutation!.data).toMatchObject({
        label: "Positive reinforcement",
      });
    });
  });

  describe("update_element", () => {
    it("processes valid update", () => {
      const result = processToolCall("update_element", {
        elementType: "stimulus",
        id: "stim_1",
        updates: { label: "Bright light" },
      });
      expect(result.mutation).not.toBeNull();
      expect(result.mutation!.type).toBe("update");
      expect(result.mutation!.elementType).toBe("stimulus");
      expect(result.mutation!.id).toBe("stim_1");
      expect(result.mutation!.data).toEqual({ label: "Bright light" });
    });

    it("rejects invalid element type", () => {
      const result = processToolCall("update_element", {
        elementType: "widget",
        id: "w_1",
        updates: {},
      });
      expect(result.mutation).toBeNull();
    });
  });

  describe("remove_element", () => {
    it("processes valid removal", () => {
      const result = processToolCall("remove_element", {
        elementType: "connection",
        id: "conn_1",
      });
      expect(result.mutation).not.toBeNull();
      expect(result.mutation!.type).toBe("remove");
      expect(result.mutation!.elementType).toBe("connection");
      expect(result.mutation!.id).toBe("conn_1");
    });
  });

  describe("unknown tool", () => {
    it("returns error for unknown tool name", () => {
      const result = processToolCall("do_magic", { spell: "abracadabra" });
      expect(result.mutation).toBeNull();
      expect(result.error).toContain("Unknown tool");
    });
  });

  describe("ID uniqueness across tool calls", () => {
    it("generates unique IDs for same element type", () => {
      const r1 = processToolCall("add_response", { label: "Press" });
      const r2 = processToolCall("add_response", { label: "Pull" });
      expect(r1.mutation!.id).not.toBe(r2.mutation!.id);
    });

    it("returns generated ID in tool result", () => {
      const result = processToolCall("add_stimulus", {
        function: "discriminative",
        label: "Light",
        conditioned: true,
      });
      const toolResult = JSON.parse(result.toolResult);
      expect(toolResult.id).toBe(result.mutation!.id);
    });
  });
});
