import {
  addAgentInputSchema,
  addStimulusInputSchema,
  addResponseInputSchema,
  addScheduleInputSchema,
  addConnectionInputSchema,
  addContingencyInputSchema,
  updateElementInputSchema,
  removeElementInputSchema,
} from "@/model/schema";
import { generateId } from "@/model/contingency";

export interface DiagramMutation {
  type: "add" | "update" | "remove";
  elementType: string;
  data: Record<string, unknown>;
  id: string;
}

interface ToolProcessResult {
  mutation: DiagramMutation | null;
  toolResult: string; // JSON string sent back to Claude as tool_result
  error?: string;
}

export function processToolCall(
  toolName: string,
  toolInput: unknown
): ToolProcessResult {
  try {
    switch (toolName) {
      case "add_agent": {
        const input = addAgentInputSchema.parse(toolInput);
        const id = generateId("agent");
        return {
          mutation: { type: "add", elementType: "agent", data: { ...input, id }, id },
          toolResult: JSON.stringify({ success: true, id }),
        };
      }
      case "add_stimulus": {
        const input = addStimulusInputSchema.parse(toolInput);
        const id = generateId("stim");
        return {
          mutation: { type: "add", elementType: "stimulus", data: { ...input, id }, id },
          toolResult: JSON.stringify({ success: true, id }),
        };
      }
      case "add_response": {
        const input = addResponseInputSchema.parse(toolInput);
        const id = generateId("resp");
        return {
          mutation: { type: "add", elementType: "response", data: { ...input, id }, id },
          toolResult: JSON.stringify({ success: true, id }),
        };
      }
      case "add_schedule": {
        const input = addScheduleInputSchema.parse(toolInput);
        const id = generateId("sched");
        return {
          mutation: { type: "add", elementType: "schedule", data: { ...input, id }, id },
          toolResult: JSON.stringify({ success: true, id }),
        };
      }
      case "add_connection": {
        const input = addConnectionInputSchema.parse(toolInput);
        const id = generateId("conn");
        return {
          mutation: { type: "add", elementType: "connection", data: { ...input, id }, id },
          toolResult: JSON.stringify({ success: true, id }),
        };
      }
      case "add_contingency": {
        const input = addContingencyInputSchema.parse(toolInput);
        const id = generateId("cont");
        return {
          mutation: { type: "add", elementType: "contingency", data: { ...input, id }, id },
          toolResult: JSON.stringify({ success: true, id }),
        };
      }
      case "update_element": {
        const input = updateElementInputSchema.parse(toolInput);
        return {
          mutation: {
            type: "update",
            elementType: input.elementType,
            data: input.updates as Record<string, unknown>,
            id: input.id,
          },
          toolResult: JSON.stringify({ success: true, id: input.id }),
        };
      }
      case "remove_element": {
        const input = removeElementInputSchema.parse(toolInput);
        return {
          mutation: {
            type: "remove",
            elementType: input.elementType,
            data: {},
            id: input.id,
          },
          toolResult: JSON.stringify({ success: true, id: input.id }),
        };
      }
      default:
        return {
          mutation: null,
          toolResult: JSON.stringify({ error: `Unknown tool: ${toolName}` }),
          error: `Unknown tool: ${toolName}`,
        };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Validation failed";
    return {
      mutation: null,
      toolResult: JSON.stringify({ error: message }),
      error: message,
    };
  }
}
