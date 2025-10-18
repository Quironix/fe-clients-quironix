"use client";

import { Thread } from "@/components/assistant-ui/thread";
import { useProfileContext } from "@/context/ProfileContext";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { useRef } from "react";

interface DebtorChatbotProps {
  debtorId: string;
  callBrief?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function DebtorChatbot({ debtorId, callBrief }: DebtorChatbotProps) {
  const { profile, session } = useProfileContext();
  const containerRef = useRef<HTMLDivElement>(null);

  const runtime = useChatRuntime({
    api: `${API_URL}/v2/clients/${profile?.client?.id}/ai-engines/chat`,
    headers: {
      Authorization: `Bearer ${session?.token}`,
    },
    initialMessages: [
      {
        role: "assistant",
        content: callBrief.replace(/```markdown\n?/g, "").replace(/```/g, ""),
      },
    ],
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div
        ref={containerRef}
        className="h-[600px] w-full flex flex-col bg-[#f9fcff] rounded-md border p-2 overflow-y-auto"
      >
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}
