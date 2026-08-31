"use client";
import { InvoiceInboxDetailSheet } from "@/app/dashboard/components/invoice-inbox-detail-sheet";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useProfileContext } from "@/context/ProfileContext";
import { useInboundInvoiceEmails } from "@/hooks/useInboundInvoiceEmails";
import {
  InboundInvoiceEmail,
  isEmailLinked,
} from "@/services/inbound-invoice-emails";
import { formatDateTime } from "@/lib/utils";
import { IconFile } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type InboxTab = "PENDING" | "LINKED" | "ALL";

const TABS: { value: InboxTab; labelKey: string }[] = [
  { value: "PENDING", labelKey: "tab_pending" },
  { value: "LINKED", labelKey: "tab_linked" },
  { value: "ALL", labelKey: "tab_all" },
];

const matchesTab = (email: InboundInvoiceEmail, tab: InboxTab) => {
  if (tab === "ALL") return true;
  if (tab === "LINKED") return isEmailLinked(email);
  return email.status === "PENDING_REVIEW";
};

export const InvoiceInboxList = () => {
  const { profile, session } = useProfileContext();
  const t = useTranslations("dashboard.invoice_inbox");

  const accessToken = session?.token as string;
  const clientId = profile?.client?.id as string;

  const [activeTab, setActiveTab] = useState<InboxTab>("PENDING");
  const [selectedEmail, setSelectedEmail] = useState<InboundInvoiceEmail | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: allEmails = [], isLoading } = useInboundInvoiceEmails(
    accessToken,
    clientId,
  );

  const emails = allEmails.filter((email) => matchesTab(email, activeTab));

  const handleOpenEmail = (email: InboundInvoiceEmail) => {
    setSelectedEmail(email);
    setDetailOpen(true);
  };

  if (!accessToken || !clientId) return null;

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as InboxTab)}
      >
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {t(tab.labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="py-10 text-center text-sm text-muted-foreground">
          {t("loading")}
        </div>
      )}

      {!isLoading && emails.length === 0 && (
        <div className="py-10 text-center text-sm text-muted-foreground">
          {t("empty")}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {emails.map((email) => (
          <button
            key={email.id}
            type="button"
            onClick={() => handleOpenEmail(email)}
            className="flex items-center justify-between gap-4 rounded-md border p-4 text-left hover:bg-gray-50"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">
                  {email.subject || t("no_subject")}
                </span>
                <span
                  className={
                    email.status === "PENDING_REVIEW"
                      ? "rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700"
                      : "rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700"
                  }
                >
                  {email.status === "PENDING_REVIEW"
                    ? t("status_pending")
                    : t("status_linked")}
                </span>
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {email.from_address}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-sm text-muted-foreground">
              {email.attachments.length > 0 && (
                <span className="flex items-center gap-1">
                  <IconFile className="h-4 w-4" />
                  {email.attachments.length}
                </span>
              )}
              <span>{formatDateTime(email.created_at)}</span>
            </div>
          </button>
        ))}
      </div>

      <InvoiceInboxDetailSheet
        email={selectedEmail}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
};
