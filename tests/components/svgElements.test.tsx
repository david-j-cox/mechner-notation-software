import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { StimulusNode } from "@/components/diagram/elements/StimulusNode";
import { ResponseNode } from "@/components/diagram/elements/ResponseNode";
import { ArrowConnector } from "@/components/diagram/elements/ArrowConnector";
import type { Stimulus, Response } from "@/model/types";
import type { PositionedConnection } from "@/components/diagram/layout/ContingencyLayout";

function renderSVG(children: React.ReactNode) {
  return render(<svg>{children}</svg>);
}

describe("StimulusNode", () => {
  const baseStimulus: Stimulus = {
    id: "stim_1",
    function: "discriminative",
    label: "Red light",
    conditioned: true,
  };

  it("renders S text", () => {
    const { container } = renderSVG(
      <StimulusNode stimulus={baseStimulus} x={0} y={0} width={80} height={50} />
    );
    const texts = container.querySelectorAll("text");
    const sText = Array.from(texts).find((t) => t.textContent === "S");
    expect(sText).toBeTruthy();
  });

  it("renders superscript D for discriminative", () => {
    const { container } = renderSVG(
      <StimulusNode stimulus={baseStimulus} x={0} y={0} width={80} height={50} />
    );
    const texts = container.querySelectorAll("text");
    const supText = Array.from(texts).find((t) => t.textContent === "D");
    expect(supText).toBeTruthy();
  });

  it("renders superscript R+ for positive reinforcer", () => {
    const stim: Stimulus = { ...baseStimulus, function: "reinforcer_positive" };
    const { container } = renderSVG(
      <StimulusNode stimulus={stim} x={0} y={0} width={80} height={50} />
    );
    const texts = container.querySelectorAll("text");
    const supText = Array.from(texts).find((t) => t.textContent === "R+");
    expect(supText).toBeTruthy();
  });

  it("renders no superscript for neutral", () => {
    const stim: Stimulus = { ...baseStimulus, function: "neutral" };
    const { container } = renderSVG(
      <StimulusNode stimulus={stim} x={0} y={0} width={80} height={50} />
    );
    const texts = container.querySelectorAll("text");
    // Should have the main "S" text + subscript label, but no superscript
    expect(texts).toHaveLength(2); // S + label
    expect(texts[0].textContent).toBe("S");
    // No superscript element (superscript would be a 3rd text)
    const supTexts = Array.from(texts).filter(
      (t) => t.textContent !== "S" && t.textContent !== stim.label
    );
    expect(supTexts).toHaveLength(0);
  });

  it("renders tooltip with label", () => {
    const { container } = renderSVG(
      <StimulusNode stimulus={baseStimulus} x={0} y={0} width={80} height={50} />
    );
    const title = container.querySelector("title");
    expect(title?.textContent).toBe("Red light");
  });

  it("applies selected styling", () => {
    const { container } = renderSVG(
      <StimulusNode stimulus={baseStimulus} x={0} y={0} width={80} height={50} selected />
    );
    const rect = container.querySelector("rect");
    expect(rect?.getAttribute("fill")).toBe("#dbeafe");
    expect(rect?.getAttribute("stroke")).toBe("#3b82f6");
  });

  it("calls onClick with stimulus id", () => {
    const onClick = vi.fn();
    const { container } = renderSVG(
      <StimulusNode
        stimulus={baseStimulus}
        x={0} y={0} width={80} height={50}
        onClick={onClick}
      />
    );
    const g = container.querySelector("g")!;
    fireEvent.click(g);
    expect(onClick).toHaveBeenCalledWith("stim_1");
  });

  it("renders all superscript types correctly", () => {
    const superscriptMap: Record<string, string> = {
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
    };

    for (const [fn, expected] of Object.entries(superscriptMap)) {
      const stim: Stimulus = {
        ...baseStimulus,
        function: fn as Stimulus["function"],
      };
      const { container } = renderSVG(
        <StimulusNode stimulus={stim} x={0} y={0} width={80} height={50} />
      );
      const texts = container.querySelectorAll("text");
      const supText = Array.from(texts).find((t) => t.textContent === expected);
      expect(supText, `Expected superscript "${expected}" for ${fn}`).toBeTruthy();
    }
  });
});

describe("ResponseNode", () => {
  const baseResponse: Response = {
    id: "resp_1",
    label: "Lever press",
  };

  it("renders R text", () => {
    const { container } = renderSVG(
      <ResponseNode response={baseResponse} x={0} y={0} width={80} height={50} />
    );
    const texts = container.querySelectorAll("text");
    const rText = Array.from(texts).find((t) => t.textContent === "R");
    expect(rText).toBeTruthy();
  });

  it("renders tooltip with label", () => {
    const { container } = renderSVG(
      <ResponseNode response={baseResponse} x={0} y={0} width={80} height={50} />
    );
    const title = container.querySelector("title");
    expect(title?.textContent).toBe("Lever press");
  });

  it("applies selected styling", () => {
    const { container } = renderSVG(
      <ResponseNode response={baseResponse} x={0} y={0} width={80} height={50} selected />
    );
    const rect = container.querySelector("rect");
    expect(rect?.getAttribute("fill")).toBe("#dcfce7");
  });
});

describe("ArrowConnector", () => {
  const baseConnection: PositionedConnection = {
    id: "conn_1",
    sourceId: "a",
    targetId: "b",
    x1: 100,
    y1: 50,
    x2: 200,
    y2: 50,
    negated: false,
  };

  it("renders a line between source and target", () => {
    const { container } = renderSVG(
      <ArrowConnector connection={baseConnection} />
    );
    const line = container.querySelector("line");
    expect(line?.getAttribute("x1")).toBe("100");
    expect(line?.getAttribute("y1")).toBe("50");
    expect(line?.getAttribute("x2")).toBe("200");
    expect(line?.getAttribute("y2")).toBe("50");
  });

  it("has arrow marker", () => {
    const { container } = renderSVG(
      <ArrowConnector connection={baseConnection} />
    );
    const marker = container.querySelector("marker");
    expect(marker).toBeTruthy();
    expect(marker?.querySelector("polygon")).toBeTruthy();
  });

  it("shows negation mark when negated", () => {
    const negatedConn = { ...baseConnection, negated: true };
    const { container } = renderSVG(
      <ArrowConnector connection={negatedConn} />
    );
    const texts = container.querySelectorAll("text");
    const tilde = Array.from(texts).find((t) => t.textContent === "~");
    expect(tilde).toBeTruthy();
  });

  it("does not show negation mark when not negated", () => {
    const { container } = renderSVG(
      <ArrowConnector connection={baseConnection} />
    );
    const texts = container.querySelectorAll("text");
    expect(texts).toHaveLength(0);
  });
});
