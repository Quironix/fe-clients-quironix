"use client";
import { cn } from "@/lib/utils";
import {
  InboundEmailIntent,
  InboundInvoiceEmail,
} from "@/services/inbound-invoice-emails";
import { useTranslations } from "next-intl";

const INTENT_STYLE: Record<InboundEmailIntent, string> = {
  COMPROBANTE_PAGO: "bg-blue-50 text-blue-700",
  SOLICITUD_FACTURA: "bg-violet-100 text-violet-700",
  CONSULTA_DATOS_DE_PAGO: "bg-teal-100 text-teal-700",
  ACUSE_RECIBO_SIN_ACCION: "bg-slate-100 text-slate-600",
  CONTACTO_NO_VIGENTE: "bg-amber-100 text-amber-700",
  COMPROMISO_PAGO: "bg-emerald-100 text-emerald-700",
  OTRA: "bg-red-100 text-red-700",
};

const BADGE_BASE =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap";

export type AgentBadgeKind =
  | "answered"
  | "suggestion"
  | "review_guardrail"
  | "review"
  | "matching"
  | null;

export const agentBadgeKind = (email: InboundInvoiceEmail): AgentBadgeKind => {
  if (email.agent_status === "HANDLED_BY_AGENT") return "answered";
  if (email.agent_status === "ROUTED_TO_MATCHING") return "matching";
  if (email.agent_status === "ESCALATED_TO_HUMAN") {
    if (email.agent_guardrail_triggered) return "review_guardrail";
    if (email.agent_suggested_reply) return "suggestion";
    return "review";
  }
  return null;
};

const AGENT_STYLE: Record<Exclude<AgentBadgeKind, null>, string> = {
  answered: "bg-emerald-100 text-emerald-700",
  suggestion: "bg-amber-100 text-amber-700",
  review_guardrail: "bg-red-100 text-red-700",
  review: "bg-red-100 text-red-700",
  matching: "bg-slate-100 text-slate-600",
};

export const IntentBadge = ({
  intent,
}: {
  intent?: InboundEmailIntent | null;
}) => {
  const t = useTranslations("dashboard.invoice_inbox");
  if (!intent) return null;
  const code = intent;
  return (
    <span className={cn(BADGE_BASE, INTENT_STYLE[code])}>
      {t(`intent.${code}`)}
    </span>
  );
};

export const AgentStatusBadge = ({ email }: { email: InboundInvoiceEmail }) => {
  const t = useTranslations("dashboard.invoice_inbox");
  const kind = agentBadgeKind(email);
  if (!kind) return null;
  return (
    <span className={cn(BADGE_BASE, AGENT_STYLE[kind])}>{t(`agent.${kind}`)}</span>
  );
};

export const ContactReviewBadge = ({
  email,
}: {
  email: InboundInvoiceEmail;
}) => {
  const t = useTranslations("dashboard.invoice_inbox");
  if (!email.agent_requires_contact_review) return null;
  return (
    <span className={cn(BADGE_BASE, "bg-yellow-100 text-yellow-800")}>
      {t("agent.contact_review")}
    </span>
  );
};
