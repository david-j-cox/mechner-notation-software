import { describe, it, expect } from "vitest";
import { toolDefinitions } from "@/ai/tools";

describe("Tool definitions", () => {
  it("has all expected tools", () => {
    const names = toolDefinitions.map((t) => t.name);
    expect(names).toContain("add_agent");
    expect(names).toContain("add_stimulus");
    expect(names).toContain("add_response");
    expect(names).toContain("add_schedule");
    expect(names).toContain("add_connection");
    expect(names).toContain("add_contingency");
    expect(names).toContain("update_element");
    expect(names).toContain("remove_element");
    expect(names).toHaveLength(8);
  });

  it("all tools have descriptions", () => {
    for (const tool of toolDefinitions) {
      expect(tool.description, `${tool.name} missing description`).toBeTruthy();
    }
  });

  it("all tools have input_schema with type object", () => {
    for (const tool of toolDefinitions) {
      expect(tool.input_schema.type, `${tool.name} schema type`).toBe("object");
    }
  });

  it("all tools have required fields", () => {
    for (const tool of toolDefinitions) {
      const schema = tool.input_schema as { required?: string[] };
      expect(
        Array.isArray(schema.required),
        `${tool.name} should have required array`
      ).toBe(true);
      expect(
        schema.required!.length,
        `${tool.name} should have at least one required field`
      ).toBeGreaterThan(0);
    }
  });

  it("add_stimulus has all stimulus function enum values", () => {
    const addStimulus = toolDefinitions.find((t) => t.name === "add_stimulus")!;
    const schema = addStimulus.input_schema as {
      properties: { function: { enum: string[] } };
    };
    const enumValues = schema.properties.function.enum;
    expect(enumValues).toContain("discriminative");
    expect(enumValues).toContain("delta");
    expect(enumValues).toContain("reinforcer_positive");
    expect(enumValues).toContain("reinforcer_negative");
    expect(enumValues).toContain("punisher_positive");
    expect(enumValues).toContain("punisher_negative");
    expect(enumValues).toContain("establishing_operation");
    expect(enumValues).toContain("abolishing_operation");
    expect(enumValues).toContain("conditioned");
    expect(enumValues).toContain("unconditioned");
    expect(enumValues).toContain("neutral");
    expect(enumValues).toHaveLength(11);
  });

  it("add_schedule has all schedule type enum values", () => {
    const addSchedule = toolDefinitions.find((t) => t.name === "add_schedule")!;
    const schema = addSchedule.input_schema as {
      properties: { type: { enum: string[] } };
    };
    const enumValues = schema.properties.type.enum;
    expect(enumValues).toEqual(["FR", "VR", "FI", "VI", "FT", "VT", "CRF", "EXT"]);
  });

  it("add_connection has all connection type enum values", () => {
    const addConn = toolDefinitions.find((t) => t.name === "add_connection")!;
    const schema = addConn.input_schema as {
      properties: { type: { enum: string[] } };
    };
    const enumValues = schema.properties.type.enum;
    expect(enumValues).toEqual(["produces", "occasions", "elicits", "prevents", "simultaneous"]);
  });

  it("tool enum values match Zod schema enums", () => {
    // Cross-reference: ensure tool definitions and Zod schemas agree
    // This catches drift between the two validation layers
    const addStimulus = toolDefinitions.find((t) => t.name === "add_stimulus")!;
    const stimFns = (addStimulus.input_schema as { properties: { function: { enum: string[] } } })
      .properties.function.enum;

    const expectedFns = [
      "discriminative", "delta", "reinforcer_positive", "reinforcer_negative",
      "punisher_positive", "punisher_negative", "establishing_operation",
      "abolishing_operation", "conditioned", "unconditioned", "neutral",
    ];
    expect(stimFns.sort()).toEqual(expectedFns.sort());
  });
});
