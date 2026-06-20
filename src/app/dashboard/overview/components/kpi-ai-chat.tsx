"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfileContext } from "@/context/ProfileContext";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef } from "react";
import { KPIThread } from "./kpi-thread";
import { useKPIStore } from "../store";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const KPIAIChat = () => {
  const t = useTranslations("overview");
  const { profile, session } = useProfileContext();
  const { getChatThreadId, setChatThreadId, getChatMessages, setChatMessages } = useKPIStore();

  const threadId = useMemo(() => {
    const existing = getChatThreadId();
    if (existing) return existing;
    return crypto.randomUUID();
  }, []);

  useEffect(() => {
    if (!getChatThreadId()) {
      setChatThreadId(threadId);
    }
  }, []);

  const saved = useMemo(() => getChatMessages(), []);
  const hasSaved = !!saved;

  const runtime = useChatRuntime({
    messages: hasSaved
      ? []
      : [
          {
            role: "assistant",
            parts: [
              {
                type: "text",
                text: t("kpiAssistantWelcome"),
              },
            ],
            id: "3WW5iArzjLZEFgtQ",
          },
        ],
    transport: new AssistantChatTransport({
      api: `${API_URL}/v2/clients/${profile?.client?.id}/ai-engines/management-recap`,
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
        setChatMessages(exported);
      }
    });

    return () => {
      unsub();
      try {
        const exported = runtimeRef.current.thread.export();
        if (exported.messages.length > 0) {
          setChatMessages(exported);
        }
      } catch {}
    };
  }, [runtime, hasSaved]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Card className="">
        <CardHeader>
          <CardTitle>{t("kpiAssistant")}</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <div className="h-[500px] w-full flex flex-col">
            <KPIThread />
          </div>
        </CardContent>
      </Card>
    </AssistantRuntimeProvider>
  );
};
