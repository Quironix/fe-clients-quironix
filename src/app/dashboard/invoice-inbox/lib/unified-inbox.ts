import {
  emailRoute,
  InboundInvoiceEmail,
  isEmailLinked,
} from "@/services/inbound-invoice-emails";
import { type TrackEmailMessage } from "@/services/inbound-email-replies";

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

// La bandeja es una sola lista: comprobantes y gestiones mezclados, ordenados
// por fecha. Los dos únicos filtros miran el estado del correo, no su ruta.
export type InboxFilterId = "PENDING" | "ALL";

export interface InboxFilter {
  id: InboxFilterId;
  labelKey: string;
  match: (row: UnifiedRow) => boolean;
}

export const INBOX_FILTERS: InboxFilter[] = [
  { id: "PENDING", labelKey: "filter.unhandled", match: isPending },
  { id: "ALL", labelKey: "filter.all", match: () => true },
];
