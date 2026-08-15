"use client";

import { Thread } from "@/components/assistant-ui/thread";
import { useProfileContext } from "@/context/ProfileContext";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { useEffect, useMemo, useRef } from "react";
import { useDebtorsStore } from "../../debtors/store";
import { CallBriefCards } from "./call-brief-cards";

interface DebtorChatbotProps {
  debtorId: string;
  callBrief: string | null;
  isFetchingCallBrief: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function DebtorChatbotRuntime({
  debtorId,
  callBrief,
  isFetchingCallBrief,
}: DebtorChatbotProps) {
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
    messages: [],
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
          context: callBrief ?? undefined,
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
        className="h-[650px] w-full flex flex-col bg-[#f9fcff]"
      >
        <Thread
          leading={
            <CallBriefCards
              callBrief={callBrief}
              isFetchingCallBrief={isFetchingCallBrief}
            />
          }
          hideWelcome={!!callBrief || isFetchingCallBrief}
        />
      </div>
    </AssistantRuntimeProvider>
  );
}

export function DebtorChatbot({
  debtorId,
  callBrief,
  isFetchingCallBrief,
}: DebtorChatbotProps) {
  return (
    <DebtorChatbotRuntime
      debtorId={debtorId}
      callBrief={callBrief}
      isFetchingCallBrief={isFetchingCallBrief}
    />
  );
}
