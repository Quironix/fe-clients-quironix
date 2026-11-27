"use client";

import { AlertTriangle, CircleCheckBig, FileText, Scale } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";
import { PaginationInfo } from "../../debtors/types/pagination";
import { DailyPlanItem, DailyPlanResponse } from "../types/daily-plan";
import { TaskIsland } from "./task-island";
import { TaskItem } from "./task-item";
import { TasksPagination } from "./tasks-pagination";

type SectionKey = "CRITICAL" | "CASH_GENERATION" | "OTHER" | "LITIGATION";

const SECTIONS: Array<{
  key: SectionKey;
  title: string;
  icon: ReactNode;
  bgColor: string;
  textColor: string;
}> = [
  {
    key: "CRITICAL",
    title: "quadrants.criticalDebtors",
    icon: <AlertTriangle className="w-4 h-4" />,
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
  {
    key: "CASH_GENERATION",
    title: "quadrants.cashGeneration",
    icon: <FileText className="w-4 h-4" />,
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
  {
    key: "OTHER",
    title: "dailyPlan.otherTasks",
    icon: <CircleCheckBig className="w-4 h-4" />,
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
  },
  {
    key: "LITIGATION",
    title: "quadrants.litigationWorkflow",
    icon: <Scale className="w-4 h-4" />,
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
  },
];

const sectionOf = (item: DailyPlanItem): SectionKey => {
  if (item.workflowClass === "LITIGIO") return "LITIGATION";
  if (item.band === 1 || item.band === 2) return "CRITICAL";
  if (item.band !== null && item.band >= 3) return "CASH_GENERATION";
  return "OTHER";
};

const ROW_STYLE: Record<SectionKey, { accent: string; pill: string }> = {
  CRITICAL: { accent: "border-red-600", pill: "bg-red-100 text-red-700" },
  CASH_GENERATION: {
    accent: "border-orange-500",
    pill: "bg-orange-100 text-orange-700",
  },
  OTHER: { accent: "border-blue-600", pill: "bg-gray-100 text-gray-700" },
  LITIGATION: {
    accent: "border-yellow-500",
    pill: "bg-yellow-100 text-yellow-800",
  },
};

const bandStyle = (item: DailyPlanItem) => ROW_STYLE[sectionOf(item)];

interface DailyPlanListProps {
  data: DailyPlanResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
}

export const DailyPlanList = ({
  data,
  isLoading,
  isError,
  onPageChange,
}: DailyPlanListProps) => {
  const t = useTranslations("debtorManagement");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="text-gray-500">{t("loadingTasks")}</div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="text-red-500">{t("errorLoadingTasks")}</div>
      </div>
    );
  }

  if (data.items.length === 0) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="text-gray-500">{t("noTasks")}</div>
      </div>
    );
  }

  const noteOf = (item: DailyPlanItem) =>
    item.pendingDebtorNeeds.length > 0
      ? item.pendingDebtorNeeds
          .map((need) => t(`dailyPlan.debtorNeeds.${need}`))
          .join(" · ")
      : undefined;

  const { page, totalPages } = data.pagination;
  const pagination = {
    ...data.pagination,
    total: data.total,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  } as PaginationInfo;

  const groups = SECTIONS.map((section) => ({
    section,
    items: data.items.filter((item) => sectionOf(item) === section.key),
  })).filter((group) => group.items.length > 0);
  const firstTaskId = page === 1 ? groups[0]?.items[0]?.taskId : undefined;

  return (
    <div className="space-y-4">
      {groups.map(({ section, items }) => (
        <TaskIsland
          key={section.key}
          title={t(section.title)}
          icon={section.icon}
          bgColor={section.bgColor}
          textColor={section.textColor}
        >
          {items.map((item) => (
            <TaskItem
              key={item.taskId}
              debtorId={item.debtorId}
              code={item.debtor.debtorCode || "-"}
              name={item.debtor.name}
              incidents={
                item.invoiceProgress.total - item.invoiceProgress.withResult
              }
              incidentsLabel={t("dailyPlan.pendingInvoices")}
              note={noteOf(item)}
              debt={Number(item.overdueAmount)}
              debtLabel={t("taskItem.overdueDebt")}
              status={
                item.reasonCode
                  ? t(`dailyPlan.reasons.${item.reasonCode}`)
                  : t("taskItem.unclassifiedStatus")
              }
              statusBgColor={bandStyle(item).pill}
              statusTextColor=""
              borderColor={bandStyle(item).accent}
              highlighted={item.taskId === firstTaskId}
            />
          ))}
        </TaskIsland>
      ))}

      <TasksPagination
        pagination={pagination}
        currentPage={page}
        onPageChange={onPageChange}
      />
    </div>
  );
};
