"use client";

import { useTranslations } from "next-intl";
import { usePaymentProfile } from "../../hooks/useTechnicalFile";

export function HabitualPaymentMethod({ debtorId }: { debtorId?: string }) {
  const t = useTranslations("debtors.technicalFile");
  const { data, isLoading } = usePaymentProfile(debtorId);
  const habit = data?.habitual_payment_method;

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{t("habitualPaymentMethod")}</p>
      <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
        {isLoading
          ? "…"
          : habit
            ? t("paysWith", {
                via: habit.via,
                date: habit.last_payment_at.split("-").reverse().join("-"),
              })
            : t("noPaymentHistory")}
      </p>
    </div>
  );
}
