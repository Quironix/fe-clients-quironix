"use client";

import { Button } from "@/components/ui/button";
import { cn, formatDateTime } from "@/lib/utils";
import { useProfileContext } from "@/context/ProfileContext";
import { AlertTriangle, Unplug, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useFintocConnectionStatus } from "../hooks/use-fintoc-connection-status";
import { FintocAccountConnection } from "../services/fintoc.service";
import { canManageBanks, timeAgo } from "../utils/fintoc-connection";

const WARNING_PATHS = ["/dashboard/home", "/dashboard/banks"];
const DISMISS_KEY = "fintoc-connection-alert-dismissed";

const accountLabel = (account: FintocAccountConnection) =>
  [account.bank, account.account_number].filter(Boolean).join(" ");

const readDismissed = () => {
  try {
    return sessionStorage.getItem(DISMISS_KEY);
  } catch {
    return null;
  }
};

const AlertBar = ({
  tone,
  title,
  detail,
  hint,
  action,
  onDismiss,
  dismissLabel,
}: {
  tone: "danger" | "warning";
  title: string;
  detail: string;
  hint?: string;
  action?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}) => {
  const Icon = tone === "danger" ? Unplug : AlertTriangle;
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "mb-4 flex items-center gap-3 rounded-lg border border-l-4 bg-white px-4 py-2.5 text-sm shadow-sm",
        tone === "danger" ? "border-l-red-500" : "border-l-amber-500",
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "h-4 w-4 shrink-0",
          tone === "danger" ? "text-red-600" : "text-amber-600",
        )}
      />
      <p className="min-w-0 flex-1 text-gray-600" title={hint}>
        <span className="font-medium text-gray-900">{title}</span>
        <span className="hidden sm:inline"> · {detail}</span>
      </p>
      {action}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

const FintocConnectionAlert = () => {
  const t = useTranslations("banks.connection");
  const locale = useLocale();
  const pathname = usePathname();
  const { profile } = useProfileContext();
  const canManage = canManageBanks(profile);
  const accounts = useFintocConnectionStatus();
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => setDismissed(readDismissed()), []);

  const ago = (date: string | null) => timeAgo(date, locale);
  const exact = (date: string | null) => (date ? formatDateTime(date) : "");

  const disconnected = accounts.filter(
    (a) => a.connection_status === "LOGIN_REQUIRED",
  );
  const warnings = WARNING_PATHS.includes(pathname)
    ? accounts.filter(
        (a) =>
          a.connection_status === "STALE" ||
          a.connection_status === "PROVIDER_DOWN",
      )
    : [];
  const warningsKey = warnings
    .map((a) => `${a.bank_information_id}:${a.status_changed_at}`)
    .join("|");
  const showWarnings = warnings.length > 0 && dismissed !== warningsKey;

  if (disconnected.length === 0 && !showWarnings) return null;

  const dismissWarnings = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, warningsKey);
    } catch {}
    setDismissed(warningsKey);
  };

  const viewAccounts = canManage ? (
    <Button asChild size="sm" variant="outline">
      <Link href="/dashboard/banks">{t("viewAccounts")}</Link>
    </Button>
  ) : undefined;

  const [first] = disconnected;
  const [warning] = warnings;

  return (
    <>
      {disconnected.length === 1 && (
        <AlertBar
          tone="danger"
          title={t("disconnected", {
            account: accountLabel(first),
            ago: ago(first.status_changed_at),
          })}
          detail={
            canManage
              ? t("disconnectedDetail")
              : `${t("disconnectedDetail")} ${t("askAdmin")}`
          }
          hint={exact(first.status_changed_at)}
          action={
            canManage ? (
              <Button asChild size="sm">
                <Link href="/dashboard/banks?reconnect=1">
                  {t("reconnect")}
                </Link>
              </Button>
            ) : undefined
          }
        />
      )}
      {disconnected.length > 1 && (
        <AlertBar
          tone="danger"
          title={t("disconnectedMany", { count: disconnected.length })}
          detail={
            canManage
              ? t("disconnectedManyDetail")
              : `${t("disconnectedManyDetail")} ${t("askAdminMany")}`
          }
          action={viewAccounts}
        />
      )}
      {showWarnings && warnings.length === 1 && (
        <AlertBar
          tone="warning"
          title={
            warning.connection_status === "PROVIDER_DOWN"
              ? t("providerDown", {
                  bank: warning.bank ?? "",
                  ago: ago(
                    warning.incident?.started ?? warning.status_changed_at,
                  ),
                })
              : t("stale", {
                  account: accountLabel(warning),
                  ago: ago(warning.status_changed_at),
                })
          }
          detail={
            warning.connection_status === "PROVIDER_DOWN"
              ? t("providerDownDetail")
              : t("staleDetail")
          }
          hint={exact(warning.status_changed_at)}
          action={
            warning.incident?.url ? (
              <a
                href={warning.incident.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                {t("viewIncident")}
              </a>
            ) : undefined
          }
          onDismiss={dismissWarnings}
          dismissLabel={t("dismiss")}
        />
      )}
      {showWarnings && warnings.length > 1 && (
        <AlertBar
          tone="warning"
          title={t("warningMany", { count: warnings.length })}
          detail={t("warningManyDetail")}
          action={viewAccounts}
          onDismiss={dismissWarnings}
          dismissLabel={t("dismiss")}
        />
      )}
    </>
  );
};

export default FintocConnectionAlert;
