"use client";
import { useProfileContext } from "@/context/ProfileContext";
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAssistantState,
} from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { BotIcon, Send, Sparkles, X } from "lucide-react";
import { FC, useEffect, useMemo, useRef } from "react";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { KPI } from "../../../overview/services/types";
import {
  useAgingBuckets,
  useCashDeviationByPhase,
  useDebtorConcentration,
  useExecutiveSummary,
} from "../../hooks/useDashboardAggregates";
import { useQuironChatStore } from "../../store";
import { DashboardType } from "../../types";
import { useQuiron } from "./quiron-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const TOPIC_LABELS: Record<string, string> = {
  "cash-deviation": "la desviación de caja por fase",
  "aging-buckets": "el envejecimiento de cartera",
  "debtor-concentration": "la concentración de la mora",
  quironscore: "el Quironscore",
  resumen: "el resumen ejecutivo",
};

const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  "cash-deviation": [
    "¿Qué segmento explica la mayor desviación de caja?",
    "¿Qué acción prioritaria recomiendas para reducir la brecha?",
  ],
  "aging-buckets": [
    "¿Qué bucket de envejecimiento requiere más atención?",
    "¿Cómo se compara con el periodo anterior?",
  ],
  "debtor-concentration": [
    "¿Qué deudores explican la mayor concentración de mora?",
    "¿Qué riesgo representa esta concentración?",
  ],
  quironscore: [
    "¿Qué está impulsando el Quironscore actual?",
    "¿Qué debería mejorar para subir el score?",
  ],
  resumen: [
    "¿Cuáles son mis compromisos más riesgosos esta semana?",
    "¿Qué acción prioritaria me recomiendas hoy?",
  ],
};

function topicLabel(topic: string): string {
  if (topic.startsWith("kpi::")) return `el indicador "${topic.slice(5)}"`;
  return TOPIC_LABELS[topic] || topic;
}

function introMessage(topic: string): string {
  return `Puedo ayudarte a analizar ${topicLabel(topic)}. Pregúntame lo que quieras.`;
}

const MOCK_QUIRONSCORE_CONTEXT = {
  score: 78,
  band: "Cartera en rango saludable",
  deltaLabel: "+3 pts vs semana anterior",
  history: [64, 67, 69, 70, 71, 73, 75, 76, 78],
  isMock: true,
};

interface QuironDatasets {
  kpis: KPI[];
  agingBuckets?: unknown;
  debtorConcentration?: unknown;
  cashDeviation?: unknown;
  executiveSummary?: unknown;
}

function buildContextForTopic(topic: string, datasets: QuironDatasets): unknown {
  const { kpis, agingBuckets, debtorConcentration, cashDeviation, executiveSummary } =
    datasets;

  if (topic.startsWith("kpi::")) {
    const name = topic.slice(5);
    return { kpi: kpis.find((k) => k.name === name), allKpis: kpis };
  }

  switch (topic) {
    case "cash-deviation":
      return cashDeviation;
    case "aging-buckets":
      return agingBuckets;
    case "debtor-concentration":
      return debtorConcentration;
    case "quironscore":
      return MOCK_QUIRONSCORE_CONTEXT;
    case "resumen":
    default:
      return { executiveSummary, kpis };
  }
}

interface QuironWidgetProps {
  dashboardType: DashboardType;
  kpis: KPI[];
}

export const QuironWidget = ({ dashboardType, kpis }: QuironWidgetProps) => {
  const { enabled, isOpen, topic, open, close } = useQuiron();
  const { session, profile } = useProfileContext();
  const accessToken = session?.token || "";
  const clientId = profile?.client?.id || "";

  const effectiveTopic = topic || "resumen";

  const { data: executiveSummary } = useExecutiveSummary({
    accessToken,
    clientId,
    enabled: enabled && !!accessToken && !!clientId,
  });

  const { data: agingBuckets } = useAgingBuckets({
    accessToken,
    clientId,
    enabled: isOpen && effectiveTopic === "aging-buckets",
  });

  const { data: debtorConcentration } = useDebtorConcentration({
    accessToken,
    clientId,
    enabled: isOpen && effectiveTopic === "debtor-concentration",
  });

  const { data: cashDeviation } = useCashDeviationByPhase({
    accessToken,
    clientId,
    enabled: isOpen && effectiveTopic === "cash-deviation",
  });

  const context = useMemo(
    () =>
      buildContextForTopic(effectiveTopic, {
        kpis,
        agingBuckets,
        debtorConcentration,
        cashDeviation,
        executiveSummary,
      }),
    [effectiveTopic, kpis, agingBuckets, debtorConcentration, cashDeviation, executiveSummary],
  );

  if (!enabled) return null;

  return (
    <div className="qxv2">
      <button
        type="button"
        className={`qxv2-quiron-fab${isOpen ? " hidden" : ""}`}
        onClick={open}
        title="Abrir Quirón"
        aria-label="Abrir Quirón"
      >
        <Sparkles className="qxv2-fab-ic" size={22} />
        <span className="qxv2-fab-tx">Quirón</span>
        <span className="qxv2-fab-dot" />
      </button>

      <div className={`qxv2-quiron-widget${isOpen ? " open" : ""}`}>
        <div className="qxv2-qr-head">
          <div className="qxv2-q-tile">
            <Sparkles size={18} color="#fff" />
          </div>
          <div>
            <h3>Quirón</h3>
            <div className="qxv2-q-sub">Asistente de cobranza con IA</div>
          </div>
          <span className="qxv2-q-live">● Al día</span>
          <button
            type="button"
            className="qxv2-qr-close"
            onClick={close}
            aria-label="Cerrar Quirón"
          >
            <X size={17} />
          </button>
        </div>

        {effectiveTopic === "resumen" && executiveSummary && (
          <div className="qxv2-chat" style={{ maxHeight: "none", paddingBottom: 0 }}>
            <div className="qxv2-bub ai">
              {executiveSummary.text}
              {executiveSummary.actions.length > 0 && (
                <div className="qxv2-q-actions">
                  {executiveSummary.actions.map((a) => (
                    <div className="qxv2-q-action" key={a.label}>
                      <span className="qxv2-qa-tx">{a.label}</span>
                      {a.amount ? <span className="qxv2-qa-amt">{a.amount}</span> : null}
                      <button type="button" className="qxv2-qa-btn">
                        Enviar a gestión
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {isOpen && (
          <QuironChat
            key={effectiveTopic}
            topic={effectiveTopic}
            dashboardType={dashboardType}
            context={context}
            accessToken={accessToken}
            clientId={clientId}
          />
        )}
      </div>
    </div>
  );
};

interface QuironChatProps {
  topic: string;
  dashboardType: DashboardType;
  context: unknown;
  accessToken: string;
  clientId: string;
}

const QuironChat: FC<QuironChatProps> = ({
  topic,
  dashboardType,
  context,
  accessToken,
  clientId,
}) => {
  const { getChatThreadId, setChatThreadId, getChatMessages, setChatMessages } =
    useQuironChatStore();

  const threadId = useMemo(() => {
    const existing = getChatThreadId(topic);
    if (existing) return existing;
    return crypto.randomUUID();
  }, [topic]);

  useEffect(() => {
    if (!getChatThreadId(topic)) {
      setChatThreadId(topic, threadId);
    }
  }, [topic, threadId]);

  const saved = useMemo(() => getChatMessages(topic), [topic]);
  const hasSaved = !!saved;

  const initialMessages = useMemo(() => {
    if (hasSaved) return [];
    return [
      {
        role: "assistant",
        parts: [{ type: "text" as const, text: introMessage(topic) }],
        id: "quiron-intro",
      } as any,
    ];
  }, [hasSaved, topic]);

  const runtime = useChatRuntime({
    messages: initialMessages,
    transport: new AssistantChatTransport({
      api: `${API_URL}/v2/clients/${clientId}/ai-engines/management-recap`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      prepareSendMessagesRequest: ({ messages, trigger, messageId, body }) => ({
        body: {
          ...body,
          id: threadId,
          messages,
          trigger,
          messageId,
          metadata: { dashboardType, topic, context },
        },
      }),
    }),
  });

  const runtimeRef = useRef(runtime);
  runtimeRef.current = runtime;

  useEffect(() => {
    if (hasSaved && saved) {
      runtime.thread.import(saved as any);
    }

    const unsub = runtime.thread.unstable_on("run-end", () => {
      const exported = runtime.thread.export();
      if (exported.messages.length > 0) {
        setChatMessages(topic, exported);
      }
    });

    return () => {
      unsub();
      try {
        const exported = runtimeRef.current.thread.export();
        if (exported.messages.length > 0) {
          setChatMessages(topic, exported);
        }
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <QuironThread topic={topic} />
    </AssistantRuntimeProvider>
  );
};

const QuironThread: FC<{ topic: string }> = ({ topic }) => {
  return (
    <ThreadPrimitive.Root>
      <ThreadPrimitive.Viewport className="qxv2-chat">
        <ThreadPrimitive.Messages
          components={{
            UserMessage: QuironUserMessage,
            AssistantMessage: QuironAssistantMessage,
          }}
        />
      </ThreadPrimitive.Viewport>

      <QuironSuggestions topic={topic} />
      <QuironComposer />
    </ThreadPrimitive.Root>
  );
};

const QuironUserMessage: FC = () => {
  return (
    <MessagePrimitive.Root>
      <div className="qxv2-bub user">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
};

const QuironAssistantMessage: FC = () => {
  const isRunning = useAssistantState(({ thread }) => thread.isRunning);
  const hasContent = useAssistantState(({ message }) => {
    const parts = message.parts;
    return parts && parts.length > 0;
  });

  if (isRunning && !hasContent) {
    return (
      <div className="qxv2-bub ai">
        <div className="flex gap-1">
          <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" />
          <div
            className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    );
  }

  return (
    <MessagePrimitive.Root>
      <div className="qxv2-bub ai">
        <MessagePrimitive.Content components={{ Text: MarkdownText }} />
      </div>
    </MessagePrimitive.Root>
  );
};

const QuironSuggestions: FC<{ topic: string }> = ({ topic }) => {
  const messageCount = useAssistantState(({ thread }) => thread.messages.length);
  const questions = SUGGESTED_QUESTIONS[topic] || SUGGESTED_QUESTIONS.resumen;

  if (messageCount !== 1) return null;

  return (
    <div className="qxv2-q-sug">
      <div className="qxv2-qs-label">Preguntas sugeridas</div>
      <div className="qxv2-qs-chips">
        {questions.map((q) => (
          <ThreadPrimitive.Suggestion key={q} prompt={q} clearComposer send asChild>
            <button type="button" className="qxv2-qs-chip">
              {q}
            </button>
          </ThreadPrimitive.Suggestion>
        ))}
      </div>
    </div>
  );
};

const QuironComposer: FC = () => {
  return (
    <ComposerPrimitive.Root className="qxv2-q-input">
      <ComposerPrimitive.Input
        autoFocus
        rows={1}
        placeholder="Pregúntale a Quirón…"
      />
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <button type="button" className="qxv2-q-send" aria-label="Enviar">
            <Send size={16} />
          </button>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <button type="button" disabled className="qxv2-q-send" aria-label="Enviar">
          <BotIcon size={16} />
        </button>
      </ThreadPrimitive.If>
    </ComposerPrimitive.Root>
  );
};
