"use client";
import { useProfileContext } from "@/context/ProfileContext";
import { Send, Sparkles, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { MOCK_EXECUTIVE_SUMMARY } from "../../constants/mock-extras";
import { useExecutiveSummary } from "../../hooks/useDashboardAggregates";
import { useQuiron } from "./quiron-context";

const TOPIC_LABELS: Record<string, string> = {
  "cash-deviation": "la desviación de caja por fase",
  "aging-buckets": "el envejecimiento de cartera",
  "debtor-concentration": "la concentración de la mora",
  quironscore: "el Quironscore",
};

const topicMessage = (topic: string) => {
  const label = TOPIC_LABELS[topic] || topic.replace(/^kpi::/, "");
  return `Estoy listo para analizar ${label}. Esta función se conectará próximamente al motor de IA (BFF + backend).`;
};

const SUGGESTED_QUESTIONS = [
  "¿Qué deudores explican la mayor desviación de caja?",
  "¿Cuáles son mis compromisos más riesgosos esta semana?",
  "¿Qué acción prioritaria me recomiendas hoy?",
];

interface ChatTurn {
  role: "ai" | "user";
  text: string;
}

export const QuironWidget = () => {
  const { enabled, isOpen, topic, open, close } = useQuiron();
  const { session, profile } = useProfileContext();
  const accessToken = session?.token || "";
  const clientId = profile?.client?.id || "";

  const { data: realSummary } = useExecutiveSummary({
    accessToken,
    clientId,
    enabled: enabled && !!accessToken && !!clientId,
  });
  const summary = realSummary || MOCK_EXECUTIVE_SUMMARY;

  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTurns([]);
    setDraft("");
  }, [topic]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight });
  }, [turns, isOpen]);

  if (!enabled) return null;

  const isResumen = !topic || topic === "resumen";
  const introText = isResumen ? summary.text : topicMessage(topic as string);

  const sendText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTurns((prev) => [
      ...prev,
      { role: "user", text: trimmed },
      {
        role: "ai",
        text: `(Prototipo) En la versión final, Quirón analizaría tu cartera en tiempo real para responder: "${trimmed}".`,
      },
    ]);
    setDraft("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendText(draft);
  };

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
        <div className="qxv2-chat" ref={chatRef}>
          <div className="qxv2-bub ai">
            {introText}
            {isResumen && summary.actions.length > 0 && (
              <div className="qxv2-q-actions">
                {summary.actions.map((a) => (
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
          {turns.map((t, i) => (
            <div className={`qxv2-bub ${t.role}`} key={i}>
              {t.text}
            </div>
          ))}
        </div>
        <div className="qxv2-q-sug">
          <div className="qxv2-qs-label">Preguntas sugeridas</div>
          <div className="qxv2-qs-chips">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                type="button"
                className="qxv2-qs-chip"
                key={q}
                onClick={() => sendText(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
        <form className="qxv2-q-input" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Pregúntale a Quirón…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit" className="qxv2-q-send" aria-label="Enviar">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
