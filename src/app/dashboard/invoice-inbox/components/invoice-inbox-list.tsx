"use client";
import { InvoiceInboxDetailSheet } from "@/app/dashboard/components/invoice-inbox-detail-sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfileContext } from "@/context/ProfileContext";
import {
  useInboundEmailReplies,
  useInboundInvoiceEmails,
} from "@/hooks/useInboundInvoiceEmails";
import { cn, formatDateTime } from "@/lib/utils";
import {
  emailRoute,
  InboundInvoiceEmail,
  isEmailLinked,
} from "@/services/inbound-invoice-emails";
import { type TrackEmailMessage } from "@/services/inbound-email-replies";
import { IconFile } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { IntentBadge } from "@/components/quiron/intent-badge";
import {
  AgentStatusBadge,
  ContactReviewBadge,
  agentBadgeKind,
  type AgentBadgeKind,
} from "@/components/quiron/agent-status-badge";
import { QuironMark } from "@/components/quiron/quiron-mark";

interface UnifiedRow {
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
  debtorId: string | null;
  finanzas?: InboundInvoiceEmail;
  cobranza?: TrackEmailMessage;
}

const fromFinanzas = (email: InboundInvoiceEmail): UnifiedRow => ({
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
  debtorId: email.debtor_id ?? null,
  finanzas: email,
});

const fromCobranza = (message: TrackEmailMessage): UnifiedRow => ({
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
  debtorId: message.debtor_id ?? null,
  cobranza: message,
});

const rowBadgeKind = (row: UnifiedRow): AgentBadgeKind =>
  agentBadgeKind({
    agentStatus: row.agentStatus,
    guardrailTriggered: row.guardrailTriggered,
    suggestedReply: row.suggestedReply,
  });

const isReview = (row: UnifiedRow) => {
  const kind = rowBadgeKind(row);
  return (
    kind === "review" ||
    kind === "review_guardrail" ||
    (!kind && row.origin === "FINANZAS" && !row.isLinked)
  );
};

type SectionId = "MATCHING" | "AGENT" | "ALL";

interface SubFilter {
  id: string;
  labelKey: string;
  match: (row: UnifiedRow) => boolean;
}

interface Section {
  id: SectionId;
  labelKey: string;
  inSection: (row: UnifiedRow) => boolean;
  subs: SubFilter[];
}

// Orden de izquierda a derecha: primero los estados accionables, "Todos" al final.
const SECTIONS: Section[] = [
  {
    id: "MATCHING",
    labelKey: "section.matching",
    inSection: (row) => row.route === "MATCHING",
    subs: [
      {
        id: "PENDING",
        labelKey: "subfilter.pending_review",
        match: (row) => !row.isLinked,
      },
      {
        id: "LINKED",
        labelKey: "subfilter.auto_linked",
        match: (row) => row.isLinked,
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
        match: isReview,
      },
      {
        id: "SUGGESTION",
        labelKey: "subfilter.suggestion",
        match: (row) => rowBadgeKind(row) === "suggestion",
      },
      {
        id: "ANSWERED",
        labelKey: "subfilter.answered",
        match: (row) => rowBadgeKind(row) === "answered",
      },
      { id: "ALL", labelKey: "subfilter.all", match: () => true },
    ],
  },
  {
    id: "ALL",
    labelKey: "section.all",
    inSection: () => true,
    subs: [
      {
        id: "PENDING",
        labelKey: "subfilter.pending",
        match: (row) => !row.isLinked,
      },
      {
        id: "RESOLVED",
        labelKey: "subfilter.resolved",
        match: (row) => row.isLinked,
      },
      { id: "ALL", labelKey: "subfilter.all", match: () => true },
    ],
  },
];

export const InvoiceInboxList = () => {
  const { profile, session } = useProfileContext();
  const t = useTranslations("dashboard.invoice_inbox");

  const accessToken = session?.token as string;
  const clientId = profile?.client?.id as string;

  const [sectionId, setSectionId] = useState<SectionId>("ALL");
  const [subId, setSubId] = useState(
    () => SECTIONS.find((s) => s.id === "ALL")!.subs[0].id,
  );
  const [selectedEmail, setSelectedEmail] = useState<InboundInvoiceEmail | null>(
    null,
  );
  const [selectedCobranza, setSelectedCobranza] =
    useState<TrackEmailMessage | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: finanzasEmails = [], isLoading: loadingFinanzas } =
    useInboundInvoiceEmails(accessToken, clientId);
  const { data: cobranzaReplies = [], isLoading: loadingCobranza } =
    useInboundEmailReplies(accessToken, clientId);

  const rows = useMemo(() => {
    const merged = [
      ...finanzasEmails
        .filter((email) => email.direction !== "OUT")
        .map(fromFinanzas),
      ...cobranzaReplies.map(fromCobranza),
    ];
    return merged.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [finanzasEmails, cobranzaReplies]);

  const isLoading = loadingFinanzas || loadingCobranza;

  const section = SECTIONS.find((item) => item.id === sectionId) ?? SECTIONS[0];
  const sub = section.subs.find((item) => item.id === subId) ?? section.subs[0];

  const visibleRows = rows
    .filter((row) => section.inSection(row))
    .filter((row) => sub.match(row));

  const handleSelectSection = (id: SectionId) => {
    setSectionId(id);
    const next = SECTIONS.find((s) => s.id === id) ?? SECTIONS[0];
    setSubId(next.subs[0].id);
  };

  const handleOpenRow = (row: UnifiedRow) => {
    if (row.origin === "FINANZAS" && row.finanzas) {
      setSelectedCobranza(null);
      setSelectedEmail(row.finanzas);
    } else if (row.cobranza) {
      setSelectedEmail(null);
      setSelectedCobranza(row.cobranza);
    } else {
      return;
    }
    setDetailOpen(true);
  };

  if (!accessToken || !clientId) return null;

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={sectionId}
        onValueChange={(value) => handleSelectSection(value as SectionId)}
      >
        <TabsList>
          {SECTIONS.map((item) => (
            <TabsTrigger key={item.id} value={item.id}>
              {t(item.labelKey)}
              <span className="ml-2 rounded-full bg-gray-200 px-1.5 text-[10px] font-bold text-gray-600">
                {rows.filter((row) => item.inSection(row)).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center gap-2">
        {section.subs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSubId(item.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold",
              subId === item.id
                ? "border-blue-200 bg-blue-50 text-primary"
                : "border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            {t(item.labelKey)}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="py-10 text-center text-sm text-muted-foreground">
          {t("loading")}
        </div>
      )}

      {!isLoading && visibleRows.length === 0 && (
        <div className="py-10 text-center text-sm text-muted-foreground">
          {t("empty_filter")}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {visibleRows.map((row) => (
          <button
            key={row.key}
            type="button"
            onClick={() => handleOpenRow(row)}
            className="flex items-start justify-between gap-4 rounded-md border p-4 text-left hover:bg-gray-50"
          >
            <div className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 truncate font-medium">
                {(row.agentStatus === "HANDLED_BY_AGENT" ||
                  row.agentStatus === "SHADOW_ONLY") && (
                  <QuironMark size="sm" />
                )}
                <span className="truncate">
                  {row.subject || t("no_subject")}
                </span>
              </span>
              <p className="truncate text-xs text-muted-foreground">
                {row.fromAddress}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <IntentBadge intent={row.intent} />
                <AgentStatusBadge
                  agentStatus={row.agentStatus}
                  guardrailTriggered={row.guardrailTriggered}
                  suggestedReply={row.suggestedReply}
                />
                <ContactReviewBadge
                  requiresContactReview={row.requiresContactReview}
                />
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5 text-sm text-muted-foreground">
              <span className="text-xs">{formatDateTime(row.createdAt)}</span>
              {row.attachmentsCount > 0 && (
                <span className="flex items-center gap-1 text-xs">
                  <IconFile className="h-3.5 w-3.5" />
                  {row.attachmentsCount}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <InvoiceInboxDetailSheet
        email={selectedEmail}
        cobranza={selectedCobranza}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
};
