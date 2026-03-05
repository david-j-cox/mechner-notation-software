import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { getClaudeClient } from "@/lib/claude";
import { SYSTEM_PROMPT } from "@/ai/systemPrompt";
import { toolDefinitions } from "@/ai/tools";
import { processToolCall } from "@/ai/parseToolOutput";

const requestBodySchema = z.object({
  messages: z.array(z.any()).min(1),
  history: z.array(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof requestBodySchema>;
  try {
    const json = await req.json();
    body = requestBodySchema.parse(json);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      try {
        const claude = getClaudeClient();

        // Use full history if provided (includes tool_use/tool_result blocks),
        // otherwise fall back to simple text messages for first turn
        const anthropicMessages: Anthropic.MessageParam[] = body.history
          ? [...body.history as Anthropic.MessageParam[]]
          : body.messages.map((m: { role: string; content: string }) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            }));

        // Append the new user message (only if using history —
        // the new message isn't in history yet)
        if (body.history) {
          const lastUserMsg = body.messages[body.messages.length - 1];
          anthropicMessages.push({
            role: "user",
            content: lastUserMsg.content,
          });
        }

        // Tool-use loop
        let continueLoop = true;
        let iterations = 0;
        const MAX_ITERATIONS = 20;
        let hasSentText = false;

        while (continueLoop && iterations < MAX_ITERATIONS) {
          iterations++;

          const response = await claude.messages.create({
            model: process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514",
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            tools: toolDefinitions,
            messages: anthropicMessages,
          });

          const toolResults: Anthropic.ToolResultBlockParam[] = [];
          let hasToolUse = false;

          for (const block of response.content) {
            if (block.type === "text") {
              if (hasSentText) {
                send("text", { text: "\n\n" });
              }
              send("text", { text: block.text });
              hasSentText = true;
            } else if (block.type === "tool_use") {
              hasToolUse = true;
              const result = processToolCall(block.name, block.input);

              if (result.mutation) {
                send("diagram_update", result.mutation);
              }

              if (result.error) {
                send("error", { message: result.error });
              }

              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: result.toolResult,
              });
            }
          }

          // Always append assistant response to history
          anthropicMessages.push({
            role: "assistant",
            content: response.content,
          });

          if (hasToolUse) {
            // Append tool results for next iteration
            anthropicMessages.push({
              role: "user",
              content: toolResults,
            });
          } else {
            continueLoop = false;
          }
        }

        if (iterations >= MAX_ITERATIONS) {
          send("error", { message: "Too many tool-use iterations" });
        }

        // Send the full message history back to the client so it can
        // include it in the next request — this preserves tool_use and
        // tool_result blocks that Claude needs for ID continuity
        send("history", { messages: anthropicMessages });
        send("done", {});
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        send("error", { message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
