import { Separator } from "@/components/ui/separator";
import { formatNumber } from "@/lib/utils";
import dayjs from "dayjs";
import { Banknote, CalendarClock, Scale, Target } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { CallReasons } from "../types";
import { ProgressBarChart } from "./progress-bar-chart";

interface KeyReasonsProps {
  callReasons: CallReasons;
}

export const KeyReasons = ({ callReasons }: KeyReasonsProps) => {
  const t = useTranslations("debtorManagement.keyReasons");
  const [currentTime, setCurrentTime] = useState(dayjs());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const date = currentTime.format("DD/MM/YYYY");
  const time = currentTime.format("HH:mm");

  return (
    <div className="bg-white space-y-3 border-2 border-[#1249C7] rounded-md text-xs">
      <h3 className="text-sm font-semibold bg-[#1249C7] text-white p-2 px-4 flex justify-start items-center gap-1">
        <Target size={15} /> {t("title")}
      </h3>

      {/* Compromiso incumplido */}
      <div className="px-4 pb-1">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-700">
                {t("unfulfilledCommitment")}
              </span>
            </div>
            <div className="flex flex-col justify-between items-end">
              <span className="text-sm font-bold text-red-500">
                {formatNumber(callReasons.unfulfilled_commitment.amount || 0)}
              </span>
              <span className="text-xs">{date}</span>
            </div>
          </div>
        </div>
        <Separator className="my-1" />
        {/* Deuda vencida */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-700">
              {t("overdueDebt")}
            </span>

            <span className="text-lg font-bold text-red-500">
              {formatNumber(callReasons.overdue_debt.amount)}
            </span>
          </div>
          <ProgressBarChart
            color="#FF3B3060"
            leftValue={callReasons.overdue_debt.percent}
            rightValue={100 - callReasons.overdue_debt.percent}
            separatorColor="#FF3B30"
            text="vencido"
            symbol="%"
          />
        </div>
        <Separator className="mt-3 mb-1" />
        {/* Vencimientos próximos */}
        {/* <div className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-700">
                Vencimientos próximos
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              ${callReasons.upcoming_maturities.amount.toLocaleString("es-CL")}
            </span>
          </div>
        </div>
        <Separator className="my-1" /> */}

        {/* Estimación de caja */}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-gray-700">
              {t("cashEstimate")}
            </span>
          </div>
          <div className="flex justify-around items-center gap-2 mb-2">
            <div className="flex flex-col justify-around items-center">
              <div className="flex gap-1 justify-start items-center text-blue-700 text-xs">
                <Banknote size={13} />
                <span>{t("collected")}</span>
              </div>
              <span>
                {formatNumber(callReasons.cash_estimate.collected_amount || 0)}
              </span>
            </div>
            <div className="flex flex-col justify-around items-center">
              <div className="flex gap-1 justify-start items-center text-blue-700 text-xs">
                <Target size={13} />
                <span>{t("projected")}</span>
              </div>
              <span className="text-red-500 font-semibold">
                {formatNumber(callReasons.cash_estimate.projected_amount || 0)}
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-1" />

        <div className="space-y-1">
          <div className="flex justify-around items-center gap-2 mb-2">
            <div className="flex flex-col justify-around items-center">
              <div className="flex gap-1 justify-start items-center text-blue-700 text-xs">
                <CalendarClock size={13} />
                <span>{t("upcomingMaturities")}</span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <span className="text-red-500 font-semibold">
                  {formatNumber(callReasons.upcoming_maturities.amount || 0)}
                </span>
                <span className="text-gray-500 text-xs">{t("days15")}</span>
              </div>
            </div>
            <div className="flex flex-col justify-around items-center">
              <div className="flex gap-1 justify-start items-center text-blue-700 text-xs">
                <Scale size={13} />
                <span>{t("openLitigations")}</span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <span className="text-red-500 font-semibold">
                  {formatNumber(callReasons.open_litigations.amount || 0)}
                </span>
                <span className="text-gray-500 text-xs">
                  {formatNumber(
                    callReasons.open_litigations.quantity || 0,
                    false
                  )}{" "}
                  {t("invoices")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
