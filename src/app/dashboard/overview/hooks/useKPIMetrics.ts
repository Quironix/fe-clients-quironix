import { useMemo } from "react";
import { KPI } from "../services/types";
import {
  calculateKPIStatus,
  calculateKPITrend,
  getCategoryBadgeClasses,
  getColorByStatus,
  getProgressPercentage,
  KPICategoryBadge,
  KPIStatusInfo,
  KPITrendInfoNullable,
} from "../utils/kpi-utils";

export interface KPIMetrics {
  status: KPIStatusInfo;
  trend: KPITrendInfoNullable;
  categoryBadge: KPICategoryBadge;
  progressPercentage: number;
  statusColor: string;
}

export const useKPIMetrics = (kpi: KPI): KPIMetrics => {
  return useMemo(() => {
    const status = calculateKPIStatus(kpi.value, kpi.thresholds);
    const trend = calculateKPITrend(kpi);
    const categoryBadge = getCategoryBadgeClasses(kpi.type);
    const progressPercentage = getProgressPercentage(
      kpi.value,
      kpi.target,
      kpi.thresholds.direction
    );
    const statusColor = getColorByStatus(status.color);

    return {
      status,
      trend,
      categoryBadge,
      progressPercentage,
      statusColor,
    };
  }, [kpi.value, kpi.thresholds, kpi.type, kpi.target, kpi.history]);
};
