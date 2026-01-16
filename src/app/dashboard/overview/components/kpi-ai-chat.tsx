"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfileContext } from "@/context/ProfileContext";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { KPIThread } from "./kpi-thread";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const KPIAIChat = () => {
  const { profile, session } = useProfileContext();

  const runtime = useChatRuntime({
    messages: [
      {
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "¡Hola! Soy tu asistente de KPIs. Puedo ayudarte a analizar tus indicadores, interpretar tendencias y sugerir mejoras. ¿En qué puedo ayudarte hoy?",
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
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Card className="">
        <CardHeader>
          <CardTitle>Asistente de KPIs</CardTitle>
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
