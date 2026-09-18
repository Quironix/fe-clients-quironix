"use client";
import { InboundInvoiceEmail } from "@/services/inbound-invoice-emails";
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

export const ContactReviewBadge = ({
  email,
}: {
  email: InboundInvoiceEmail;
}) => (
  <QuironContactReviewBadge
    requiresContactReview={email.agent_requires_contact_review}
  />
);
