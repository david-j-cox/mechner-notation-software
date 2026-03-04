import { describe, it, expect } from "vitest";
import { computeLayout } from "@/components/diagram/layout/ContingencyLayout";
import { createEmptyDiagram } from "@/model/contingency";
import type { MechnerDiagram } from "@/model/types";

function makeDiagram(overrides: Partial<MechnerDiagram> = {}): MechnerDiagram {
  return { ...createEmptyDiagram(), ...overrides };
}

describe("computeLayout", () => {
  it("returns empty layout for empty diagram", () => {
    const layout = computeLayout(makeDiagram());
    expect(layout.contingencies).toEqual([]);
    expect(layout.width).toBeGreaterThan(0);
    expect(layout.height).toBeGreaterThan(0);
  });

  it("positions a single three-term contingency", () => {
    const diagram = makeDiagram({
      stimuli: [
        { id: "sd", function: "discriminative", label: "Light", conditioned: true },
        { id: "sr", function: "reinforcer_positive", label: "Food", conditioned: false },
      ],
      responses: [
        { id: "r1", label: "Lever press" },
      ],
      connections: [
        { id: "c1", type: "occasions", sourceId: "sd", targetId: "r1" },
        { id: "c2", type: "produces", sourceId: "r1", targetId: "sr" },
      ],
      contingencies: [
        {
          id: "cont1",
          antecedents: ["sd"],
          behavior: "r1",
          consequences: ["sr"],
          connections: ["c1", "c2"],
        },
      ],
    });

    const layout = computeLayout(diagram);
    expect(layout.contingencies).toHaveLength(1);

    const cont = layout.contingencies[0];
    expect(cont.elements).toHaveLength(3); // SD, R, SR+
    expect(cont.connections).toHaveLength(2);
  });

  it("positions elements in correct columns (left-to-right temporal flow)", () => {
    const diagram = makeDiagram({
      stimuli: [
        { id: "sd", function: "discriminative", label: "Light", conditioned: true },
        { id: "sr", function: "reinforcer_positive", label: "Food", conditioned: false },
      ],
      responses: [
        { id: "r1", label: "Press" },
      ],
      connections: [
        { id: "c1", type: "occasions", sourceId: "sd", targetId: "r1" },
        { id: "c2", type: "produces", sourceId: "r1", targetId: "sr" },
      ],
      contingencies: [
        {
          id: "cont1",
          antecedents: ["sd"],
          behavior: "r1",
          consequences: ["sr"],
          connections: ["c1", "c2"],
        },
      ],
    });

    const layout = computeLayout(diagram);
    const elements = layout.contingencies[0].elements;

    const sd = elements.find((e) => e.id === "sd")!;
    const r1 = elements.find((e) => e.id === "r1")!;
    const sr = elements.find((e) => e.id === "sr")!;

    // Antecedent (col 1) < Behavior (col 2) < Consequence (col 3)
    expect(sd.x).toBeLessThan(r1.x);
    expect(r1.x).toBeLessThan(sr.x);
  });

  it("places MO stimuli in leftmost column", () => {
    const diagram = makeDiagram({
      stimuli: [
        { id: "eo", function: "establishing_operation", label: "Hunger", conditioned: false },
        { id: "sd", function: "discriminative", label: "Light", conditioned: true },
      ],
      responses: [
        { id: "r1", label: "Press" },
      ],
      connections: [],
      contingencies: [
        {
          id: "cont1",
          antecedents: ["eo", "sd"],
          behavior: "r1",
          consequences: [],
          connections: [],
        },
      ],
    });

    const layout = computeLayout(diagram);
    const elements = layout.contingencies[0].elements;

    const eo = elements.find((e) => e.id === "eo")!;
    const sd = elements.find((e) => e.id === "sd")!;

    // EO (col 0) < SD (col 1)
    expect(eo.x).toBeLessThan(sd.x);
  });

  it("no elements overlap within a contingency", () => {
    const diagram = makeDiagram({
      stimuli: [
        { id: "sd1", function: "discriminative", label: "Light 1", conditioned: true },
        { id: "sd2", function: "discriminative", label: "Light 2", conditioned: true },
        { id: "sr1", function: "reinforcer_positive", label: "Food", conditioned: false },
        { id: "sr2", function: "punisher_positive", label: "Shock", conditioned: false },
      ],
      responses: [
        { id: "r1", label: "Press" },
      ],
      connections: [],
      contingencies: [
        {
          id: "cont1",
          antecedents: ["sd1", "sd2"],
          behavior: "r1",
          consequences: ["sr1", "sr2"],
          connections: [],
        },
      ],
    });

    const layout = computeLayout(diagram);
    const elements = layout.contingencies[0].elements;

    // Check no pair of elements overlaps
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const a = elements[i];
        const b = elements[j];
        const xOverlap = a.x < b.x + b.width && a.x + a.width > b.x;
        const yOverlap = a.y < b.y + b.height && a.y + a.height > b.y;
        expect(
          xOverlap && yOverlap,
          `Elements ${a.id} and ${b.id} overlap`
        ).toBe(false);
      }
    }
  });

  it("connections use right edge for source and left edge for target", () => {
    const diagram = makeDiagram({
      stimuli: [
        { id: "sd", function: "discriminative", label: "Light", conditioned: true },
        { id: "sr", function: "reinforcer_positive", label: "Food", conditioned: false },
      ],
      responses: [
        { id: "r1", label: "Press" },
      ],
      connections: [
        { id: "c1", type: "occasions", sourceId: "sd", targetId: "r1" },
        { id: "c2", type: "produces", sourceId: "r1", targetId: "sr" },
      ],
      contingencies: [
        {
          id: "cont1",
          antecedents: ["sd"],
          behavior: "r1",
          consequences: ["sr"],
          connections: ["c1", "c2"],
        },
      ],
    });

    const layout = computeLayout(diagram);
    const cont = layout.contingencies[0];
    const elements = cont.elements;

    const sd = elements.find((e) => e.id === "sd")!;
    const r1 = elements.find((e) => e.id === "r1")!;
    const sr = elements.find((e) => e.id === "sr")!;

    // c1: SD → R — source at SD right edge, target at R left edge
    const c1 = cont.connections.find((c) => c.id === "c1")!;
    expect(c1.x1).toBe(sd.x + sd.width); // SD right edge
    expect(c1.x2).toBe(r1.x);            // R left edge

    // c2: R → SR+ — source at R right edge, target at SR+ left edge
    const c2 = cont.connections.find((c) => c.id === "c2")!;
    expect(c2.x1).toBe(r1.x + r1.width); // R right edge
    expect(c2.x2).toBe(sr.x);            // SR+ left edge
  });

  it("arrows point left-to-right (x1 < x2) for standard flow", () => {
    const diagram = makeDiagram({
      stimuli: [
        { id: "sd", function: "discriminative", label: "Light", conditioned: true },
        { id: "sr", function: "reinforcer_positive", label: "Food", conditioned: false },
      ],
      responses: [
        { id: "r1", label: "Press" },
      ],
      connections: [
        { id: "c1", type: "occasions", sourceId: "sd", targetId: "r1" },
        { id: "c2", type: "produces", sourceId: "r1", targetId: "sr" },
      ],
      contingencies: [
        {
          id: "cont1",
          antecedents: ["sd"],
          behavior: "r1",
          consequences: ["sr"],
          connections: ["c1", "c2"],
        },
      ],
    });

    const layout = computeLayout(diagram);
    for (const conn of layout.contingencies[0].connections) {
      expect(conn.x1).toBeLessThan(conn.x2);
    }
  });

  it("multiple contingencies stack vertically without overlap", () => {
    const diagram = makeDiagram({
      stimuli: [
        { id: "sd1", function: "discriminative", label: "Light 1", conditioned: true },
        { id: "sr1", function: "reinforcer_positive", label: "Food", conditioned: false },
        { id: "sd2", function: "discriminative", label: "Light 2", conditioned: true },
        { id: "sr2", function: "punisher_positive", label: "Shock", conditioned: false },
      ],
      responses: [
        { id: "r1", label: "Press" },
        { id: "r2", label: "Avoid" },
      ],
      connections: [],
      contingencies: [
        {
          id: "cont1",
          antecedents: ["sd1"],
          behavior: "r1",
          consequences: ["sr1"],
          connections: [],
        },
        {
          id: "cont2",
          antecedents: ["sd2"],
          behavior: "r2",
          consequences: ["sr2"],
          connections: [],
        },
      ],
    });

    const layout = computeLayout(diagram);
    expect(layout.contingencies).toHaveLength(2);

    const cont1 = layout.contingencies[0];
    const cont2 = layout.contingencies[1];

    // Second contingency should be below the first
    expect(cont2.y).toBeGreaterThan(cont1.y);

    // No element in cont2 overlaps with any element in cont1
    for (const a of cont1.elements) {
      for (const b of cont2.elements) {
        const yOverlap = a.y < b.y + b.height && a.y + a.height > b.y;
        expect(yOverlap, `Elements ${a.id} and ${b.id} overlap vertically`).toBe(false);
      }
    }
  });

  it("handles missing elements gracefully", () => {
    const diagram = makeDiagram({
      contingencies: [
        {
          id: "cont1",
          antecedents: ["nonexistent_stim"],
          behavior: "nonexistent_resp",
          consequences: ["nonexistent_stim2"],
          connections: ["nonexistent_conn"],
        },
      ],
    });

    // Should not throw
    const layout = computeLayout(diagram);
    expect(layout.contingencies).toHaveLength(1);
    expect(layout.contingencies[0].elements).toHaveLength(0);
    expect(layout.contingencies[0].connections).toHaveLength(0);
  });
});
