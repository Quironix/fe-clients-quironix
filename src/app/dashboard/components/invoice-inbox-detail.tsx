"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfileContext } from "@/context/ProfileContext";
import { useDebtor, useDebtors } from "@/hooks/useDebtors";
import {
  useLinkInboundInvoiceEmail,
  useResolveInboundEmail,
} from "@/hooks/useInboundInvoiceEmails";
import { SentByBadge } from "@/app/dashboard/invoice-inbox/components/inbox-badges";
import { EmailOriginal } from "@/components/email/email-original";
import { QuironVerdict } from "@/components/quiron/quiron-verdict";
import {
  AgentStatusBadge,
  ContactReviewBadge,
} from "@/components/quiron/agent-status-badge";
import { IntentBadge } from "@/components/quiron/intent-badge";
import { useRouter } from "next/navigation";
import {
  InboundInvoiceEmail,
  emailRoute,
  isEmailLinked,
} from "@/services/inbound-invoice-emails";
import { type TrackEmailMessage } from "@/services/inbound-email-replies";
import {
  IconFile,
  IconCheck,
  IconChevronDown,
  IconCircleCheck,
  IconDownload,
  IconMessage,
} from "@tabler/icons-react";
import { cn, formatDateTime } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

type InboxDetailAction = "resolved" | "reopened" | "linked" | "navigated";

interface InvoiceInboxDetailProps {
  email: InboundInvoiceEmail | null;
  cobranza?: TrackEmailMessage | null;
  navigation?: ReactNode;
  onAction?: (action: InboxDetailAction) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const InvoiceInboxDetail = ({
  email,
  cobranza,
  navigation,
  onAction,
}: InvoiceInboxDetailProps) => {
  const { profile, session } = useProfileContext();
  const t = useTranslations("dashboard.invoice_inbox");
  const tq = useTranslations("quiron");
  const router = useRouter();

  const accessToken = session?.token as string;
  const clientId = profile?.client?.id as string;

  const [debtorPickerOpen, setDebtorPickerOpen] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<
    { id: string; name: string; debtor_code: string } | null
  >(null);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const { debtors, handleSearchChange, isLoading: isSearchingDebtors } =
    useDebtors({ accessToken, clientId, initialLimit: 8 });

  const isLinked = email ? isEmailLinked(email) : false;
  const isAutoMatched = email?.status === "MATCHED";

  // El deudor que Quirón resolvió: en cobranza+ siempre viene (es un hilo de un
  // deudor); en finanzas se setea cuando el agente lo matcheó (aunque no se
  // haya persistido la gestión — p.ej. modo sombra).
  const resolvedDebtorId = email?.debtor_id ?? cobranza?.debtor_id ?? null;

  const { data: linkedDebtor, isLoading: isLoadingLinkedDebtor } = useDebtor({
    accessToken,
    clientId,
    debtorId: resolvedDebtorId,
  });

  const linkMutation = useLinkInboundInvoiceEmail(accessToken, clientId);
  const resolveMutation = useResolveInboundEmail(accessToken, clientId);

  useEffect(() => {
    setIsEditingLink(false);
    setSelectedDebtor(null);
    setShowOriginal(false);
  }, [email?.id, cobranza?.id]);

  const view = email
    ? {
        kind: "FINANZAS" as const,
        id: email.id,
        resolvedAt: email.resolved_at ?? null,
        autoHandled:
          emailRoute(email) === "MATCHING"
            ? isEmailLinked(email)
            : email.agent_status === "HANDLED_BY_AGENT",
        // Un comprobante de finanzas se resuelve encontrando el deudor
        // (matching), no con el botón "Marcar como gestionado".
        needsMatching:
          emailRoute(email) === "MATCHING" && !isEmailLinked(email),
        subject: email.subject,
        from: email.from_address,
        createdAt: email.created_at,
        intent: email.intent ?? null,
        confidence: email.intent_confidence ?? email.agent_confidence ?? null,
        secondary: email.intent_secondary ?? null,
        agentStatus: email.agent_status ?? null,
        guardrail: email.agent_guardrail_triggered ?? null,
        summary: email.agent_summary ?? null,
        extracted: email.agent_extracted ?? null,
        combo: email.agent_combo ?? null,
        linkedTrackId: email.linked_track_id ?? null,
        suggestedReply: email.agent_suggested_reply ?? null,
        shadowPayload: email.agent_shadow_payload ?? null,
        contactReview: email.agent_requires_contact_review ?? null,
        body: email.body_text ?? null,
        hasOriginal: !!email.body_html,
        attachments: email.attachments ?? [],
        debtorId: email.debtor_id ?? null,
      }
    : cobranza
      ? {
          kind: "COBRANZA" as const,
          id: cobranza.id,
          resolvedAt: cobranza.resolved_at ?? null,
          autoHandled: cobranza.agent_status === "HANDLED_BY_AGENT",
          needsMatching: false,
          subject: cobranza.subject ?? null,
          from: cobranza.from_address,
          createdAt: cobranza.created_at,
          intent: cobranza.agent_category ?? null,
          confidence: cobranza.agent_confidence ?? null,
          secondary: cobranza.agent_secondary_intents ?? null,
          agentStatus: cobranza.agent_status ?? null,
          guardrail: cobranza.agent_guardrail_triggered ?? null,
          summary: cobranza.agent_summary ?? null,
          extracted:
            (cobranza.agent_extracted as Record<string, unknown> | null) ?? null,
          combo: cobranza.agent_combo ?? null,
          linkedTrackId: cobranza.agent_management_track_id ?? null,
          suggestedReply: cobranza.agent_suggested_reply ?? null,
          shadowPayload: cobranza.agent_shadow_payload ?? null,
          contactReview: cobranza.agent_requires_contact_review ?? null,
          body: cobranza.body_text ?? null,
          hasOriginal: !!(
            cobranza.body_html ||
            cobranza.body_text_original ||
            cobranza.original_html_url
          ),
          attachments: cobranza.attachments ?? [],
          debtorId: cobranza.debtor_id ?? null,
        }
      : null;

  if (!view) return null;

  const isSent = cobranza?.direction === "OUT";
  const counterpart = isSent
    ? `${t("sent.to")}: ${(cobranza.to_addresses ?? []).join(", ")}`
    : view.from;
  const senderInitial = ((isSent && cobranza.to_addresses?.[0]) || view.from)
    .charAt(0)
    .toUpperCase();
  const isFinanzas = view.kind === "FINANZAS" && !!email;
  const showLinkedBox = isFinanzas && isLinked && !isEditingLink;
  const showPicker = isFinanzas && (!isLinked || isEditingLink);
  const showResolve = !isSent && !view.autoHandled && !view.needsMatching;
  const showThread = view.kind === "COBRANZA";
  const hasVerdict = !!(view.intent || view.agentStatus);
  const debtorLabel = isLoadingLinkedDebtor
    ? t("loading")
    : linkedDebtor
      ? `${linkedDebtor.debtor_code} — ${linkedDebtor.name}`
      : null;

  const goToThread = () => {
    if (view.debtorId) {
      router.push(
        `/dashboard/debtor-management/${view.debtorId}/managements-list`,
      );
      onAction?.("navigated");
    }
  };

  const handleStartEdit = () => {
    if (linkedDebtor) {
      setSelectedDebtor({
        id: linkedDebtor.id,
        name: linkedDebtor.name,
        debtor_code: linkedDebtor.debtor_code,
      });
    }
    setIsEditingLink(true);
  };

  const handleLink = () => {
    if (!selectedDebtor || !email) return;

    linkMutation.mutate(
      { id: email.id, debtorId: selectedDebtor.id },
      {
        onSuccess: () => {
          toast.success(t("linked_success"));
          setSelectedDebtor(null);
          setIsEditingLink(false);
          onAction?.("linked");
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      },
    );
  };

  const handleResolve = (resolved: boolean) =>
    resolveMutation.mutate(
      { id: view.id, channel: view.kind, resolved },
      {
        onSuccess: () => {
          if (resolved) toast.success(tq("marked_handled"));
          onAction?.(resolved ? "resolved" : "reopened");
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );

  return (
    <div className="flex flex-col">
      {(navigation || showResolve || showThread) && (
        <div className="flex flex-wrap items-center gap-3 border-b px-5 py-2.5">
          {navigation}
          <div
            className={cn(
              "flex flex-wrap items-center gap-2",
              navigation && "ml-auto",
            )}
          >
            {showResolve && view.resolvedAt && (
              <>
                <span className="flex items-center gap-1.5 text-[13px] text-emerald-700">
                  <IconCircleCheck className="h-4 w-4" />
                  {tq("marked_handled")}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  disabled={resolveMutation.isPending}
                  onClick={() => handleResolve(false)}
                >
                  {tq("mark_pending")}
                </Button>
              </>
            )}
            {showThread && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={goToThread}
                disabled={!view.debtorId}
              >
                <IconMessage className="h-4 w-4" />
                {tq("view_track")}
              </Button>
            )}
            {showResolve && !view.resolvedAt && (
              <Button
                className="gap-2"
                disabled={resolveMutation.isPending}
                onClick={() => handleResolve(true)}
              >
                <IconCheck className="h-4 w-4" />
                {tq("mark_handled")}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 border-b px-6 pt-5 pb-4">
        <h2 className="text-xl leading-snug font-bold">
          {view.subject || t("no_subject")}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {senderInitial}
          </div>
          <div className="min-w-0 flex-[1_1_200px]">
            <p className="truncate text-sm font-medium">{counterpart}</p>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(view.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {cobranza && <SentByBadge message={cobranza} />}
            <IntentBadge intent={view.intent} />
            <AgentStatusBadge
              agentStatus={view.agentStatus}
              guardrailTriggered={view.guardrail}
              suggestedReply={view.suggestedReply}
            />
            <ContactReviewBadge requiresContactReview={view.contactReview} />
          </div>
        </div>

        {resolvedDebtorId && !showLinkedBox && (
          <button
            type="button"
            onClick={goToThread}
            disabled={!view.debtorId}
            className="flex h-8 w-fit items-center gap-1.5 rounded-md border bg-muted/40 px-2.5 text-xs font-medium hover:bg-muted disabled:cursor-default disabled:hover:bg-muted/40"
          >
            <span className="text-muted-foreground">{t("linked_to")}:</span>
            {debtorLabel ?? resolvedDebtorId}
          </button>
        )}

        {showLinkedBox && (
          <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <IconCircleCheck className="h-5 w-5 shrink-0 text-emerald-600" />
            <div className="min-w-0 flex-[1_1_220px]">
              <p className="truncate text-sm font-medium text-emerald-800">
                {isAutoMatched ? t("auto_linked_to") : t("linked_to")}
                {" · "}
                <button
                  type="button"
                  onClick={goToThread}
                  className="font-medium hover:underline"
                >
                  {debtorLabel ?? t("already_linked")}
                </button>
              </p>
              <p className="text-xs text-emerald-700">
                {[
                  isAutoMatched &&
                    email.matched_by &&
                    t(`matched_by_${email.matched_by.toLowerCase()}`),
                  email.reviewed_at && formatDateTime(email.reviewed_at),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
              onClick={handleStartEdit}
            >
              {t("change_debtor")}
            </Button>
          </div>
        )}

        {showPicker && (
          <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="min-w-0 flex-[1_1_200px] text-amber-800">
              <p className="text-sm font-semibold">
                {isEditingLink ? t("change_debtor") : t("link_to_debtor")}
              </p>
              {view.needsMatching && (
                <p className="text-xs">{t("link_pending_note")}</p>
              )}
            </div>
            <Popover open={debtorPickerOpen} onOpenChange={setDebtorPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="min-w-0 flex-[1_1_240px] justify-between"
                >
                  <span className="truncate">
                    {selectedDebtor
                      ? `${selectedDebtor.debtor_code} — ${selectedDebtor.name}`
                      : t("select_debtor")}
                  </span>
                  <IconChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[420px] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder={t("search_debtor")}
                    onValueChange={handleSearchChange}
                  />
                  <CommandList>
                    {isSearchingDebtors && (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        {t("searching")}
                      </div>
                    )}
                    <CommandEmpty>{t("no_debtors_found")}</CommandEmpty>
                    <CommandGroup>
                      {debtors.map((debtor) => (
                        <CommandItem
                          key={debtor.id}
                          value={debtor.id}
                          onSelect={() => {
                            setSelectedDebtor(debtor);
                            setDebtorPickerOpen(false);
                          }}
                        >
                          <IconCheck
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedDebtor?.id === debtor.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {debtor.debtor_code} — {debtor.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              onClick={handleLink}
              disabled={!selectedDebtor || linkMutation.isPending}
            >
              {linkMutation.isPending ? t("linking") : t("link_action")}
            </Button>
            {isEditingLink && (
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                onClick={() => {
                  setIsEditingLink(false);
                  setSelectedDebtor(null);
                }}
              >
                {t("cancel")}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-start gap-6 px-6 pt-5 pb-7">
        <div className="flex min-w-0 flex-[999_1_400px] flex-col gap-4">
          {view.hasOriginal && !isSent && (
            <Tabs
              value={showOriginal ? "original" : "message"}
              onValueChange={(value) => setShowOriginal(value === "original")}
            >
              <TabsList>
                <TabsTrigger value="message" className="px-3 text-xs">
                  {t("message")}
                </TabsTrigger>
                <TabsTrigger value="original" className="px-3 text-xs">
                  {t("original.label")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          {isSent && !cobranza.original_html_url && (
            <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
              {t("sent.partial_view")}
            </p>
          )}
          {showOriginal || (isSent && view.hasOriginal) ? (
            <EmailOriginal
              key={view.id}
              accessToken={accessToken}
              clientId={clientId}
              channel={view.kind}
              emailId={view.id}
              attachments={view.attachments}
            />
          ) : (
            <div className="max-w-[68ch] text-[15px] leading-relaxed break-words whitespace-pre-wrap">
              {view.body || (
                <span className="text-muted-foreground">{t("no_body")}</span>
              )}
            </div>
          )}

          {view.attachments.length > 0 && (
            <div className="flex flex-col gap-2 border-t pt-4">
              <p className="text-xs font-medium text-muted-foreground">
                {t("attachments")} ({view.attachments.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {view.attachments.map((attachment, index) => (
                  <a
                    key={`${attachment.storage_path}-${index}`}
                    // Un enviado antiguo no guardó el archivo: se lista sin enlace.
                    href={attachment.storage_url || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 min-w-0 flex-[0_1_280px] items-center gap-2.5 rounded-md border px-2.5 py-2 text-[13px] hover:bg-gray-50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-red-50 text-red-600">
                      <IconFile className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {attachment.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size_bytes)}
                      </p>
                    </div>
                    {attachment.storage_url && (
                      <IconDownload className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {(hasVerdict || view.contactReview) && (
          <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-3">
            {hasVerdict && (
              <QuironVerdict
                intent={view.intent}
                confidence={view.confidence}
                secondaryIntents={view.secondary}
                agentStatus={view.agentStatus}
                guardrailTriggered={view.guardrail}
                summary={view.summary}
                extracted={view.extracted}
                combo={view.combo}
                shadowPayload={view.shadowPayload}
                linkedTrackId={view.linkedTrackId}
                onViewTrack={view.debtorId ? goToThread : undefined}
              />
            )}
            {view.contactReview && (
              <div className="rounded-md border border-yellow-300 bg-yellow-50 p-2.5 text-xs text-yellow-800">
                {t("agent.contact_review_note")}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
