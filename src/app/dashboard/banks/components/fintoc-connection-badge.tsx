"use client";

import { Badge } from "@/components/ui/badge";
import { cn, formatDateTime } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import {
  FintocAccountConnection,
  FintocConnectionStatus,
} from "../services/fintoc.service";
import { timeAgo } from "../utils/fintoc-connection";

const STYLES: Record<FintocConnectionStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800 border-green-200",
  LOGIN_REQUIRED: "bg-red-100 text-red-800 border-red-200",
  PROVIDER_DOWN: "bg-amber-100 text-amber-800 border-amber-200",
  STALE: "bg-amber-100 text-amber-800 border-amber-200",
};

const FintocConnectionBadge = ({
  connection,
}: {
  connection?: FintocAccountConnection;
}) => {
  const t = useTranslations("banks.connection");
  const locale = useLocale();
  if (!connection) return <span className="text-muted-foreground">-</span>;

  return (
    <div className="flex flex-col gap-1">
      <Badge
        variant="outline"
        className={cn("w-fit", STYLES[connection.connection_status])}
      >
        {t(`status.${connection.connection_status}`)}
      </Badge>
      {connection.last_refreshed_at && (
        <span
          className="text-xs text-muted-foreground"
          title={formatDateTime(connection.last_refreshed_at)}
        >
          {t("lastRefreshed", {
            date: timeAgo(connection.last_refreshed_at, locale),
          })}
        </span>
      )}
    </div>
  );
};

export default FintocConnectionBadge;
