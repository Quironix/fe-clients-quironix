import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  AlertCircleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  MinusIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useKPIMetrics } from "../hooks/useKPIMetrics";
import { KPI } from "../services/types";
import { getStatusColors } from "../utils/kpi-utils";

interface KPICardDetailedProps {
  kpi: KPI;
  isDragging?: boolean;
}

export const KPICardDetailed = ({ kpi, isDragging }: KPICardDetailedProps) => {
  const { status, trend, progressPercentage } = useKPIMetrics(kpi);
  const statusColors = getStatusColors(status.status);

  const getStatusIcon = () => {
    switch (status.status) {
      case "success":
        return <TrendingUpIcon className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertCircleIcon className="h-5 w-5 text-orange-600" />;
      case "error":
        return <AlertCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <MinusIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;

    switch (trend.direction) {
      case "up":
        return (
          <ArrowUpIcon
            className={cn(
              "h-5 w-5",
              trend.isGood ? "text-green-600" : "text-red-600"
            )}
          />
        );
      case "down":
        return (
          <ArrowDownIcon
            className={cn(
              "h-5 w-5",
              trend.isGood ? "text-green-600" : "text-red-600"
            )}
          />
        );
      case "stable":
        return <MinusIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <Card
      className={cn(
        "border-0 transition-all duration-200 hover:shadow-lg",
        `border-${status.color}-200`,
        isDragging && "opacity-50 scale-95"
      )}
    >
      <CardHeader className={cn("py-3", `bg-${status.color}-50`)}>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
            {kpi.definition}
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-2">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-bold text-gray-900">
                {kpi.value}
              </span>
              <span className="text-xl font-semibold text-gray-600">
                {kpi.unit}
              </span>
              {getTrendIcon()}
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold px-2.5 py-1 border",
                statusColors.bg,
                statusColors.text,
                statusColors.border
              )}
            >
              {status.label.toUpperCase()}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <TrendingUpIcon className="h-4 w-4" />
              <span className="font-medium">Meta</span>
            </div>
            <span className="font-bold text-gray-900">
              {kpi.target}
              {kpi.unit}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-600">Progreso</span>
              <span className="font-bold text-gray-900">
                {progressPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2.5" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Rango Óptimo</span>
            <span className="font-semibold text-gray-900">
              {kpi.thresholds.direction === "ascending"
                ? `≥ ${kpi.thresholds.acceptance_criteria}${kpi.unit}`
                : `≤ ${kpi.thresholds.acceptance_criteria}${kpi.unit}`}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">SLA</span>
            <span className="font-semibold text-gray-900">
              {kpi.thresholds.direction === "ascending"
                ? `≥ ${kpi.thresholds.sla}${kpi.unit}`
                : `≤ ${kpi.thresholds.sla}${kpi.unit}`}
            </span>
          </div>
        </div>

        {kpi.lastUpdated && (
          <>
            <Separator />
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>
                Actualizado:{" "}
                {new Date(kpi.lastUpdated).toLocaleDateString("es-CL", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </>
        )}

        {(kpi.sla || kpi.criterio) && (
          <>
            <Separator />
            <div className="space-y-1.5">
              {kpi.sla && (
                <div className="text-xs">
                  <span className="font-semibold text-gray-700">SLA:</span>{" "}
                  <span className="text-gray-600">{kpi.sla}</span>
                </div>
              )}
              {kpi.criterio && (
                <div className="text-xs">
                  <span className="font-semibold text-gray-700">Criterio:</span>{" "}
                  <span className="text-gray-600">{kpi.criterio}</span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
