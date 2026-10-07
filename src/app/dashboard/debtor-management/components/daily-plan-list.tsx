"use client";

import { useTranslations } from "next-intl";
import { PaginationInfo } from "../../debtors/types/pagination";
import { DailyPlanResponse } from "../types/daily-plan";
import { TaskItem } from "./task-item";
import { TasksPagination } from "./tasks-pagination";

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

  const { page, totalPages } = data.pagination;
  const pagination = {
    ...data.pagination,
    total: data.total,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  } as PaginationInfo;

  return (
    <div className="space-y-4">
      <div>
        {data.items.map((item, index) => (
          <TaskItem
            key={item.taskId}
            debtorId={item.debtorId}
            code={item.debtor.debtorCode || "-"}
            name={item.debtor.name}
            detail={
              item.invoiceProgress.total > 0
                ? t("dailyPlan.invoiceProgress", {
                    done: item.invoiceProgress.withResult,
                    total: item.invoiceProgress.total,
                  })
                : undefined
            }
            debt={Number(item.overdueAmount)}
            debtLabel={t("taskItem.overdueDebt")}
            status={
              item.reasonCode
                ? t(`dailyPlan.reasons.${item.reasonCode}`)
                : t("taskItem.unclassifiedStatus")
            }
            statusBgColor="bg-gray-100"
            statusTextColor="text-gray-700"
            highlighted={page === 1 && index === 0}
            borderColor="border-blue-600"
          />
        ))}
      </div>

      <TasksPagination
        pagination={pagination}
        currentPage={page}
        onPageChange={onPageChange}
      />
    </div>
  );
};
