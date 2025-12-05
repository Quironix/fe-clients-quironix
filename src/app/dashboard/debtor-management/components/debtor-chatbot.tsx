"use client";

import { Thread } from "@/components/assistant-ui/thread";
import { useProfileContext } from "@/context/ProfileContext";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
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
    messages: [
      {
        role: "assistant",
        parts: [
          {
            type: "text",
            text: callBrief.replace(/```markdown\n?/g, "").replace(/```/g, ""),
          },
        ],
        id: "2WW5iArzjLZEFgtQ",
      },
    ],
    transport: new AssistantChatTransport({
      api: `${API_URL}/v2/clients/${profile?.client?.id}/ai-engines/chat`,
      headers: {
        Authorization: `Bearer ${session?.token}`,
      },
    }),
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
