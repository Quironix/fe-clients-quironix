"use client";
import { InvoiceInboxDetail } from "@/app/dashboard/components/invoice-inbox-detail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfileContext } from "@/context/ProfileContext";
import {
  useInboundEmailReplies,
  useInboundInvoiceEmails,
  useSentEmails,
} from "@/hooks/useInboundInvoiceEmails";
import { cn } from "@/lib/utils";
import useDebounce from "@/app/dashboard/hooks/useDebounce";
import {
  IconChevronDown,
  IconChevronUp,
  IconFile,
  IconSearch,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { IntentBadge } from "@/components/quiron/intent-badge";
import {
  AgentStatusBadge,
  ContactReviewBadge,
} from "@/components/quiron/agent-status-badge";
import { QuironIcon } from "@/components/quiron/quiron-icon";
import { SentByBadge } from "@/app/dashboard/invoice-inbox/components/inbox-badges";
import {
  INBOX_FILTERS,
  isHandled,
  isSent,
  isPending,
  mergeRows,
  shortDate,
  type InboxFilterId,
} from "@/app/dashboard/invoice-inbox/lib/unified-inbox";

const SEARCH_DEBOUNCE_MS = 300;
// Igual que el servidor: con menos no hay búsqueda indexada.
const SEARCH_MIN_LENGTH = 3;
const SENT_PAGE_SIZE = 100;

export const InvoiceInboxList = () => {
  const { profile, session } = useProfileContext();
  const t = useTranslations("dashboard.invoice_inbox");

  const accessToken = session?.token as string;
  const clientId = profile?.client?.id as string;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS);
  const searchTerm =
    debouncedSearch.length >= SEARCH_MIN_LENGTH ? debouncedSearch : undefined;
  const [filterId, setFilterId] = useState<InboxFilterId>("ALL");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const { data: finanzasEmails = [], isLoading: loadingFinanzas } =
    useInboundInvoiceEmails(accessToken, clientId, undefined, searchTerm);
  const { data: cobranzaReplies = [], isLoading: loadingCobranza } =
    useInboundEmailReplies(accessToken, clientId, searchTerm);

  const [sentLimit, setSentLimit] = useState(SENT_PAGE_SIZE);
  const {
    data: sentEmails = [],
    isLoading: loadingSent,
    isFetching: fetchingSent,
  } = useSentEmails(accessToken, clientId, searchTerm, sentLimit);
  const hasMoreSent = filterId !== "PENDING" && sentEmails.length >= sentLimit;

  const rows = useMemo(
    () => mergeRows(finanzasEmails, [...cobranzaReplies, ...sentEmails]),
    [finanzasEmails, cobranzaReplies, sentEmails],
  );

  const isLoading = loadingFinanzas || loadingCobranza || loadingSent;

  const filter =
    INBOX_FILTERS.find((item) => item.id === filterId) ?? INBOX_FILTERS[0];

  const visibleRows = rows.filter((row) => filter.match(row));
  const selectedRow =
    visibleRows.find((row) => row.key === selectedKey) ?? visibleRows[0];
  const selectedIndex = visibleRows.indexOf(selectedRow);

  const selectNextPending = () => {
    const nextPending = [
      ...visibleRows.slice(selectedIndex + 1),
      ...visibleRows.slice(0, selectedIndex),
    ].find(isPending);
    if (nextPending) setSelectedKey(nextPending.key);
  };

  if (!accessToken || !clientId) return null;

  return (
    <div className="flex flex-col lg:h-[calc(100vh-13.5rem)] lg:min-h-[24rem]">
      <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
        <Tabs
          value={filterId}
          onValueChange={(value) => setFilterId(value as InboxFilterId)}
        >
          <TabsList>
            {INBOX_FILTERS.map((item) => {
              const count = rows.filter((row) => item.match(row)).length;
              const highlight = item.id === "PENDING" && count > 0;
              return (
                <TabsTrigger key={item.id} value={item.id} className="px-3">
                  {t(item.labelKey)}
                  {item.id !== "SENT" && (
                    <span
                      className={cn(
                        "ml-2 rounded-full px-1.5 text-[10px] font-bold",
                        highlight
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-200 text-gray-600",
                      )}
                    >
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
        <div className="relative min-w-0 flex-[1_1_280px]">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("search_placeholder")}
            aria-label={t("search_placeholder")}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex max-h-[45vh] flex-col overflow-y-auto border-b lg:max-h-none lg:w-[380px] lg:shrink-0 lg:border-r lg:border-b-0">
          {isLoading && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              {t("loading")}
            </div>
          )}

          {!isLoading && visibleRows.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              {searchTerm
                ? t("empty_search")
                : filterId === "SENT"
                  ? t("sent.empty")
                  : t("empty_filter")}
            </div>
          )}

          {visibleRows.map((row) => {
            const pending = isPending(row);
            const selected = row === selectedRow;
            return (
              <button
                key={row.key}
                type="button"
                onClick={() => setSelectedKey(row.key)}
                aria-current={selected}
                className={cn(
                  "flex w-full flex-col gap-1 border-b border-l-4 py-3 pr-4 pl-3 text-left text-sm",
                  pending
                    ? "border-l-red-500"
                    : selected
                      ? "border-l-primary"
                      : "border-l-transparent",
                  selected
                    ? "bg-blue-50"
                    : pending
                      ? "bg-red-50/60 hover:bg-red-50"
                      : "hover:bg-gray-50",
                )}
              >
                <span className="flex w-full items-center gap-2">
                  {pending && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  )}
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-[13px]",
                      pending ? "font-bold" : "font-medium",
                    )}
                  >
                    {isSent(row)
                      ? `${t("sent.to")}: ${(row.cobranza?.to_addresses ?? []).join(", ")}`
                      : row.fromAddress}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {shortDate(row.createdAt)}
                  </span>
                </span>
                <span className="flex w-full items-center gap-1.5">
                  {isHandled(row) && row.agentStatus === "HANDLED_BY_AGENT" && (
                    <QuironIcon label="Quirón" />
                  )}
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {row.subject || t("no_subject")}
                  </span>
                </span>
                {row.snippet && (
                  <span className="block w-full truncate text-xs text-muted-foreground">
                    {row.snippet}
                  </span>
                )}
                <span className="mt-1 flex w-full items-center gap-1.5">
                  <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                    {row.cobranza && <SentByBadge message={row.cobranza} />}
                    <IntentBadge intent={row.intent} />
                    <AgentStatusBadge
                      agentStatus={row.agentStatus}
                      guardrailTriggered={row.guardrailTriggered}
                      suggestedReply={row.suggestedReply}
                    />
                    <ContactReviewBadge
                      requiresContactReview={row.requiresContactReview}
                    />
                  </span>
                  {row.attachmentsCount > 0 && (
                    <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <IconFile className="h-3.5 w-3.5" />
                      {row.attachmentsCount}
                    </span>
                  )}
                </span>
              </button>
            );
          })}

          {hasMoreSent && (
            <Button
              variant="outline"
              className="m-3 self-center"
              disabled={fetchingSent}
              onClick={() => setSentLimit((limit) => limit + SENT_PAGE_SIZE)}
            >
              {t("sent.load_more")}
            </Button>
          )}
        </div>

        {selectedRow && (
          <div key={selectedRow.key} className="min-w-0 flex-1 overflow-y-auto">
            <InvoiceInboxDetail
              email={selectedRow.finanzas ?? null}
              cobranza={selectedRow.cobranza ?? null}
              onAction={(action) => {
                if (action === "resolved") selectNextPending();
              }}
              navigation={
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={t("previous_email")}
                    disabled={selectedIndex === 0}
                    onClick={() =>
                      setSelectedKey(visibleRows[selectedIndex - 1].key)
                    }
                  >
                    <IconChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={t("next_email")}
                    disabled={selectedIndex === visibleRows.length - 1}
                    onClick={() =>
                      setSelectedKey(visibleRows[selectedIndex + 1].key)
                    }
                  >
                    <IconChevronDown className="h-4 w-4" />
                  </Button>
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {t("position", {
                      current: selectedIndex + 1,
                      total: visibleRows.length,
                    })}
                  </span>
                </div>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};
