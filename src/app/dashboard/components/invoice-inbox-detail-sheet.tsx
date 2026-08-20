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
import { useLinkInboundInvoiceEmail } from "@/hooks/useInboundInvoiceEmails";
import { InboundInvoiceEmail } from "@/services/inbound-invoice-emails";
import {
  IconFile,
  IconCheck,
  IconChevronDown,
  IconCircleCheckFilled,
  IconDownload,
} from "@tabler/icons-react";
import { cn, formatDateTime } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface InvoiceInboxDetailSheetProps {
  email: InboundInvoiceEmail | null;
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
  open,
  onOpenChange,
}: InvoiceInboxDetailSheetProps) => {
  const { profile, session } = useProfileContext();
  const t = useTranslations("dashboard.invoice_inbox");

  const accessToken = session?.token as string;
  const clientId = profile?.client?.id as string;

  const [debtorPickerOpen, setDebtorPickerOpen] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<
    { id: string; name: string; debtor_code: string } | null
  >(null);
  const [isEditingLink, setIsEditingLink] = useState(false);

  const { debtors, handleSearchChange, isLoading: isSearchingDebtors } =
    useDebtors({ accessToken, clientId, initialLimit: 8 });

  const isLinked = email?.status === "LINKED";

  const { data: linkedDebtor, isLoading: isLoadingLinkedDebtor } = useDebtor({
    accessToken,
    clientId,
    debtorId: isLinked ? email?.debtor_id : null,
  });

  const linkMutation = useLinkInboundInvoiceEmail(accessToken, clientId);

  // Resetea el estado de edición cada vez que se abre un correo distinto,
  // para que no arrastre la selección del correo anterior.
  useEffect(() => {
    setIsEditingLink(false);
    setSelectedDebtor(null);
  }, [email?.id]);

  if (!email) return null;

  const senderInitial = email.from_address.charAt(0).toUpperCase();
  const showPicker = !isLinked || isEditingLink;

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
    if (!selectedDebtor) return;

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
              {email.subject || t("no_subject")}
            </SheetTitle>
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
          </div>
          <SheetDescription asChild>
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {senderInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {email.from_address}
                </p>
                <p className="text-xs">{formatDateTime(email.created_at)}</p>
              </div>
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              {t("message")}
            </p>
            <div className="rounded-md border bg-gray-50/50 p-3 text-sm whitespace-pre-wrap">
              {email.body_text || (
                <span className="text-muted-foreground">{t("no_body")}</span>
              )}
            </div>
          </div>

          {email.attachments.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                {t("attachments")} ({email.attachments.length})
              </p>
              <div className="flex flex-col gap-2">
                {email.attachments.map((attachment) => (
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

          <div className="flex flex-col gap-2 border-t pt-4">
            {isLinked && !isEditingLink && (
              <div className="flex items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 p-3">
                <IconCircleCheckFilled className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-emerald-800">
                    {t("linked_to")}
                  </p>
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
                <Popover open={debtorPickerOpen} onOpenChange={setDebtorPickerOpen}>
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
        </div>
      </SheetContent>
    </Sheet>
  );
};
