"use client";

import type { FC } from "react";
import { cn } from "@/lib/utils";

type KPIAlertStatus = "success" | "warning" | "error";

type KPIAlertItem = {
  title: string;
  value: string;
  target: string;
  status?: KPIAlertStatus;
};

const STATUS_STYLES: Record<
  KPIAlertStatus,
  { bg: string; border: string; text: string; badge: string }
> = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-700",
    badge: "bg-emerald-100",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    text: "text-amber-700",
    badge: "bg-amber-100",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-100",
    text: "text-red-700",
    badge: "bg-red-100",
  },
};

const KPIAlertMiniCard: FC<KPIAlertItem> = ({
  title,
  value,
  target,
  status = "error",
}) => {
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.error;
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 p-2 rounded-md border text-xs",
        styles.bg,
        styles.border,
      )}
    >
      <span className="truncate max-w-[160px] text-gray-700">{title}</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={cn("font-bold", styles.text)}>{value}</span>
        <span
          className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap",
            styles.badge,
            styles.text,
          )}
        >
          Meta: {target}
        </span>
      </div>
    </div>
  );
};

const isKpiAlertItem = (value: unknown): value is KPIAlertItem =>
  !!value &&
  typeof value === "object" &&
  "title" in value &&
  "value" in value &&
  "target" in value;

const extractKpiAlertItems = (raw: string): KPIAlertItem[] => {
  const items: KPIAlertItem[] = [];
  let i = 0;

  while (i < raw.length) {
    const start = raw.indexOf("{", i);
    if (start === -1) break;

    let depth = 0;
    let end = -1;
    for (let j = start; j < raw.length; j++) {
      if (raw[j] === "{") depth++;
      else if (raw[j] === "}") {
        depth--;
        if (depth === 0) {
          end = j;
          break;
        }
      }
    }
    if (end === -1) break;

    try {
      const parsed = JSON.parse(raw.slice(start, end + 1));
      if (isKpiAlertItem(parsed)) items.push(parsed);
    } catch {
      // incomplete/invalid chunk, skip it
    }
    i = end + 1;
  }

  return items;
};

const KPIAlertMiniCardSkeleton: FC = () => (
  <div className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-100 animate-pulse">
    <div className="h-3 w-24 rounded bg-gray-200" />
    <div className="flex items-center gap-2">
      <div className="h-3 w-10 rounded bg-gray-200" />
      <div className="h-4 w-16 rounded bg-gray-200" />
    </div>
  </div>
);

export const KPIAlertMiniCardList: FC<{ raw: string }> = ({ raw }) => {
  const items = extractKpiAlertItems(raw);

  return (
    <div className="space-y-1.5 my-2">
      {items.map((item, index) => (
        <KPIAlertMiniCard
          key={`${item.title}-${index}`}
          title={item.title}
          value={item.value}
          target={item.target}
          status={item.status}
        />
      ))}
      {items.length === 0 && <KPIAlertMiniCardSkeleton />}
    </div>
  );
};
