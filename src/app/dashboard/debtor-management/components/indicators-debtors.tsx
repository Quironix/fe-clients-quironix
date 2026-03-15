"use client";

import { useProfileContext } from "@/context/ProfileContext";
import { IconCalendarTime } from "@tabler/icons-react";
import {
  ChartLine,
  DollarSign,
  FileChartLine,
  Target,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { useManagementIndicators } from "../hooks/useManagementIndicators";
import { IndicatorCard } from "./indicator-card";
import { formatValue, ProgressBarChart } from "./progress-bar-chart";

dayjs.locale("es");

const IndicatorsDebtor = () => {
  const t = useTranslations("debtorManagement.indicators");
  const { session, profile } = useProfileContext();
  const { data, isLoading, isError } = useManagementIndicators({
    accessToken: session?.token || "",
    clientId: profile?.client?.id || "",
  });

  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mostrar loading state
  if (isLoading) {
    return (
      <div className="bg-white shadow-xl rounded-md p-3 space-y-2">
        <div className="text-gray-500 text-center py-4">{t("loading")}</div>
      </div>
    );
  }

  // Mostrar error state
  if (isError || !data) {
    return (
      <div className="bg-white shadow-xl rounded-md p-3 space-y-2">
        <div className="text-red-500 text-center py-4">
          {t("errorLoading")}
        </div>
      </div>
    );
  }

  const isActive = data.status.state === "active";
  const statusColor = isActive ? "green" : "gray";
  const statusBgColor = isActive ? "#43C41133" : "#f3f4f6";
  const statusTextColor = isActive ? "text-green-800" : "text-gray-800";
  const statusDotColor = isActive ? "bg-green-700" : "bg-gray-700";

  const date = currentTime.format("DD/MM/YYYY");
  const time = currentTime.format("HH:mm");

  const FirstCard = () => (
    <div className="bg-white shadow-xl rounded-md p-3 space-y-2">
      <div className="flex gap-3 justify-between items-center">
        <div className="flex gap-1">
          <User className="text-blue-600" />
          <span>{t("status")}</span>
        </div>
        <div>
          <div
            className={`flex font-bold text-xs rounded-full items-center justify-start gap-1 px-3 text-center ${statusTextColor}`}
            style={{ backgroundColor: statusBgColor }}
          >
            <span className={`w-2 h-2 rounded-full ${statusDotColor}`} />{" "}
            {isActive ? t("active") : t("inactive")}
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-between items-center">
        <div className="flex gap-1">
          <IconCalendarTime className="text-gray-400" />
          <span>{date}</span>
        </div>

        <div>
          <span>{time}</span>
        </div>
      </div>

      <div className="flex gap-3 justify-between items-center">
        <div className="flex gap-1">{t("tasksCompleted")}</div>
        <div>
          <span className="text-green-700">{data.tasks.completed}</span>
        </div>
      </div>
      <div className="flex gap-3 justify-between items-center">
        <div className="flex gap-1">{t("tasksPending")}</div>
        <div>
          <span className="text-red-700">{data.tasks.pending}</span>
        </div>
      </div>
    </div>
  );

  return (
    <section className="flex flex-col gap-5 pb-10">
      <FirstCard />

      <IndicatorCard
        icon={<Target className="text-blue-600" />}
        title={t("executiveProgress")}
      >
        <div className="flex flex-col">
          <span className="text-3xl text-black font-black">
            {data.tasks.progress_percent}%
          </span>
          <span className="text-sm text-black -mt-1">
            {data.tasks.completed}/{data.tasks.total} {t("tasks")}
          </span>
        </div>
      </IndicatorCard>

      <IndicatorCard
        icon={<DollarSign className="text-blue-600" />}
        title={t("dailyGoal")}
      >
        <div className="flex flex-col">
          <span className="text-3xl text-black font-black">
            {formatValue(data.daily_goal.current_amount)}
          </span>
          <span className="text-sm text-black -mt-1">
            {t("of")} {formatValue(data.daily_goal.target_amount)}
          </span>
        </div>
      </IndicatorCard>

      <IndicatorCard
        icon={<ChartLine className="text-blue-600" />}
        title={t("overdueReduction")}
      >
        <div className="flex flex-col w-full min-w-full">
          <span className="text-3xl text-black font-black">
            {data.overdue_reduction.percentage}%
          </span>
          <ProgressBarChart
            color="#43C41180"
            leftValue={data.overdue_reduction.current_amount}
            rightValue={
              data.overdue_reduction.total_amount -
              data.overdue_reduction.current_amount
            }
            separatorColor="#15803d"
          />
        </div>
      </IndicatorCard>

      <IndicatorCard
        icon={<DollarSign className="text-blue-600" />}
        title={t("paymentCommitments")}
      >
        <div className="flex flex-col">
          <span className="text-3xl text-black font-black">
            {formatValue(data.payment_commitments.amount)}
          </span>
          <span className="text-sm text-black -mt-1">
            {t("of")} {data.payment_commitments.commitments_count} {t("commitmentsObtained")}
          </span>
        </div>
      </IndicatorCard>

      <IndicatorCard
        icon={<FileChartLine className="text-blue-600" />}
        title={t("monthlyGoal")}
      >
        <div className="flex flex-col w-full">
          <span className="text-3xl text-black font-black">
            {data.monthly_goal.percentage}%
          </span>
          <ProgressBarChart
            color="#FFCC0080"
            leftValue={data.monthly_goal.current_amount}
            rightValue={
              data.monthly_goal.target_amount - data.monthly_goal.current_amount
            }
            separatorColor="#FFCC00"
          />
        </div>
      </IndicatorCard>
    </section>
  );
};

export default IndicatorsDebtor;
