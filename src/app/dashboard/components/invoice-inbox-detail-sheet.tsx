"use client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { useProfileContext } from "@/context/ProfileContext";
import { useDebtor, useDebtors } from "@/hooks/useDebtors";
import {
  useLinkInboundInvoiceEmail,
  useResolveInboundEmail,
} from "@/hooks/useInboundInvoiceEmails";
import {
  AgentStatusBadge,
  ContactReviewBadge,
  IntentBadge,
} from "@/app/dashboard/invoice-inbox/components/inbox-badges";
import { QuironVerdict } from "@/components/quiron/quiron-verdict";
import { AgentStatusBadge as PrimitiveAgentStatusBadge } from "@/components/quiron/agent-status-badge";
import { IntentBadge as PrimitiveIntentBadge } from "@/components/quiron/intent-badge";
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
  IconCircleCheckFilled,
  IconDownload,
  IconMessage,
} from "@tabler/icons-react";
import { cn, formatDateTime } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface InvoiceInboxDetailSheetProps {
  email: InboundInvoiceEmail | null;
  cobranza?: TrackEmailMessage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const InvoiceInboxDetailSheet = ({
  email,
  cobranza,
  open,
  onOpenChange,
}: InvoiceInboxDetailSheetProps) => {
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

  const { debtors, handleSearchChange, isLoading: isSearchingDebtors } =
    useDebtors({ accessToken, clientId, initialLimit: 8 });

  const isLinked = email ? isEmailLinked(email) : false;
  const isAutoMatched = email?.status === "MATCHED";

  const { data: linkedDebtor, isLoading: isLoadingLinkedDebtor } = useDebtor({
    accessToken,
    clientId,
    debtorId: isLinked ? email?.debtor_id : null,
  });

  const linkMutation = useLinkInboundInvoiceEmail(accessToken, clientId);
  const resolveMutation = useResolveInboundEmail(accessToken, clientId);

  useEffect(() => {
    setIsEditingLink(false);
    setSelectedDebtor(null);
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
        contactReview: email.agent_requires_contact_review ?? null,
        body: email.body_text ?? null,
        attachments: email.attachments ?? [],
        debtorId: email.debtor_id ?? null,
      }
    : cobranza
      ? {
          kind: "COBRANZA" as const,
          id: cobranza.id,
          resolvedAt: cobranza.resolved_at ?? null,
          autoHandled: cobranza.agent_status === "HANDLED_BY_AGENT",
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
          contactReview: cobranza.agent_requires_contact_review ?? null,
          body: cobranza.body_text ?? null,
          attachments: cobranza.attachments ?? [],
          debtorId: cobranza.debtor_id ?? null,
        }
      : null;

  if (!view) return null;

  const senderInitial = view.from.charAt(0).toUpperCase();
  const showPicker =
    view.kind === "FINANZAS" && email ? !isLinked || isEditingLink : false;

  const goToThread = () => {
    if (view.debtorId) {
      router.push(
        `/dashboard/debtor-management/${view.debtorId}/managements-list`,
      );
      onOpenChange(false);
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
          onOpenChange(false);
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <SheetTitle className="text-base leading-snug">
              {view.subject || t("no_subject")}
            </SheetTitle>
            {view.kind === "FINANZAS" && (
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                  isLinked
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700",
                )}
              >
                {isLinked ? t("status_linked") : t("status_pending")}
              </span>
            )}
          </div>
          <SheetDescription asChild>
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {senderInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {view.from}
                </p>
                <p className="text-xs">{formatDateTime(view.createdAt)}</p>
              </div>
            </div>
          </SheetDescription>
          <div className="flex flex-wrap items-center gap-1.5">
            {email ? (
              <>
                <IntentBadge intent={email.intent} />
                <AgentStatusBadge email={email} />
                <ContactReviewBadge email={email} />
              </>
            ) : (
              <>
                <PrimitiveIntentBadge intent={view.intent} />
                <PrimitiveAgentStatusBadge
                  agentStatus={view.agentStatus}
                  guardrailTriggered={view.guardrail}
                  suggestedReply={view.suggestedReply}
                />
              </>
            )}
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          {(view.intent || view.agentStatus) && (
            <QuironVerdict
              intent={view.intent}
              confidence={view.confidence}
              secondaryIntents={view.secondary}
              agentStatus={view.agentStatus}
              guardrailTriggered={view.guardrail}
              summary={view.summary}
              extracted={view.extracted}
              combo={view.combo}
              linkedTrackId={view.linkedTrackId}
              onViewTrack={view.debtorId ? goToThread : undefined}
            />
          )}

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              {t("message")}
            </p>
            <div className="rounded-md border bg-gray-50/50 p-3 text-sm whitespace-pre-wrap">
              {view.body || (
                <span className="text-muted-foreground">{t("no_body")}</span>
              )}
            </div>
          </div>

          {view.attachments.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                {t("attachments")} ({view.attachments.length})
              </p>
              <div className="flex flex-col gap-2">
                {view.attachments.map((attachment) => (
                  <a
                    key={attachment.storage_path}
                    href={attachment.storage_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2.5 rounded-md border p-2.5 text-sm hover:bg-gray-50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-red-50 text-red-500">
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
                    <IconDownload className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {view.contactReview && (
            <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-xs text-yellow-800">
              {t("agent.contact_review_note")}
            </div>
          )}

          {!view.autoHandled && (
            <div className="flex flex-col gap-2 border-t pt-4">
              {view.resolvedAt ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <IconCircleCheckFilled className="h-4 w-4" />
                    {tq("marked_handled")}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="self-start text-xs text-muted-foreground"
                    disabled={resolveMutation.isPending}
                    onClick={() =>
                      resolveMutation.mutate(
                        { id: view.id, channel: view.kind, resolved: false },
                        {
                          onSuccess: () => onOpenChange(false),
                          onError: (e: Error) => toast.error(e.message),
                        },
                      )
                    }
                  >
                    {tq("mark_pending")}
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full justify-center gap-2"
                  disabled={resolveMutation.isPending}
                  onClick={() =>
                    resolveMutation.mutate(
                      { id: view.id, channel: view.kind, resolved: true },
                      {
                        onSuccess: () => {
                          toast.success(tq("marked_handled"));
                          onOpenChange(false);
                        },
                        onError: (e: Error) => toast.error(e.message),
                      },
                    )
                  }
                >
                  <IconCheck className="h-4 w-4" />
                  {tq("mark_handled")}
                </Button>
              )}
            </div>
          )}

          {view.kind === "COBRANZA" && (
            <div className="flex flex-col gap-2 border-t pt-4">
              <Button
                variant="outline"
                className="w-full justify-center gap-2"
                onClick={goToThread}
                disabled={!view.debtorId}
              >
                <IconMessage className="h-4 w-4" />
                {tq("view_track")}
              </Button>
            </div>
          )}

          {view.kind === "FINANZAS" && email && (
            <div className="flex flex-col gap-2 border-t pt-4">
              {isLinked && !isEditingLink && (
                <div className="flex items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 p-3">
                  <IconCircleCheckFilled className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-emerald-800">
                      {isAutoMatched ? t("auto_linked_to") : t("linked_to")}
                    </p>
                    {isAutoMatched && email.matched_by && (
                      <p className="text-xs text-emerald-600">
                        {t(`matched_by_${email.matched_by.toLowerCase()}`)}
                      </p>
                    )}
                    <p className="truncate text-sm text-emerald-700">
                      {isLoadingLinkedDebtor
                        ? t("loading")
                        : linkedDebtor
                          ? `${linkedDebtor.debtor_code} — ${linkedDebtor.name}`
                          : t("already_linked")}
                    </p>
                    {email.reviewed_at && (
                      <p className="mt-0.5 text-xs text-emerald-600">
                        {formatDateTime(email.reviewed_at)}
                      </p>
                    )}
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
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {isEditingLink ? t("change_debtor") : t("link_to_debtor")}
                    </p>
                    {isEditingLink && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingLink(false);
                          setSelectedDebtor(null);
                        }}
                        className="text-xs text-muted-foreground hover:underline"
                      >
                        {t("cancel")}
                      </button>
                    )}
                  </div>
                  <Popover
                    open={debtorPickerOpen}
                    onOpenChange={setDebtorPickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {selectedDebtor
                          ? `${selectedDebtor.debtor_code} — ${selectedDebtor.name}`
                          : t("select_debtor")}
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
                                  className={`mr-2 h-4 w-4 ${
                                    selectedDebtor?.id === debtor.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
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
                </>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
