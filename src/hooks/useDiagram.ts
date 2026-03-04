import { create } from "zustand";
import type {
  MechnerDiagram,
  Agent,
  Stimulus,
  Response,
  Schedule,
  Connection,
  Contingency,
} from "@/model/types";
import { createEmptyDiagram, generateId } from "@/model/contingency";

type CollectionKey = "agents" | "stimuli" | "responses" | "schedules" | "connections" | "contingencies";

const ELEMENT_TYPE_TO_KEY: Record<string, CollectionKey | undefined> = {
  agent: "agents",
  stimulus: "stimuli",
  response: "responses",
  schedule: "schedules",
  connection: "connections",
  contingency: "contingencies",
};

function getCollection(diagram: MechnerDiagram, key: CollectionKey): Array<{ id: string }> {
  return diagram[key];
}

interface DiagramStore {
  diagram: MechnerDiagram;

  // Add operations — return generated ID
  addAgent: (agent: Omit<Agent, "id">) => string;
  addStimulus: (stimulus: Omit<Stimulus, "id">) => string;
  addResponse: (response: Omit<Response, "id">) => string;
  addSchedule: (schedule: Omit<Schedule, "id">) => string;
  addConnection: (connection: Omit<Connection, "id">) => string;
  addContingency: (contingency: Omit<Contingency, "id">) => string;

  // Add element with pre-assigned ID (from server)
  addElementWithId: (elementType: string, data: Record<string, unknown>) => void;

  // Update
  updateElement: (
    elementType: string,
    id: string,
    updates: Record<string, unknown>
  ) => void;

  // Remove
  removeElement: (elementType: string, id: string) => void;

  // Reset
  resetDiagram: () => void;
}

export const useDiagramStore = create<DiagramStore>((set) => ({
  diagram: createEmptyDiagram(),

  addAgent: (input) => {
    const id = generateId("agent");
    const agent: Agent = { id, ...input };
    set((state) => ({
      diagram: { ...state.diagram, agents: [...state.diagram.agents, agent] },
    }));
    return id;
  },

  addStimulus: (input) => {
    const id = generateId("stim");
    const stimulus: Stimulus = { id, ...input };
    set((state) => ({
      diagram: { ...state.diagram, stimuli: [...state.diagram.stimuli, stimulus] },
    }));
    return id;
  },

  addResponse: (input) => {
    const id = generateId("resp");
    const response: Response = { id, ...input };
    set((state) => ({
      diagram: { ...state.diagram, responses: [...state.diagram.responses, response] },
    }));
    return id;
  },

  addSchedule: (input) => {
    const id = generateId("sched");
    const schedule: Schedule = { id, ...input };
    set((state) => ({
      diagram: { ...state.diagram, schedules: [...state.diagram.schedules, schedule] },
    }));
    return id;
  },

  addConnection: (input) => {
    const id = generateId("conn");
    const connection: Connection = { id, ...input };
    set((state) => ({
      diagram: { ...state.diagram, connections: [...state.diagram.connections, connection] },
    }));
    return id;
  },

  addContingency: (input) => {
    const id = generateId("cont");
    const contingency: Contingency = { id, ...input };
    set((state) => ({
      diagram: { ...state.diagram, contingencies: [...state.diagram.contingencies, contingency] },
    }));
    return id;
  },

  addElementWithId: (elementType, data) => {
    const key = ELEMENT_TYPE_TO_KEY[elementType];
    if (!key) return;
    set((state) => ({
      diagram: {
        ...state.diagram,
        [key]: [...getCollection(state.diagram, key), data],
      },
    }));
  },

  updateElement: (elementType, id, updates) => {
    const key = ELEMENT_TYPE_TO_KEY[elementType];
    if (!key) return;
    set((state) => {
      const collection = getCollection(state.diagram, key);
      const index = collection.findIndex((el) => el.id === id);
      if (index === -1) return state;

      const updated = [...collection];
      updated[index] = { ...collection[index], ...updates, id };
      return { diagram: { ...state.diagram, [key]: updated } };
    });
  },

  removeElement: (elementType, id) => {
    const key = ELEMENT_TYPE_TO_KEY[elementType];
    if (!key) return;
    set((state) => ({
      diagram: {
        ...state.diagram,
        [key]: getCollection(state.diagram, key).filter((el) => el.id !== id),
      },
    }));
  },

  resetDiagram: () => {
    set({ diagram: createEmptyDiagram() });
  },
}));
