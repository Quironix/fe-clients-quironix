"use client";
import { sentBy } from "@/app/dashboard/invoice-inbox/lib/unified-inbox";
import { type TrackEmailMessage } from "@/services/inbound-email-replies";
import { useTranslations } from "next-intl";

export const SentByBadge = ({ message }: { message: TrackEmailMessage }) => {
  const t = useTranslations("dashboard.invoice_inbox.sent");
  const kind = sentBy(message);
  if (!kind) return null;

  return (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
      {(kind === "EXECUTIVE" && message.sent_by_executive_name) || t(kind)}
    </span>
  );
};
