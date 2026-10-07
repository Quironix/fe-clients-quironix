"use client";

import { Button } from "@/components/ui/button";
import { cn, formatDate, formatNumber } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { ClipboardList, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { TASK_SCOPE_QUERY_KEY } from "../hooks/useTaskScope";
import { registerTechnicalFileRequest } from "../services/task-scope";
import {
  TaskScope,
  TaskScopeItem,
  TechnicalFileOutcome,
} from "../types/task-scope";

interface TaskNeedsSectionProps {
  scope: TaskScope;
  debtorId: string;
  clientId: string;
  accessToken: string;
  onRegister: (invoiceIds: string[]) => void;
}

const formatDay = (value?: string | null) =>
  value ? formatDate(value.slice(0, 10)) : "-";

const isResolved = (item: TaskScopeItem) =>
  item.resultClass !== null || item.resolvedReason !== null;

export const TaskNeedsSection = ({
  scope,
  debtorId,
  clientId,
  accessToken,
  onRegister,
}: TaskNeedsSectionProps) => {
  const t = useTranslations("debtorManagement.taskNeeds");
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const { technicalFile, progress } = scope;
  const completed = scope.status === "COMPLETED";
  const pendingInvoiceIds = scope.items
    .filter((item) => !isResolved(item) && item.invoiceId)
    .map((item) => item.invoiceId as string);
  const missingFields = technicalFile?.needContext.missing ?? [];

  const statusOf = (item: TaskScopeItem) => {
    if (item.resultClass) {
      const result = t("results." + item.resultClass);
      return item.nextEntryOn
        ? result + " · " + t("returns", { date: formatDay(item.nextEntryOn) })
        : result;
    }
    if (item.resolvedReason) return t("reasons." + item.resolvedReason);
    return t("pending");
  };

  const handleFileRequest = async (outcome: TechnicalFileOutcome) => {
    setIsSaving(true);
    try {
      await registerTechnicalFileRequest(
        accessToken,
        clientId,
        scope.taskId,
        outcome,
        missingFields,
      );
      toast.success(t("file.requested"));
      queryClient.invalidateQueries({ queryKey: [TASK_SCOPE_QUERY_KEY] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("file.error"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 border-b border-gray-200 border-l-4 border-l-blue-600">
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-blue-700">
        <ClipboardList size={15} />
        {t("title")} ·{" "}
        {completed
          ? t("completed")
          : t("progress", { done: progress.withResult, total: progress.total })}
      </h3>

      {!completed && (
        <div className="space-y-1.5 text-xs">
          {scope.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2"
            >
              <span className="min-w-0 text-gray-700">
                <span className="font-semibold uppercase text-blue-700">
                  {item.invoiceNumber || "-"} ·{" "}
                  {formatNumber(item.balance ?? 0)}:
                </span>{" "}
                {t("needs." + item.need)}
              </span>
              {isResolved(item) || !item.invoiceId ? (
                <span
                  className={cn(
                    "shrink-0 px-2 py-0.5 rounded-full font-semibold",
                    isResolved(item)
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700",
                  )}
                >
                  {statusOf(item)}
                </span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-6 px-2 text-xs border-primary text-primary"
                  onClick={() => onRegister([item.invoiceId as string])}
                >
                  {t("register")}
                </Button>
              )}
            </div>
          ))}

          {scope.debtorItems.map((item) => (
            <div key={item.id} className="flex justify-between gap-2">
              <span className="text-gray-700">{t("needs." + item.need)}</span>
              <span className="text-gray-500">
                {item.resultClass ? t("answered") : t("pending")}
              </span>
            </div>
          ))}

          {technicalFile && !technicalFile.resultClass && (
            <div className="flex flex-wrap items-center gap-2 text-orange-700">
              <span className="flex items-center gap-1">
                <TriangleAlert size={13} />
                {t("file.title", {
                  fields: missingFields
                    .map((field) => t("fields." + field))
                    .join(", "),
                })}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                asChild
              >
                <Link href={"/dashboard/debtors/create?id=" + debtorId}>
                  {t("file.complete")}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                disabled={isSaving}
                onClick={() => handleFileRequest("FILE_DEBTOR_DID_NOT_KNOW")}
              >
                {t("file.didNotKnow")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                disabled={isSaving}
                onClick={() => handleFileRequest("FILE_AWAITING_DEBTOR")}
              >
                {t("file.awaiting")}
              </Button>
            </div>
          )}

          <div className="flex items-end justify-between gap-2 pt-1">
            <div className="flex flex-col gap-1 text-gray-500">
              {technicalFile?.resultClass && (
                <span>
                  {t(
                    technicalFile.resultClass === "FILE_COMPLETED"
                      ? "file.statusCompleted"
                      : "file.statusRequested",
                  )}
                </span>
              )}
              {scope.waiting.length > 0 && (
                <details>
                  <summary className="cursor-pointer text-blue-700">
                    {t("waitingTitle", { count: scope.waiting.length })}
                  </summary>
                  {scope.waiting.map((invoice) => (
                    <div key={invoice.invoiceId} className="flex gap-4 py-0.5">
                      <span>
                        {invoice.invoiceNumber || "-"} ·{" "}
                        {formatNumber(invoice.balance)}
                      </span>
                      <span>
                        {invoice.waitUntil
                          ? t("waitsUntil", {
                              date: formatDay(invoice.waitUntil),
                            })
                          : t("dueOn", { date: formatDay(invoice.dueDate) })}
                      </span>
                    </div>
                  ))}
                </details>
              )}
            </div>
            {pendingInvoiceIds.length > 1 && (
              <Button
                size="sm"
                className="shrink-0 h-7 text-xs"
                onClick={() => onRegister(pendingInvoiceIds)}
              >
                {t("registerPending", { count: pendingInvoiceIds.length })}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
