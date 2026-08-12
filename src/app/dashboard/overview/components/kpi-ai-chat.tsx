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
import { useKPIStore } from "../store";
import { KPIThread } from "./kpi-thread";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const KPIAIChat = () => {
  const t = useTranslations("overview");
  const { profile, session } = useProfileContext();
  const {
    kpis,
    getChatThreadId,
    setChatThreadId,
    getChatMessages,
    setChatMessages,
  } = useKPIStore();

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

  const initialMessages = useMemo(() => {
    if (hasSaved) return [];

    return [
      {
        role: "assistant",
        parts: [
          {
            type: "text" as const,
            text: t("kpiAssistantWelcome"),
          },
        ],
        id: "3WW5iArzjLZEFgtQ",
      } as any,
    ];
  }, [hasSaved, t]);

  const systemPrompt = useMemo(() => {
    if (!kpis.length) return "";
    const kpiList = kpis
      .map(
        (kpi) =>
          `- ${kpi.name}: ${kpi.value}${kpi.unit} (meta: ${kpi.target}${kpi.unit}, estado: ${kpi.status}, definición: ${kpi.definition})`,
      )
      .join("\n");
    return `Estos son los KPIs actuales:\n${kpiList}

Cuando el usuario pida una lista de KPIs (en alerta, en rojo, en verde, óptimos, críticos, o una lista general de varios indicadores), no los describas en un párrafo ni en una tabla markdown. En su lugar, respondé únicamente con un bloque de código de lenguaje kpi-alert cuyo contenido sea un array JSON con esos KPIs, usando este formato exacto:

\`\`\`kpi-alert
[{"title": "Nombre del KPI", "value": "valor actual con unidad", "target": "meta con unidad", "status": "success"}]
\`\`\`

El campo "status" debe ser "success" si el KPI está cumpliendo su meta (verde/óptimo), "warning" si está cerca pero no la cumple, o "error" si está lejos de la meta (rojo/crítico) — usá el mismo estado que tiene cada KPI en la lista de arriba. No agregues texto antes ni después del bloque salvo una frase muy breve de introducción si es necesario. Si el usuario pregunta por un solo KPI puntual (por ejemplo "explícame el DSO"), respondé en texto normal, no uses este formato.`;
  }, [kpis]);

  const runtime = useChatRuntime({
    messages: initialMessages,
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
    if (!systemPrompt) return;

    const unsub = runtime.registerModelContextProvider({
      getModelContext: () => ({ system: systemPrompt }),
    });

    return () => unsub();
  }, [runtime, systemPrompt]);

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
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>{t("kpiAssistant")}</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          <div className="h-full w-full flex flex-col">
            <KPIThread />
          </div>
        </CardContent>
      </Card>
    </AssistantRuntimeProvider>
  );
};
