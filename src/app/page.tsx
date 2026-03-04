"use client";

import { SplitPane } from "@/components/shared/SplitPane";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { DiagramPanel } from "@/components/diagram/DiagramPanel";

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      <SplitPane
        left={<ChatPanel />}
        right={<DiagramPanel />}
      />
    </main>
  );
}
