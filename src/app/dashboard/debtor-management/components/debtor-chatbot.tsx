"use client";

import { Thread } from "@/components/assistant-ui/thread";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileContext } from "@/context/ProfileContext";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { useEffect, useMemo, useRef } from "react";
import { useDebtorsStore } from "../../debtors/store";

interface DebtorChatbotProps {
  debtorId: string;
  callBrief?: string | null;
  isFetchingCallBrief?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function ChatbotSkeleton() {
  return (
    <div className="h-[600px] w-full flex flex-col bg-[#f9fcff] rounded-md border p-4 overflow-y-auto">
      <div className="flex flex-col gap-3 mt-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-20 w-full mt-2" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

function DebtorChatbotRuntime({
  debtorId,
  callBrief,
}: {
  debtorId: string;
  callBrief: string | null;
}) {
  const { profile, session } = useProfileContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const { getChatThreadId, setChatThreadId, getChatMessages, setChatMessages } = useDebtorsStore();

  const threadId = useMemo(() => {
    const existing = getChatThreadId(debtorId);
    if (existing) return existing;
    return crypto.randomUUID();
  }, [debtorId]);

  useEffect(() => {
    if (!getChatThreadId(debtorId)) {
      setChatThreadId(debtorId, threadId);
    }
  }, [debtorId]);

  const saved = useMemo(() => getChatMessages(debtorId), [debtorId]);
  const hasSaved = !!saved;

  const runtime = useChatRuntime({
    messages: hasSaved
      ? []
      : callBrief
        ? [
            {
              role: "assistant",
              content: "",
              parts: [
                {
                  type: "text",
                  text: callBrief
                    .replace(/```markdown\n?/g, "")
                    .replace(/```/g, ""),
                },
              ],
              id: crypto.randomUUID(),
            } as any,
          ]
        : [],
    transport: new AssistantChatTransport({
      api: `${API_URL}/v2/clients/${profile?.client?.id}/ai-engines/chat`,
      headers: {
        Authorization: `Bearer ${session?.token}`,
      },
      prepareSendMessagesRequest: ({
        messages,
        trigger,
        messageId,
        requestMetadata,
        body,
      }) => ({
        body: {
          ...body,
          id: threadId,
          messages,
          trigger,
          messageId,
          metadata: requestMetadata,
        },
      }),
    }),
  });

  const runtimeRef = useRef(runtime);
  runtimeRef.current = runtime;

  useEffect(() => {
    if (hasSaved && saved) {
      runtime.thread.import(saved);
    }

    const unsub = runtime.thread.unstable_on("run-end", () => {
      const exported = runtime.thread.export();
      if (exported.messages.length > 0) {
        setChatMessages(debtorId, exported);
      }
    });

    return () => {
      unsub();
      try {
        const exported = runtimeRef.current.thread.export();
        if (exported.messages.length > 0) {
          setChatMessages(debtorId, exported);
        }
      } catch {}
    };
  }, [runtime, debtorId, hasSaved]);

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

export function DebtorChatbot({
  debtorId,
  callBrief,
  isFetchingCallBrief,
}: DebtorChatbotProps) {
  if (isFetchingCallBrief) {
    return <ChatbotSkeleton />;
  }

  return <DebtorChatbotRuntime debtorId={debtorId} callBrief={callBrief} />;
}
