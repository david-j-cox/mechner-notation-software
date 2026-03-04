import { describe, it, expect, beforeEach } from "vitest";
import { useDiagramStore } from "@/hooks/useDiagram";

beforeEach(() => {
  useDiagramStore.getState().resetDiagram();
});

describe("DiagramStore", () => {
  describe("addAgent", () => {
    it("adds agent and returns id", () => {
      const id = useDiagramStore.getState().addAgent({
        label: "Rat",
        shortLabel: "R",
      });
      expect(id).toMatch(/^agent_/);
      const agents = useDiagramStore.getState().diagram.agents;
      expect(agents).toHaveLength(1);
      expect(agents[0]).toEqual({ id, label: "Rat", shortLabel: "R" });
    });

    it("adds multiple agents", () => {
      useDiagramStore.getState().addAgent({ label: "Rat", shortLabel: "R" });
      useDiagramStore.getState().addAgent({ label: "Pigeon", shortLabel: "P" });
      expect(useDiagramStore.getState().diagram.agents).toHaveLength(2);
    });
  });

  describe("addStimulus", () => {
    it("adds stimulus and returns id", () => {
      const id = useDiagramStore.getState().addStimulus({
        function: "discriminative",
        label: "Red light",
        conditioned: true,
      });
      expect(id).toMatch(/^stim_/);
      const stimuli = useDiagramStore.getState().diagram.stimuli;
      expect(stimuli).toHaveLength(1);
      expect(stimuli[0].function).toBe("discriminative");
      expect(stimuli[0].label).toBe("Red light");
    });
  });

  describe("addResponse", () => {
    it("adds response and returns id", () => {
      const id = useDiagramStore.getState().addResponse({
        label: "Lever press",
      });
      expect(id).toMatch(/^resp_/);
      expect(useDiagramStore.getState().diagram.responses).toHaveLength(1);
    });
  });

  describe("addSchedule", () => {
    it("adds schedule and returns id", () => {
      const id = useDiagramStore.getState().addSchedule({
        type: "FR",
        value: 5,
      });
      expect(id).toMatch(/^sched_/);
      const schedules = useDiagramStore.getState().diagram.schedules;
      expect(schedules).toHaveLength(1);
      expect(schedules[0].type).toBe("FR");
      expect(schedules[0].value).toBe(5);
    });
  });

  describe("addConnection", () => {
    it("adds connection and returns id", () => {
      const id = useDiagramStore.getState().addConnection({
        type: "produces",
        sourceId: "resp_1",
        targetId: "stim_1",
      });
      expect(id).toMatch(/^conn_/);
      expect(useDiagramStore.getState().diagram.connections).toHaveLength(1);
    });
  });

  describe("addContingency", () => {
    it("adds contingency and returns id", () => {
      const id = useDiagramStore.getState().addContingency({
        antecedents: ["stim_1"],
        behavior: "resp_1",
        consequences: ["stim_2"],
        connections: ["conn_1"],
      });
      expect(id).toMatch(/^cont_/);
      const contingencies = useDiagramStore.getState().diagram.contingencies;
      expect(contingencies).toHaveLength(1);
      expect(contingencies[0].behavior).toBe("resp_1");
    });
  });

  describe("addElementWithId", () => {
    it("adds element with pre-assigned id", () => {
      useDiagramStore.getState().addElementWithId("agent", {
        id: "server_agent_1",
        label: "Student",
        shortLabel: "S",
      });
      const agents = useDiagramStore.getState().diagram.agents;
      expect(agents).toHaveLength(1);
      expect(agents[0].id).toBe("server_agent_1");
    });

    it("ignores unknown element type", () => {
      useDiagramStore.getState().addElementWithId("widget", { id: "w1" });
      const diagram = useDiagramStore.getState().diagram;
      expect(diagram.agents).toHaveLength(0);
      expect(diagram.stimuli).toHaveLength(0);
    });

    it("adds stimulus with pre-assigned id", () => {
      useDiagramStore.getState().addElementWithId("stimulus", {
        id: "server_stim_1",
        function: "reinforcer_positive",
        label: "Food",
        conditioned: false,
      });
      const stimuli = useDiagramStore.getState().diagram.stimuli;
      expect(stimuli).toHaveLength(1);
      expect(stimuli[0].id).toBe("server_stim_1");
    });
  });

  describe("updateElement", () => {
    it("updates existing element", () => {
      const id = useDiagramStore.getState().addAgent({
        label: "Rat",
        shortLabel: "R",
      });
      useDiagramStore.getState().updateElement("agent", id, { label: "Mouse" });
      const agent = useDiagramStore.getState().diagram.agents[0];
      expect(agent.label).toBe("Mouse");
      expect(agent.shortLabel).toBe("R"); // unchanged
      expect(agent.id).toBe(id); // id preserved
    });

    it("does nothing for non-existent id", () => {
      useDiagramStore.getState().addAgent({ label: "Rat", shortLabel: "R" });
      useDiagramStore.getState().updateElement("agent", "fake_id", { label: "Ghost" });
      expect(useDiagramStore.getState().diagram.agents[0].label).toBe("Rat");
    });

    it("does nothing for unknown element type", () => {
      useDiagramStore.getState().addAgent({ label: "Rat", shortLabel: "R" });
      useDiagramStore.getState().updateElement("widget", "any", { label: "X" });
      expect(useDiagramStore.getState().diagram.agents[0].label).toBe("Rat");
    });

    it("preserves id even if updates try to change it", () => {
      const id = useDiagramStore.getState().addAgent({
        label: "Rat",
        shortLabel: "R",
      });
      useDiagramStore.getState().updateElement("agent", id, { id: "hacked" });
      expect(useDiagramStore.getState().diagram.agents[0].id).toBe(id);
    });
  });

  describe("removeElement", () => {
    it("removes existing element", () => {
      const id = useDiagramStore.getState().addAgent({
        label: "Rat",
        shortLabel: "R",
      });
      useDiagramStore.getState().removeElement("agent", id);
      expect(useDiagramStore.getState().diagram.agents).toHaveLength(0);
    });

    it("does nothing for non-existent id", () => {
      useDiagramStore.getState().addAgent({ label: "Rat", shortLabel: "R" });
      useDiagramStore.getState().removeElement("agent", "fake_id");
      expect(useDiagramStore.getState().diagram.agents).toHaveLength(1);
    });

    it("does nothing for unknown element type", () => {
      useDiagramStore.getState().addAgent({ label: "Rat", shortLabel: "R" });
      useDiagramStore.getState().removeElement("widget", "any");
      expect(useDiagramStore.getState().diagram.agents).toHaveLength(1);
    });

    it("removes only the targeted element", () => {
      const id1 = useDiagramStore.getState().addAgent({ label: "Rat", shortLabel: "R" });
      const id2 = useDiagramStore.getState().addAgent({ label: "Pigeon", shortLabel: "P" });
      useDiagramStore.getState().removeElement("agent", id1);
      const agents = useDiagramStore.getState().diagram.agents;
      expect(agents).toHaveLength(1);
      expect(agents[0].id).toBe(id2);
    });
  });

  describe("resetDiagram", () => {
    it("clears all elements", () => {
      useDiagramStore.getState().addAgent({ label: "Rat", shortLabel: "R" });
      useDiagramStore.getState().addStimulus({ function: "discriminative", label: "Light", conditioned: true });
      useDiagramStore.getState().addResponse({ label: "Press" });
      useDiagramStore.getState().resetDiagram();
      const d = useDiagramStore.getState().diagram;
      expect(d.agents).toHaveLength(0);
      expect(d.stimuli).toHaveLength(0);
      expect(d.responses).toHaveLength(0);
    });
  });
});

describe("Full contingency integration", () => {
  it("builds a complete three-term contingency", () => {
    const store = useDiagramStore.getState();

    const stimDId = store.addStimulus({
      function: "discriminative",
      label: "Light on",
      conditioned: true,
    });

    const respId = store.addResponse({
      label: "Lever press",
    });

    const stimRId = store.addStimulus({
      function: "reinforcer_positive",
      label: "Food pellet",
      conditioned: false,
    });

    const conn1Id = store.addConnection({
      type: "occasions",
      sourceId: stimDId,
      targetId: respId,
    });

    const conn2Id = store.addConnection({
      type: "produces",
      sourceId: respId,
      targetId: stimRId,
    });

    const contId = store.addContingency({
      label: "Positive reinforcement",
      antecedents: [stimDId],
      behavior: respId,
      consequences: [stimRId],
      connections: [conn1Id, conn2Id],
    });

    const diagram = useDiagramStore.getState().diagram;
    expect(diagram.stimuli).toHaveLength(2);
    expect(diagram.responses).toHaveLength(1);
    expect(diagram.connections).toHaveLength(2);
    expect(diagram.contingencies).toHaveLength(1);

    const cont = diagram.contingencies[0];
    expect(cont.antecedents).toContain(stimDId);
    expect(cont.behavior).toBe(respId);
    expect(cont.consequences).toContain(stimRId);
    expect(cont.connections).toEqual([conn1Id, conn2Id]);
  });
});
