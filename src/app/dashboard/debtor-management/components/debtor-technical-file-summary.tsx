"use client";

import {
  useSalespeople,
  usePaymentProfile,
} from "@/app/dashboard/debtors/hooks/useTechnicalFile";
import type { Debtor } from "@/app/dashboard/debtors/types";
import { describeCalendar } from "@/app/dashboard/debtors/utils/technical-file";
import { Badge } from "@/components/ui/badge";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

const Item = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex min-w-40 flex-col gap-1">
    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
    <span className="text-sm text-gray-800">{children}</span>
  </div>
);

export function DebtorTechnicalFileSummary({ debtor }: { debtor: Debtor }) {
  const t = useTranslations("debtors.technicalFile");
  const { data: profile } = usePaymentProfile(debtor.id);
  const { data: salespeople = [] } = useSalespeople();
  const habit = profile?.habitual_payment_method;
  const alert = profile?.payment_calendar_alert;
  const channels = debtor.accepted_channels ?? [];
  const salesperson = salespeople.find((s) => s.id === debtor.salesperson_id);
  const incomplete =
    channels.length === 0 || !(debtor.attention_days_hours?.length ?? 0);

  return (
    <div className="mt-3 flex flex-wrap items-start gap-x-8 gap-y-3 rounded-md border border-gray-200 bg-white px-5 py-4">
      <Item label={t("habitualPaymentMethod")}>
        {habit
          ? t("paysWith", {
              via: habit.via,
              date: habit.last_payment_at.split("-").reverse().join("-"),
            })
          : t("noPaymentHistory")}
      </Item>
      <Item label={t("acceptedChannels")}>
        {channels.length > 0 ? (
          <span className="flex flex-wrap gap-1">
            {channels.map((channel) => (
              <Badge key={channel} variant="secondary">
                {t(`channels.${channel}`)}
              </Badge>
            ))}
          </span>
        ) : (
          t("notInformed")
        )}
      </Item>
      <Item label={t("paymentCalendar")}>
        {debtor.payment_calendar ? (
          <span className="flex flex-wrap items-center gap-2">
            {t("calendarSummary", {
              calendar: describeCalendar(debtor.payment_calendar),
              cutoff: debtor.payment_calendar.cutoff_days,
            })}
            {alert && (
              <Badge
                variant="outline"
                className="border-amber-300 text-amber-700"
              >
                <TriangleAlert className="mr-1 h-3 w-3" />
                {t("reviewCalendar")}
              </Badge>
            )}
          </span>
        ) : (
          t("noCalendar")
        )}
      </Item>
      <Item label={t("salesperson")}>
        {salesperson?.name ?? t("noSalesperson")}
      </Item>
      {incomplete && (
        <Link
          href={`/dashboard/debtors/create?id=${debtor.id}`}
          className="ml-auto self-center text-sm font-medium text-amber-700 underline"
        >
          {t("completeFile")}
        </Link>
      )}
    </div>
  );
}
