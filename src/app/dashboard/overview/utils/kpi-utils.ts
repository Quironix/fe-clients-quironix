import { KPI, KPIStatus, KPIThresholds } from "../services/types";
import { CATEGORY_BADGE_STYLES, STATUS_COLORS, STATUS_LABELS } from "../constants/kpi-constants";

export interface KPIStatusInfo {
  status: KPIStatus;
  color: "emerald" | "amber" | "red";
  label: string;
}

export interface KPITrendInfo {
  value: string;
  direction: "up" | "down" | "stable";
  isGood: boolean;
}

export type KPITrendInfoNullable = KPITrendInfo | null;

export interface KPICategoryBadge {
  bg: string;
  text: string;
  border: string;
}

export const calculateKPIStatus = (
  value: number,
  thresholds: KPIThresholds
): KPIStatusInfo => {
  const { sla, acceptance_criteria, direction } = thresholds;

  let status: KPIStatus;

  if (direction === "ascending") {
    if (value >= acceptance_criteria) {
      status = "success";
    } else if (value >= sla) {
      status = "warning";
    } else {
      status = "error";
    }
  } else {
    if (value <= acceptance_criteria) {
      status = "success";
    } else if (value <= sla) {
      status = "warning";
    } else {
      status = "error";
    }
  }

  const colorMap: Record<KPIStatus, "emerald" | "amber" | "red"> = {
    success: "emerald",
    warning: "amber",
    error: "red",
  };

  return {
    status,
    color: colorMap[status],
    label: STATUS_LABELS[status],
  };
};

export const calculateKPITrend = (kpi: KPI): KPITrendInfoNullable => {
  // Only calculate trend if there's real historical data
  if (!kpi.history || kpi.history.length < 2) {
    return null;
  }

  const current = kpi.value;
  const previous = kpi.history[kpi.history.length - 2].value;

  // Prevent division by zero
  if (previous === 0) {
    return null;
  }

  const diff = ((current - previous) / previous) * 100;

  // Check for NaN or Infinity
  if (!isFinite(diff)) {
    return null;
  }

  const isGood = kpi.thresholds.direction === "ascending" ? diff >= 0 : diff <= 0;

  return {
    value: Math.abs(diff).toFixed(1),
    direction: diff > 0 ? "up" : (diff < 0 ? "down" : "stable"),
    isGood,
  };
};

export const getStatusColors = (status: KPIStatus) => {
  return STATUS_COLORS[status];
};

export const getCategoryBadgeClasses = (
  category: string
): KPICategoryBadge => {
  return (
    CATEGORY_BADGE_STYLES[category as keyof typeof CATEGORY_BADGE_STYLES] || {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
    }
  );
};

export const formatKPIValue = (value: number, unit: string): string => {
  const formattedValue = Math.round(value * 100) / 100;
  return `${formattedValue}${unit}`;
};

export const getProgressPercentage = (
  current: number,
  target: number,
  direction?: "ascending" | "descending"
): number => {
  if (target === 0) return 0;

  if (direction === "descending") {
    if (current <= target) return 100;
    return Math.max(0, 100 - ((current - target) / target) * 100);
  }

  return Math.min((current / target) * 100, 100);
};

export const getColorByStatus = (color: "emerald" | "amber" | "red"): string => {
  const colorMap = {
    emerald: STATUS_COLORS.success.hex,
    amber: STATUS_COLORS.warning.hex,
    red: STATUS_COLORS.error.hex,
  };
  return colorMap[color];
};

export const getPreviousValue = (kpi: KPI): number => {
  if (kpi.history && kpi.history.length > 1) {
    return kpi.history[kpi.history.length - 2].value;
  }
  return kpi.value * 0.95;
};

export const getTrendDirection = (
  value: number,
  target: number,
  direction: "ascending" | "descending"
): "up" | "down" | "stable" => {
  if (value === target) return "stable";

  if (value > target) {
    return direction === "ascending" ? "up" : "down";
  } else {
    return direction === "ascending" ? "down" : "up";
  }
};

export const isMetricDescending = (metricName: string): boolean => {
  return metricName.includes("OVER_DUE") ||
    metricName === "DDO" ||
    metricName === "DBT" ||
    metricName === "DSO";
};
