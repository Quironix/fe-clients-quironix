"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfileContext } from "@/context/ProfileContext";
import {
  useInvoiceInbox,
  usePendingInboundInvoiceEmails,
} from "@/hooks/useInboundInvoiceEmails";
import { cn } from "@/lib/utils";
import { InboundInvoiceEmail } from "@/services/inbound-invoice-emails";
import { IconCopy, IconMail } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { InvoiceInboxDetailSheet } from "./invoice-inbox-detail-sheet";

export const InvoiceInboxMailbox = () => {
  const { profile, session } = useProfileContext();
  const t = useTranslations("dashboard.invoice_inbox");
  const router = useRouter();

  const accessToken = session?.token as string;
  const clientId = profile?.client?.id as string;

  const [selectedEmail, setSelectedEmail] = useState<InboundInvoiceEmail | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: emails = [] } = usePendingInboundInvoiceEmails(
    accessToken,
    clientId,
  );
  const { data: inbox } = useInvoiceInbox(accessToken, clientId);

  const handleCopyAddress = () => {
    if (!inbox?.address) return;
    navigator.clipboard.writeText(inbox.address);
    toast.success(t("address_copied"));
  };

  const handleOpenEmail = (email: InboundInvoiceEmail) => {
    setSelectedEmail(email);
    setDetailOpen(true);
  };

  if (!accessToken || !clientId) return null;

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="relative flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <IconMail className="h-5 w-5" />
            {emails.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {emails.length > 99 ? "99+" : emails.length}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-96" align="start" forceMount>
          <DropdownMenuLabel className="flex items-center justify-between font-normal">
            <span className="text-sm font-medium">{t("title")}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {emails.length === 0 && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              {t("empty")}
            </div>
          )}
          {emails.map((email: InboundInvoiceEmail) => {
            const relativeTime = formatDistanceToNow(
              new Date(email.created_at),
              { addSuffix: true, locale: es },
            );

            return (
              <DropdownMenuItem
                key={email.id}
                onSelect={(e) => {
                  e.preventDefault();
                  handleOpenEmail(email);
                }}
                className={cn(
                  "flex flex-col items-start gap-1 whitespace-normal border-l-2 border-l-amber-500 py-2 pl-2.5",
                )}
              >
                <div className="flex w-full items-center gap-1.5">
                  <span className="flex-1 truncate text-sm font-medium">
                    {email.subject || t("no_subject")}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {relativeTime}
                  </span>
                </div>
                <span className="line-clamp-1 block text-xs text-muted-foreground">
                  {email.from_address}
                </span>
                {email.attachments.length > 0 && (
                  <span className="text-[11px] text-muted-foreground">
                    {email.attachments.length}{" "}
                    {email.attachments.length === 1 ? "adjunto" : "adjuntos"}
                  </span>
                )}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              router.push("/dashboard/invoice-inbox");
            }}
            className="justify-center text-sm font-medium text-blue-600"
          >
            {t("view_all")}
          </DropdownMenuItem>
          {inbox?.address && (
            <>
              <DropdownMenuSeparator />
              <div className="flex items-center justify-between gap-2 px-2 py-2">
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">
                    {t("your_inbox")}
                  </p>
                  <p className="truncate text-xs font-medium">
                    {inbox.address}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="shrink-0 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  title={t("copy_address")}
                >
                  <IconCopy className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <InvoiceInboxDetailSheet
        email={selectedEmail}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
};
