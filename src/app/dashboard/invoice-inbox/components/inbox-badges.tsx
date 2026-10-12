"use client";
import { sentBy } from "@/app/dashboard/invoice-inbox/lib/unified-inbox";
import { type TrackEmailMessage } from "@/services/inbound-email-replies";
import { InboundInvoiceEmail } from "@/services/inbound-invoice-emails";
import { useTranslations } from "next-intl";
import {
  AgentStatusBadge as QuironAgentStatusBadge,
  ContactReviewBadge as QuironContactReviewBadge,
  agentBadgeKind as quironAgentBadgeKind,
  type AgentBadgeKind,
} from "@/components/quiron/agent-status-badge";

export { IntentBadge } from "@/components/quiron/intent-badge";
export type { AgentBadgeKind };

export const agentBadgeKind = (email: InboundInvoiceEmail): AgentBadgeKind =>
  quironAgentBadgeKind({
    agentStatus: email.agent_status,
    guardrailTriggered: email.agent_guardrail_triggered,
    suggestedReply: email.agent_suggested_reply,
  });

export const AgentStatusBadge = ({ email }: { email: InboundInvoiceEmail }) => (
  <QuironAgentStatusBadge
    agentStatus={email.agent_status}
    guardrailTriggered={email.agent_guardrail_triggered}
    suggestedReply={email.agent_suggested_reply}
  />
);

export const SentByBadge = ({ message }: { message: TrackEmailMessage }) => {
  const t = useTranslations("dashboard.invoice_inbox.sent");
  const kind = sentBy(message);
  if (!kind) return null;

  return (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
      {(kind === "EXECUTIVE" && message.sent_by_executive_name) || t(kind)}
    </span>
  );
};

export const ContactReviewBadge = ({
  email,
}: {
  email: InboundInvoiceEmail;
}) => (
  <QuironContactReviewBadge
    requiresContactReview={email.agent_requires_contact_review}
  />
);
