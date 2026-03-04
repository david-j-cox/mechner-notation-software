"use client";

import { useState, useCallback } from "react";
import type { ChatMessageData } from "@/components/chat/ChatMessage";
import { useDiagramStore } from "./useDiagram";
import type { DiagramMutation } from "@/ai/parseToolOutput";

function parseDiagramMutation(data: unknown): DiagramMutation | null {
  if (
    typeof data !== "object" ||
    data === null ||
    !("type" in data) ||
    !("elementType" in data) ||
    !("id" in data) ||
    !("data" in data)
  ) {
    return null;
  }
  const d = data as Record<string, unknown>;
  if (
    typeof d.type !== "string" ||
    typeof d.elementType !== "string" ||
    typeof d.id !== "string" ||
    typeof d.data !== "object"
  ) {
    return null;
  }
  return d as unknown as DiagramMutation;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addElementWithId, updateElement, removeElement } = useDiagramStore();

  const applyMutation = useCallback(
    (mutation: DiagramMutation) => {
      switch (mutation.type) {
        case "add":
          addElementWithId(mutation.elementType, mutation.data);
          break;
        case "update":
          updateElement(mutation.elementType, mutation.id, mutation.data);
          break;
        case "remove":
          removeElement(mutation.elementType, mutation.id);
          break;
      }
    },
    [addElementWithId, updateElement, removeElement]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessageData = {
        id: `msg_${Date.now()}`,
        role: "user",
        content,
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let assistantText = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE spec: events are separated by double newlines
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? ""; // Keep incomplete last event

          for (const event of events) {
            const lines = event.split("\n");
            let eventType = "";
            let dataStr = "";

            for (const line of lines) {
              if (line.startsWith("event: ")) {
                eventType = line.slice(7);
              } else if (line.startsWith("data: ")) {
                dataStr = line.slice(6);
              }
            }

            if (!eventType || !dataStr) continue;

            let data: unknown;
            try {
              data = JSON.parse(dataStr);
            } catch {
              console.warn("Malformed SSE data:", dataStr);
              continue;
            }

            switch (eventType) {
              case "text": {
                const text = (data as Record<string, unknown>)?.text;
                if (typeof text === "string") {
                  assistantText += text;
                  setMessages((prev) => {
                    const last = prev[prev.length - 1];
                    if (last?.role === "assistant") {
                      return [
                        ...prev.slice(0, -1),
                        { ...last, content: assistantText },
                      ];
                    }
                    return [
                      ...prev,
                      {
                        id: `msg_${Date.now()}`,
                        role: "assistant",
                        content: assistantText,
                      },
                    ];
                  });
                }
                break;
              }

              case "diagram_update": {
                const mutation = parseDiagramMutation(data);
                if (mutation) {
                  applyMutation(mutation);
                } else {
                  console.warn("Invalid diagram mutation:", data);
                }
                break;
              }

              case "error": {
                const msg = (data as Record<string, unknown>)?.message;
                console.error("Chat error:", msg);
                break;
              }

              case "done":
                break;
            }
          }
        }
      } catch (err) {
        console.error("Failed to send message:", err);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, applyMutation]
  );

  return { messages, isLoading, sendMessage };
}
