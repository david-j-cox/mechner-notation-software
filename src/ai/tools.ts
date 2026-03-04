import type Anthropic from "@anthropic-ai/sdk";

export const toolDefinitions: Anthropic.Tool[] = [
  {
    name: "add_agent",
    description:
      "Add an agent (organism/person) to the diagram. Returns the generated ID.",
    input_schema: {
      type: "object" as const,
      properties: {
        label: {
          type: "string",
          description: 'Full label for the agent (e.g., "Student", "Rat")',
        },
        shortLabel: {
          type: "string",
          description:
            'Short label for diagram display, max 5 chars (e.g., "S", "R")',
        },
      },
      required: ["label", "shortLabel"],
    },
  },
  {
    name: "add_stimulus",
    description:
      "Add a stimulus to the diagram. Returns the generated ID.",
    input_schema: {
      type: "object" as const,
      properties: {
        function: {
          type: "string",
          enum: [
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
          ],
          description: "The functional classification of the stimulus",
        },
        label: {
          type: "string",
          description:
            'Human-readable label (e.g., "Food pellet", "Red light")',
        },
        conditioned: {
          type: "boolean",
          description: "Whether this is a conditioned (learned) stimulus",
        },
        agentId: {
          type: "string",
          description: "Optional ID of the agent this stimulus relates to",
        },
      },
      required: ["function", "label", "conditioned"],
    },
  },
  {
    name: "add_response",
    description:
      "Add a response/behavior to the diagram. Returns the generated ID.",
    input_schema: {
      type: "object" as const,
      properties: {
        label: {
          type: "string",
          description:
            'Human-readable label (e.g., "Lever press", "Hand raising")',
        },
        agentId: {
          type: "string",
          description: "Optional ID of the agent performing the response",
        },
        responseClass: {
          type: "string",
          description:
            'Optional response class (e.g., "operant", "respondent")',
        },
      },
      required: ["label"],
    },
  },
  {
    name: "add_schedule",
    description:
      "Add a schedule of reinforcement. Returns the generated ID.",
    input_schema: {
      type: "object" as const,
      properties: {
        type: {
          type: "string",
          enum: ["FR", "VR", "FI", "VI", "FT", "VT", "CRF", "EXT"],
          description: "Schedule type",
        },
        value: {
          type: "number",
          description:
            "Schedule value (e.g., 5 for FR5). Not needed for CRF or EXT.",
        },
        unit: {
          type: "string",
          description:
            'Unit for interval schedules (e.g., "seconds", "minutes")',
        },
      },
      required: ["type"],
    },
  },
  {
    name: "add_connection",
    description:
      "Add a connection/arrow between two elements. Returns the generated ID.",
    input_schema: {
      type: "object" as const,
      properties: {
        type: {
          type: "string",
          enum: ["produces", "occasions", "elicits", "prevents", "simultaneous"],
          description:
            "Connection type: produces (R→S), occasions (S→R), elicits (S→R respondent), prevents, simultaneous",
        },
        sourceId: {
          type: "string",
          description: "ID of the source element",
        },
        targetId: {
          type: "string",
          description: "ID of the target element",
        },
        scheduleId: {
          type: "string",
          description: "Optional schedule ID to display on this connection",
        },
        negated: {
          type: "boolean",
          description:
            "Whether this connection is negated (shown with ~ mark)",
        },
      },
      required: ["type", "sourceId", "targetId"],
    },
  },
  {
    name: "add_contingency",
    description:
      "Group elements into a contingency (A-B-C unit) for layout. Returns the generated ID.",
    input_schema: {
      type: "object" as const,
      properties: {
        label: {
          type: "string",
          description:
            'Optional label for this contingency (e.g., "Positive reinforcement")',
        },
        antecedents: {
          type: "array",
          items: { type: "string" },
          description: "Array of stimulus IDs serving as antecedents",
        },
        behavior: {
          type: "string",
          description: "Response ID for the target behavior",
        },
        consequences: {
          type: "array",
          items: { type: "string" },
          description: "Array of stimulus IDs serving as consequences",
        },
        connections: {
          type: "array",
          items: { type: "string" },
          description: "Array of connection IDs in this contingency",
        },
        scheduleId: {
          type: "string",
          description: "Optional schedule ID for this contingency",
        },
      },
      required: ["antecedents", "behavior", "consequences", "connections"],
    },
  },
  {
    name: "update_element",
    description: "Update properties of an existing diagram element.",
    input_schema: {
      type: "object" as const,
      properties: {
        elementType: {
          type: "string",
          enum: [
            "agent",
            "stimulus",
            "response",
            "schedule",
            "connection",
            "contingency",
          ],
          description: "Type of element to update",
        },
        id: {
          type: "string",
          description: "ID of the element to update",
        },
        updates: {
          type: "object",
          description: "Object with properties to update",
        },
      },
      required: ["elementType", "id", "updates"],
    },
  },
  {
    name: "remove_element",
    description: "Remove an element from the diagram.",
    input_schema: {
      type: "object" as const,
      properties: {
        elementType: {
          type: "string",
          enum: [
            "agent",
            "stimulus",
            "response",
            "schedule",
            "connection",
            "contingency",
          ],
          description: "Type of element to remove",
        },
        id: {
          type: "string",
          description: "ID of the element to remove",
        },
      },
      required: ["elementType", "id"],
    },
  },
];
