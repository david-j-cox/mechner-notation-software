"use client";

import { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useChat } from "@/hooks/useChat";

export function ChatPanel() {
  const { messages, isLoading, sendMessage } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-2 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-700">
          Contingency Analysis
        </h2>
        <p className="text-xs text-slate-400">
          Describe a behavior scenario to create a Mechner notation diagram
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-8">
            <p className="text-sm">
              Try: &quot;A rat presses a lever and gets food&quot;
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="bg-slate-100 rounded-lg px-4 py-2 text-sm text-slate-400">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
