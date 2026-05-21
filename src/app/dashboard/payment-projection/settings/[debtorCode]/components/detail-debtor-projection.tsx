"use client";

import { formatNumber } from "@/lib/utils";
import {
  CalendarClock,
  ChartColumn,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

const DetailDebtorProjection = ({ debtor }: { debtor: any }) => {
  const t = useTranslations("paymentProjection.settings");

  const totalEstimated = useMemo(() => {
    return debtor?.total_monthly_estimated ?? 0;
  }, [debtor]);

  const totalReal = useMemo(() => {
    return debtor?.total_monthly_collected ?? 0;
  }, [debtor]);

  return (
    <div className="bg-blue-100/30 rounded-md p-5">
      <div className="flex items-start justify-start gap-36">
        <div className="flex flex-col items-start justify-start">
          <span className="text-xs text-gray-500">{t("companyName")}</span>
          <span className="text-md font-bold">{debtor?.name}</span>
        </div>
        <div className="flex flex-col items-start justify-start">
          <span className="text-xs text-gray-500">{t("debtorCodeLabel")}</span>
          <span className="text-md font-bold">{debtor?.debtor_code}</span>
        </div>
        <div className="flex flex-col items-start justify-start">
          <span className="text-xs text-gray-500">{t("overdueDebt")}</span>
          <span className="text-md font-bold">
            {formatNumber(debtor?.overdue_debt)}
          </span>
        </div>
        <div className="flex flex-col items-start justify-start">
          <span className="text-xs text-gray-500">{t("periodDebtCol")}</span>
          <span className="text-md font-bold">
            {formatNumber(debtor?.period_debt)}
          </span>
        </div>
      </div>
      <div className="bg-blue-100/70 rounded-md p-5 mt-5 flex items-start justify-start gap-36">
        <div className="flex items-center justify-start gap-2">
          <ChartColumn className="text-blue-600" />
          <div className="flex flex-col items-start justify-start">
            <span className="text-xs">{t("estimated2")}</span>
            <span className="text-md font-bold">
              {formatNumber(totalEstimated)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-start gap-2">
          <DollarSign className="text-blue-600" />
          <div className="flex flex-col items-start justify-start">
            <span className="text-xs">{t("real")}</span>
            <span className="text-md font-bold">{formatNumber(totalReal)}</span>
          </div>
        </div>
        <div className="flex items-center justify-start gap-2">
          <TrendingDown className="text-blue-600" />
          <div className="flex flex-col items-start justify-start">
            <span className="text-xs">{t("variation")}</span>
            <span className="text-md font-bold">
              {formatNumber(totalEstimated - totalReal)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-start gap-2">
          <CalendarClock className="text-blue-600" />
          <div className="flex flex-col items-start justify-start">
            <span className="text-xs">{t("paymentCalendar")}</span>
            <span className="text-md ">
              {t("paymentCalendarDesc")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailDebtorProjection;
