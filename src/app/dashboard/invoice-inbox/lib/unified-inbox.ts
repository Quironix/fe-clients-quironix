import {
  emailRoute,
  InboundInvoiceEmail,
  isEmailLinked,
} from "@/services/inbound-invoice-emails";
import { type TrackEmailMessage } from "@/services/inbound-email-replies";
import {
  agentBadgeKind,
  type AgentBadgeKind,
} from "@/components/quiron/agent-status-badge";

// Una sola fila de la bandeja de correos, sin importar de qué canal viene
// (inbound-invoice-emails de finanzas o inbound-email-replies de cobranza+).
export interface UnifiedRow {
  key: string;
  origin: "FINANZAS" | "COBRANZA";
  subject: string | null;
  fromAddress: string;
  createdAt: string;
  attachmentsCount: number;
  intent: string | null;
  agentStatus: string | null;
  guardrailTriggered: boolean | null;
  suggestedReply: string | null;
  requiresContactReview: boolean | null;
  route: "MATCHING" | "AGENT";
  isLinked: boolean;
  resolvedAt: string | null;
  debtorId: string | null;
  finanzas?: InboundInvoiceEmail;
  cobranza?: TrackEmailMessage;
}

export const fromFinanzas = (email: InboundInvoiceEmail): UnifiedRow => ({
  key: `f-${email.id}`,
  origin: "FINANZAS",
  subject: email.subject,
  fromAddress: email.from_address,
  createdAt: email.created_at,
  attachmentsCount: email.attachments?.length ?? 0,
  intent: email.intent ?? null,
  agentStatus: email.agent_status ?? null,
  guardrailTriggered: email.agent_guardrail_triggered ?? null,
  suggestedReply: email.agent_suggested_reply ?? null,
  requiresContactReview: email.agent_requires_contact_review ?? null,
  route: emailRoute(email) === "MATCHING" ? "MATCHING" : "AGENT",
  isLinked: isEmailLinked(email),
  resolvedAt: email.resolved_at ?? null,
  debtorId: email.debtor_id ?? null,
  finanzas: email,
});

export const fromCobranza = (message: TrackEmailMessage): UnifiedRow => ({
  key: `c-${message.id}`,
  origin: "COBRANZA",
  subject: message.subject ?? null,
  fromAddress: message.from_address,
  createdAt: message.created_at,
  attachmentsCount: message.attachments?.length ?? 0,
  intent: message.agent_category ?? null,
  agentStatus: message.agent_status ?? null,
  guardrailTriggered: message.agent_guardrail_triggered ?? null,
  suggestedReply: message.agent_suggested_reply ?? null,
  requiresContactReview: message.agent_requires_contact_review ?? null,
  route:
    message.agent_category === "CONFIRMA_PAGO_CON_COMPROBANTE"
      ? "MATCHING"
      : "AGENT",
  isLinked: Boolean(message.agent_management_track_id),
  resolvedAt: message.resolved_at ?? null,
  debtorId: message.debtor_id ?? null,
  cobranza: message,
});

export const mergeRows = (
  finanzasEmails: InboundInvoiceEmail[],
  cobranzaReplies: TrackEmailMessage[],
): UnifiedRow[] =>
  [
    ...finanzasEmails
      .filter((email) => email.direction !== "OUT")
      .map(fromFinanzas),
    ...cobranzaReplies.map(fromCobranza),
  ].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

export const rowBadgeKind = (row: UnifiedRow): AgentBadgeKind =>
  agentBadgeKind({
    agentStatus: row.agentStatus,
    guardrailTriggered: row.guardrailTriggered,
    suggestedReply: row.suggestedReply,
  });

// Cómo quedó resuelto el correo:
//  - "pending": el ejecutivo todavía tiene que hacer algo.
//  - "auto":    lo resolvió el sistema — la cascada matcheó el deudor
//    (comprobante -> conciliación automática) o Quirón creó la gestión.
//  - "manual":  el ejecutivo lo vinculó / cerró a mano.
// Para un comprobante, matchear el deudor lo resuelve. Para el resto (consultas,
// solicitudes, disputas) matchear NO resuelve nada: solo cuenta si Quirón creó
// la gestión o el ejecutivo lo marcó.
export type ResolutionKind = "pending" | "auto" | "manual";

export const resolutionKind = (row: UnifiedRow): ResolutionKind => {
  if (row.resolvedAt) return "manual";
  if (row.origin === "FINANZAS" && row.route === "MATCHING") {
    if (row.finanzas?.status === "MATCHED") return "auto";
    if (row.finanzas?.status === "LINKED") return "manual";
    return "pending";
  }
  return row.agentStatus === "HANDLED_BY_AGENT" ? "auto" : "pending";
};

export const isHandled = (row: UnifiedRow) =>
  resolutionKind(row) !== "pending";
export const isPending = (row: UnifiedRow) =>
  resolutionKind(row) === "pending";

export type SectionId = "MATCHING" | "AGENT" | "ALL";

export interface SubFilter {
  id: string;
  labelKey: string;
  match: (row: UnifiedRow) => boolean;
}

export interface Section {
  id: SectionId;
  labelKey: string;
  inSection: (row: UnifiedRow) => boolean;
  subs: SubFilter[];
}

// Orden de izquierda a derecha: primero los estados accionables, "Todos" al final.
export const SECTIONS: Section[] = [
  {
    id: "MATCHING",
    labelKey: "section.matching",
    inSection: (row) => row.route === "MATCHING",
    subs: [
      { id: "PENDING", labelKey: "subfilter.pending_review", match: isPending },
      {
        id: "AUTO",
        labelKey: "subfilter.auto_matched",
        match: (row) => resolutionKind(row) === "auto",
      },
      {
        id: "MANUAL",
        labelKey: "subfilter.manual_linked",
        match: (row) => resolutionKind(row) === "manual",
      },
      { id: "ALL", labelKey: "subfilter.all", match: () => true },
    ],
  },
  {
    id: "AGENT",
    labelKey: "section.agent",
    inSection: (row) => row.route === "AGENT",
    subs: [
      {
        id: "REVIEW",
        labelKey: "subfilter.pending_review",
        match: (row) => isPending(row) && rowBadgeKind(row) !== "suggestion",
      },
      {
        id: "SUGGESTION",
        labelKey: "subfilter.suggestion",
        match: (row) => rowBadgeKind(row) === "suggestion",
      },
      { id: "ANSWERED", labelKey: "subfilter.answered", match: isHandled },
      { id: "ALL", labelKey: "subfilter.all", match: () => true },
    ],
  },
  {
    id: "ALL",
    labelKey: "section.all",
    inSection: () => true,
    subs: [
      { id: "PENDING", labelKey: "subfilter.pending", match: isPending },
      { id: "RESOLVED", labelKey: "subfilter.resolved", match: isHandled },
      { id: "ALL", labelKey: "subfilter.all", match: () => true },
    ],
  },
];
