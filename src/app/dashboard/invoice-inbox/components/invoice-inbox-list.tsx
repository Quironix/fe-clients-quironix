"use client";
import { InvoiceInboxDetailSheet } from "@/app/dashboard/components/invoice-inbox-detail-sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfileContext } from "@/context/ProfileContext";
import {
  useInboundEmailReplies,
  useInboundInvoiceEmails,
} from "@/hooks/useInboundInvoiceEmails";
import { cn, formatDateTime } from "@/lib/utils";
import { InboundInvoiceEmail } from "@/services/inbound-invoice-emails";
import { type TrackEmailMessage } from "@/services/inbound-email-replies";
import { IconFile } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { IntentBadge } from "@/components/quiron/intent-badge";
import {
  AgentStatusBadge,
  ContactReviewBadge,
} from "@/components/quiron/agent-status-badge";
import { QuironMark } from "@/components/quiron/quiron-mark";
import {
  SECTIONS,
  isHandled,
  isPending,
  mergeRows,
  type SectionId,
  type UnifiedRow,
} from "@/app/dashboard/invoice-inbox/lib/unified-inbox";

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

  const rows = useMemo(
    () => mergeRows(finanzasEmails, cobranzaReplies),
    [finanzasEmails, cobranzaReplies],
  );

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
          {SECTIONS.map((item) => {
            const pending = rows.filter(
              (row) => item.inSection(row) && isPending(row),
            ).length;
            return (
              <TabsTrigger key={item.id} value={item.id}>
                {t(item.labelKey)}
                <span
                  className={cn(
                    "ml-2 rounded-full px-1.5 text-[10px] font-bold",
                    pending > 0
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-200 text-gray-400",
                  )}
                  title={t("pending_count", { count: pending })}
                >
                  {pending}
                </span>
              </TabsTrigger>
            );
          })}
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
        {visibleRows.map((row) => {
          const pending = isPending(row);
          return (
          <button
            key={row.key}
            type="button"
            onClick={() => handleOpenRow(row)}
            className={cn(
              "flex items-start justify-between gap-4 rounded-md border border-l-4 p-4 text-left hover:bg-gray-50",
              pending
                ? "border-l-red-500 bg-red-50/40"
                : "border-l-transparent",
            )}
          >
            <div className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 truncate font-medium">
                {pending && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                )}
                {isHandled(row) && row.agentStatus === "HANDLED_BY_AGENT" && (
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
          );
        })}
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
