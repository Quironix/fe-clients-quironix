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
import { Bot, Send, User, X } from "lucide-react";
import { FC, useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { QuironIcon } from "@/components/quiron/quiron-icon";
import { QuironLoader } from "@/components/quiron/quiron-loader";
import { KPI } from "../../../overview/services/types";
import {
  useAgingBuckets,
  useCashDeviationByPhase,
  useDebtorConcentration,
  useExecutiveSummary,
} from "../../hooks/useDashboardAggregates";
import { useQuironChatStore } from "../../store";
import { DashboardType } from "../../types";
import { cn } from "@/lib/utils";
import { useQuiron } from "./quiron-context";

const msgRow = "flex max-w-full items-end gap-2";
const bubble = "max-w-[82%] rounded-[14px] px-[15px] py-3 text-[13px] leading-[1.62]";
const bubbleAi = "rounded-bl-[4px] border border-primary-soft bg-primary-soft/50 text-gray-700";
const avatarBase = "grid size-6 flex-none place-items-center rounded-full";
const sendBtn =
  "grid size-11 flex-none cursor-pointer place-items-center rounded-xl bg-brand-orange text-white disabled:cursor-default disabled:opacity-50";

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

function autoQuestionForTopic(topic: string): string {
  if (topic.startsWith("kpi::")) {
    return `Analiza el indicador "${topic.slice(5)}" y dime qué significa para la gestión.`;
  }
  switch (topic) {
    case "cash-deviation":
      return "Analiza la desviación de caja por fase y dime qué la está explicando.";
    case "aging-buckets":
      return "Analiza el envejecimiento de cartera y dime qué bucket requiere más atención.";
    case "debtor-concentration":
      return "Analiza la concentración de la mora y dime qué deudores explican el mayor riesgo.";
    case "quironscore":
      return "Analiza el Quironscore actual y dime qué lo está impulsando.";
    case "resumen":
    default:
      return "Dame un resumen ejecutivo de la cartera con las acciones prioritarias de hoy.";
  }
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

function toAiKpi(kpi: KPI): Omit<KPI, "invoices"> {
  const { invoices, ...aiKpi } = kpi;
  return aiKpi;
}

function buildContextForTopic(topic: string, datasets: QuironDatasets): unknown {
  const { kpis, agingBuckets, debtorConcentration, cashDeviation, executiveSummary } =
    datasets;
  const aiKpis = kpis.map(toAiKpi);

  if (topic.startsWith("kpi::")) {
    const name = topic.slice(5);
    return { kpi: aiKpis.find((k) => k.name === name), allKpis: aiKpis };
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
      return { executiveSummary, kpis: aiKpis };
  }
}

interface QuironWidgetProps {
  dashboardType: DashboardType;
  kpis: KPI[];
}

export const QuironWidget = ({ dashboardType, kpis }: QuironWidgetProps) => {
  const { enabled, isOpen, topic, askToken, open, close } = useQuiron();
  const tw = useTranslations("quiron.widget");
  const { session, profile } = useProfileContext();
  const accessToken = session?.token || "";
  const clientId = profile?.client?.id || "";

  const effectiveTopic = topic || "resumen";

  const lastAutoAskedTokenRef = useRef(0);
  const shouldAutoAsk = askToken > 0 && askToken !== lastAutoAskedTokenRef.current;
  const markAutoAsked = () => {
    lastAutoAskedTokenRef.current = askToken;
  };

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
    <div className="text-[14px] leading-[1.45] text-gray-900">
      <button
        type="button"
        className={cn(
          "fixed right-[26px] bottom-[26px] z-[70] flex h-14 cursor-pointer items-center gap-2.5 rounded-full bg-linear-135 from-primary-bright to-primary pr-5 pl-[17px] text-white shadow-xl shadow-primary/40 transition duration-200 hover:-translate-y-0.5 max-sm:right-4 max-sm:bottom-4",
          isOpen && "pointer-events-none translate-y-3.5 scale-90 opacity-0",
        )}
        onClick={open}
        title={tw("open")}
        aria-label={tw("open")}
      >
        <QuironIcon tone="ember" size={22} animated />
        <span className="whitespace-nowrap text-[14px] font-extrabold">Quirón</span>
        <span className="size-2 rounded-full bg-green-400 shadow-[0_0_0_3px_rgba(74,222,128,0.35)]" />
      </button>

      <div
        className={cn(
          "fixed right-[26px] bottom-[26px] z-[71] flex max-h-[min(680px,calc(100vh-52px))] w-[436px] max-w-[calc(100vw-32px)] origin-bottom-right flex-col overflow-hidden rounded-[18px] border border-gray-200 bg-white shadow-xl transition duration-200 max-sm:right-3 max-sm:bottom-3 max-sm:left-3 max-sm:max-h-[min(620px,calc(100vh-24px))] max-sm:w-auto max-sm:max-w-none",
          isOpen ? "opacity-100" : "pointer-events-none translate-y-4 scale-96 opacity-0",
        )}
      >
        <div className="flex flex-none items-center gap-[11px] border-b border-gray-100 px-5 pt-[18px] pb-3.5">
          <div className="grid size-[38px] flex-none place-items-center rounded-[10px] bg-linear-135 from-primary-bright to-primary">
            <QuironIcon tone="ember" size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-[15.5px] font-black">Quirón</h3>
            <div className="text-[11px] font-bold text-gray-500">{tw("subtitle")}</div>
          </div>
          <span className="ml-auto whitespace-nowrap rounded-full bg-good-bg px-[9px] py-[3px] text-[10px] font-extrabold tracking-[0.04em] text-good-fg">
            {tw("live")}
          </span>
          <button
            type="button"
            className="ml-auto grid size-[30px] flex-none cursor-pointer place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-900"
            onClick={close}
            aria-label={tw("close")}
          >
            <X size={17} />
          </button>
        </div>

        {isOpen && (
          <QuironChat
            key={effectiveTopic}
            topic={effectiveTopic}
            dashboardType={dashboardType}
            context={context}
            accessToken={accessToken}
            clientId={clientId}
            shouldAutoAsk={shouldAutoAsk}
            onAutoAsked={markAutoAsked}
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
  shouldAutoAsk: boolean;
  onAutoAsked: () => void;
}

const QuironChat: FC<QuironChatProps> = ({
  topic,
  dashboardType,
  context,
  accessToken,
  clientId,
  shouldAutoAsk,
  onAutoAsked,
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

  useEffect(() => {
    if (!shouldAutoAsk) return;
    runtimeRef.current.thread.append(autoQuestionForTopic(topic));
    onAutoAsked();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoAsk]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <QuironThread topic={topic} />
    </AssistantRuntimeProvider>
  );
};

const QuironThread: FC<{ topic: string }> = ({ topic }) => {
  return (
    <ThreadPrimitive.Root className="flex min-h-0 flex-auto flex-col">
      <ThreadPrimitive.Viewport className="flex min-h-[220px] flex-auto flex-col gap-4 overflow-y-auto p-5">
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
    <MessagePrimitive.Root className={`${msgRow} justify-end`}>
      <div className={`${bubble} rounded-br-[4px] bg-primary-bright text-white`}>
        <MessagePrimitive.Content />
      </div>
      <div className={`${avatarBase} bg-primary-soft text-primary-bright`}>
        <User size={13} />
      </div>
    </MessagePrimitive.Root>
  );
};

const QuironAvatar: FC = () => (
  <div className={`${avatarBase} bg-linear-135 from-primary-bright to-primary text-white`}>
    <QuironIcon tone="ember" size={14} />
  </div>
);

const QuironAssistantMessage: FC = () => {
  const tw = useTranslations("quiron.widget");
  const isRunning = useAssistantState(({ thread }) => thread.isRunning);
  const hasContent = useAssistantState(({ message }) => {
    const parts = message.parts;
    return parts && parts.length > 0;
  });

  if (isRunning && !hasContent) {
    return (
      <div className={msgRow}>
        <div
          className={`${bubble} ${bubbleAi} flex items-center gap-2.5 py-1.5 pr-[15px] pl-2 font-semibold text-primary`}
          role="status"
        >
          <QuironLoader />
          {tw("thinking")}
        </div>
      </div>
    );
  }

  return (
    <MessagePrimitive.Root className={msgRow}>
      <QuironAvatar />
      <div className={`${bubble} ${bubbleAi}`}>
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
    <div className="flex-none px-5 pt-1 pb-3.5">
      <div className="mb-2 text-[11px] font-extrabold text-gray-400">Preguntas sugeridas</div>
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <ThreadPrimitive.Suggestion key={q} prompt={q} clearComposer send asChild>
            <button
              type="button"
              className="cursor-pointer rounded-full border border-primary-bright/25 bg-white px-[13px] py-[7px] text-left text-xs font-bold text-primary-bright transition-colors enabled:hover:bg-primary-soft disabled:cursor-default disabled:opacity-60"
            >
              {q}
            </button>
          </ThreadPrimitive.Suggestion>
        ))}
      </div>
    </div>
  );
};

const QuironComposer: FC = () => {
  const tw = useTranslations("quiron.widget");
  return (
    <ComposerPrimitive.Root className="flex flex-none gap-2.5 border-t border-gray-100 px-5 pt-4 pb-5">
      <ComposerPrimitive.Input
        className="min-w-0 flex-1 resize-none rounded-xl border-[1.5px] border-gray-200 px-3.5 py-3 text-[13.5px] outline-none focus:border-primary-bright disabled:bg-gray-50 disabled:text-gray-400"
        autoFocus
        rows={1}
        placeholder={tw("placeholder")}
      />
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <button type="button" className={sendBtn} aria-label="Enviar">
            <Send size={16} />
          </button>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <button type="button" disabled className={sendBtn} aria-label="Enviar">
          <Bot size={16} />
        </button>
      </ThreadPrimitive.If>
    </ComposerPrimitive.Root>
  );
};
