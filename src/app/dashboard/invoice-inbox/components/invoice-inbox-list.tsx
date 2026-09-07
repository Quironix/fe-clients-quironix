"use client";
import { InvoiceInboxDetailSheet } from "@/app/dashboard/components/invoice-inbox-detail-sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfileContext } from "@/context/ProfileContext";
import { useInboundInvoiceEmails } from "@/hooks/useInboundInvoiceEmails";
import { cn, formatDateTime } from "@/lib/utils";
import {
  emailRoute,
  InboundInvoiceEmail,
  isEmailLinked,
} from "@/services/inbound-invoice-emails";
import { IconFile } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import {
  agentBadgeKind,
  AgentStatusBadge,
  ContactReviewBadge,
  IntentBadge,
} from "./inbox-badges";
import { QuironVerdict } from "@/components/quiron/quiron-verdict";
import {
  getInboundEmailReplies,
  type TrackEmailMessage,
} from "@/services/inbound-email-replies";

type SectionId = "MATCHING" | "AGENT" | "ALL";

interface SubFilter {
  id: string;
  labelKey: string;
  match: (email: InboundInvoiceEmail) => boolean;
}

interface Section {
  id: SectionId;
  labelKey: string;
  inSection: (email: InboundInvoiceEmail) => boolean;
  subs: SubFilter[];
}

const SECTIONS: Section[] = [
  {
    id: "MATCHING",
    labelKey: "section.matching",
    inSection: (email) => emailRoute(email) === "MATCHING",
    subs: [
      { id: "ALL", labelKey: "subfilter.all", match: () => true },
      {
        id: "LINKED",
        labelKey: "subfilter.auto_linked",
        match: (email) => isEmailLinked(email),
      },
      {
        id: "PENDING",
        labelKey: "subfilter.pending_review",
        match: (email) => !isEmailLinked(email),
      },
    ],
  },
  {
    id: "AGENT",
    labelKey: "section.agent",
    inSection: (email) => emailRoute(email) === "AGENT",
    subs: [
      { id: "ALL", labelKey: "subfilter.all", match: () => true },
      {
        id: "ANSWERED",
        labelKey: "subfilter.answered",
        match: (email) => agentBadgeKind(email) === "answered",
      },
      {
        id: "SUGGESTION",
        labelKey: "subfilter.suggestion",
        match: (email) => agentBadgeKind(email) === "suggestion",
      },
      {
        id: "REVIEW",
        labelKey: "subfilter.review",
        match: (email) => {
          const kind = agentBadgeKind(email);
          return (
            kind === "review" ||
            kind === "review_guardrail" ||
            (!kind && email.status === "PENDING_REVIEW")
          );
        },
      },
    ],
  },
  {
    id: "ALL",
    labelKey: "section.all",
    inSection: () => true,
    subs: [
      { id: "ALL", labelKey: "subfilter.all", match: () => true },
      {
        id: "PENDING",
        labelKey: "subfilter.pending",
        match: (email) => !isEmailLinked(email),
      },
      {
        id: "RESOLVED",
        labelKey: "subfilter.resolved",
        match: (email) => isEmailLinked(email),
      },
    ],
  },
];

const CobranzaChannelList = ({
  accessToken,
  clientId,
}: {
  accessToken: string;
  clientId: string;
}) => {
  const t = useTranslations("dashboard.invoice_inbox");
  const [messages, setMessages] = useState<TrackEmailMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getInboundEmailReplies(accessToken, clientId)
      .then((data) => {
        if (active) setMessages(data);
      })
      .catch(() => {
        if (active) setMessages([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [accessToken, clientId]);

  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        {t("loading")}
      </div>
    );
  }
  if (messages.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        {t("empty_filter")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => (
        <div key={message.id} className="rounded-md border p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span className="block truncate font-medium">
                {message.subject || t("no_subject")}
              </span>
              <p className="truncate text-xs text-muted-foreground">
                {message.from_address}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatDateTime(message.created_at)}
            </span>
          </div>
          {message.agent_status && (
            <div className="mt-3">
              <QuironVerdict
                compact
                intent={message.agent_category}
                confidence={message.agent_confidence}
                secondaryIntents={message.agent_secondary_intents}
                agentStatus={message.agent_status}
                guardrailTriggered={message.agent_guardrail_triggered}
                toolsUsed={message.agent_tools_used}
                summary={message.agent_summary}
                extracted={message.agent_extracted as Record<string, unknown>}
                combo={message.agent_combo}
                linkedTrackId={message.agent_management_track_id}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const InvoiceInboxList = () => {
  const { profile, session } = useProfileContext();
  const t = useTranslations("dashboard.invoice_inbox");
  const tq = useTranslations("quiron");

  const accessToken = session?.token as string;
  const clientId = profile?.client?.id as string;

  const [channel, setChannel] = useState<"FINANZAS" | "COBRANZA">("FINANZAS");
  const [sectionId, setSectionId] = useState<SectionId>("ALL");
  const [subId, setSubId] = useState("ALL");
  const [selectedEmail, setSelectedEmail] = useState<InboundInvoiceEmail | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: allEmails = [], isLoading } = useInboundInvoiceEmails(
    accessToken,
    clientId,
  );

  const inEmails = useMemo(
    () => allEmails.filter((email) => email.direction !== "OUT"),
    [allEmails],
  );

  const section = SECTIONS.find((item) => item.id === sectionId) ?? SECTIONS[0];
  const sub = section.subs.find((item) => item.id === subId) ?? section.subs[0];

  const emails = inEmails
    .filter((email) => section.inSection(email))
    .filter((email) => sub.match(email));

  const handleSelectSection = (id: SectionId) => {
    setSectionId(id);
    setSubId("ALL");
  };

  const handleOpenEmail = (email: InboundInvoiceEmail) => {
    setSelectedEmail(email);
    setDetailOpen(true);
  };

  if (!accessToken || !clientId) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setChannel("FINANZAS")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-semibold",
            channel === "FINANZAS"
              ? "border-blue-200 bg-blue-50 text-primary"
              : "border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200",
          )}
        >
          {tq("channel.finanzas")}
        </button>
        <button
          type="button"
          onClick={() => setChannel("COBRANZA")}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold",
            channel === "COBRANZA"
              ? "border-blue-200 bg-blue-50 text-primary"
              : "border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200",
          )}
        >
          {tq("channel.cobranza")}
        </button>
      </div>

      {channel === "COBRANZA" ? (
        <CobranzaChannelList accessToken={accessToken} clientId={clientId} />
      ) : (
        <>
      <Tabs
        value={sectionId}
        onValueChange={(value) => handleSelectSection(value as SectionId)}
      >
        <TabsList>
          {SECTIONS.map((item) => (
            <TabsTrigger key={item.id} value={item.id}>
              {t(item.labelKey)}
              <span className="ml-2 rounded-full bg-gray-200 px-1.5 text-[10px] font-bold text-gray-600">
                {inEmails.filter((email) => item.inSection(email)).length}
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

      {!isLoading && emails.length === 0 && (
        <div className="py-10 text-center text-sm text-muted-foreground">
          {t("empty_filter")}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {emails.map((email) => (
          <button
            key={email.id}
            type="button"
            onClick={() => handleOpenEmail(email)}
            className="flex items-start justify-between gap-4 rounded-md border p-4 text-left hover:bg-gray-50"
          >
            <div className="min-w-0 flex-1">
              <span className="block truncate font-medium">
                {email.subject || t("no_subject")}
              </span>
              <p className="truncate text-xs text-muted-foreground">
                {email.from_address}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <IntentBadge intent={email.intent} />
                <AgentStatusBadge email={email} />
                <ContactReviewBadge email={email} />
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5 text-sm text-muted-foreground">
              <span className="text-xs">{formatDateTime(email.created_at)}</span>
              {email.attachments.length > 0 && (
                <span className="flex items-center gap-1 text-xs">
                  <IconFile className="h-3.5 w-3.5" />
                  {email.attachments.length}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <InvoiceInboxDetailSheet
        email={selectedEmail}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
        </>
      )}
    </div>
  );
};
