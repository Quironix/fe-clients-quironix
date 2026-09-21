"use client";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export type AgentBadgeKind =
  | "answered"
  | "suggestion"
  | "review_guardrail"
  | "review"
  | "matching"
  | "shadow"
  | null;

interface AgentStatusInput {
  agentStatus?: string | null;
  guardrailTriggered?: boolean | null;
  suggestedReply?: string | null;
}

export const agentBadgeKind = ({
  agentStatus,
  guardrailTriggered,
  suggestedReply,
}: AgentStatusInput): AgentBadgeKind => {
  if (agentStatus === "HANDLED_BY_AGENT") return "answered";
  // PRD_07 O7 — ROUTED_TO_MATCHING deja de mostrarse: nombra lo que el sistema
  // intentó, no lo que pasó. El backend lo sigue guardando (NO6).
  if (agentStatus === "SHADOW_ONLY") return "shadow";
  if (agentStatus === "ESCALATED_TO_HUMAN") {
    if (guardrailTriggered) return "review_guardrail";
    if (suggestedReply) return "suggestion";
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
  shadow: "bg-slate-100 text-slate-500",
};

const BADGE_BASE =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap";

export const AgentStatusBadge = ({
  agentStatus,
  guardrailTriggered,
  suggestedReply,
  className,
}: AgentStatusInput & { className?: string }) => {
  const t = useTranslations("dashboard.invoice_inbox");
  const kind = agentBadgeKind({
    agentStatus,
    guardrailTriggered,
    suggestedReply,
  });
  if (!kind) return null;
  return (
    <span className={cn(BADGE_BASE, AGENT_STYLE[kind], className)}>
      {t(`agent.${kind}`)}
    </span>
  );
};

export const ContactReviewBadge = ({
  requiresContactReview,
  className,
}: {
  requiresContactReview?: boolean | null;
  className?: string;
}) => {
  const t = useTranslations("dashboard.invoice_inbox");
  if (!requiresContactReview) return null;
  return (
    <span className={cn(BADGE_BASE, "bg-yellow-100 text-yellow-800", className)}>
      {t("agent.contact_review")}
    </span>
  );
};

export default AgentStatusBadge;
