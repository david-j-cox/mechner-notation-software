import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { getClaudeClient } from "@/lib/claude";
import { SYSTEM_PROMPT } from "@/ai/systemPrompt";
import { toolDefinitions } from "@/ai/tools";
import { processToolCall } from "@/ai/parseToolOutput";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

const requestBodySchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
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

        // Convert to Anthropic message format
        const anthropicMessages: Anthropic.MessageParam[] = body.messages.map(
          (m) => ({
            role: m.role,
            content: m.content,
          })
        );

        // Tool-use loop: keep calling Claude until it stops using tools
        let continueLoop = true;
        let iterations = 0;
        const MAX_ITERATIONS = 20;

        while (continueLoop && iterations < MAX_ITERATIONS) {
          iterations++;

          const response = await claude.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            tools: toolDefinitions,
            messages: anthropicMessages,
          });

          // Process response content blocks
          const toolResults: Anthropic.ToolResultBlockParam[] = [];
          let hasToolUse = false;

          for (const block of response.content) {
            if (block.type === "text") {
              send("text", { text: block.text });
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

          if (hasToolUse) {
            // Add assistant response + tool results for next iteration
            anthropicMessages.push({
              role: "assistant",
              content: response.content,
            });
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
