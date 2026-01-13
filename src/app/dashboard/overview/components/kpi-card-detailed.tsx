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
  GripVerticalIcon,
  MinusIcon,
  TargetIcon,
  TrendingUpIcon,
} from "lucide-react";
import { KPI } from "../services/types";

interface KPICardDetailedProps {
  kpi: KPI;
  isDragging?: boolean;
}

export const KPICardDetailed = ({ kpi, isDragging }: KPICardDetailedProps) => {
  const getStatusConfig = () => {
    switch (kpi.status) {
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          badge: "bg-green-100 text-green-700 border-green-300",
          progress: "bg-green-500",
          icon: <TrendingUpIcon className="h-5 w-5 text-green-600" />,
        };
      case "warning":
        return {
          bg: "bg-orange-50",
          border: "border-orange-200",
          badge: "bg-orange-100 text-orange-700 border-orange-300",
          progress: "bg-orange-500",
          icon: <AlertCircleIcon className="h-5 w-5 text-orange-600" />,
        };
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          badge: "bg-red-100 text-red-700 border-red-300",
          progress: "bg-red-500",
          icon: <AlertCircleIcon className="h-5 w-5 text-red-600" />,
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          badge: "bg-gray-100 text-gray-700 border-gray-200",
          progress: "bg-gray-500",
          icon: <MinusIcon className="h-5 w-5 text-gray-600" />,
        };
    }
  };

  const getTrendIcon = () => {
    if (!kpi.trend) return null;

    const isGoodTrend =
      (kpi.thresholds.direction === "ascending" && kpi.trend === "up") ||
      (kpi.thresholds.direction === "descending" && kpi.trend === "down");

    switch (kpi.trend) {
      case "up":
        return (
          <ArrowUpIcon
            className={cn("h-5 w-5", isGoodTrend ? "text-green-600" : "text-red-600")}
          />
        );
      case "down":
        return (
          <ArrowDownIcon
            className={cn("h-5 w-5", isGoodTrend ? "text-green-600" : "text-red-600")}
          />
        );
      case "stable":
        return <MinusIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const statusConfig = getStatusConfig();
  const progressPercentage =
    kpi.target > 0 ? Math.min((kpi.value / kpi.target) * 100, 100) : 0;

  return (
    <Card
      className={cn(
        "border-2 transition-all duration-200 hover:shadow-lg",
        statusConfig.border,
        isDragging && "opacity-50 scale-95"
      )}
    >
      <CardHeader className={cn("pb-3", statusConfig.bg)}>
        <div className="flex items-start gap-3">
          <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1">
            <GripVerticalIcon className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-bold text-base text-gray-900 leading-tight mb-1">
                  {kpi.name}
                </h3>
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  {kpi.type}
                </span>
              </div>
              {statusConfig.icon}
            </div>

            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
              {kpi.definition}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-bold text-gray-900">{kpi.value}</span>
              <span className="text-xl font-semibold text-gray-600">{kpi.unit}</span>
              {getTrendIcon()}
            </div>
            <Badge
              variant="outline"
              className={cn("text-xs font-semibold px-2.5 py-1 border", statusConfig.badge)}
            >
              {kpi.status === "success"
                ? "EN META"
                : kpi.status === "warning"
                ? "ATENCIÓN"
                : "CRÍTICO"}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <TargetIcon className="h-4 w-4" />
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
              <span className="font-bold text-gray-900">{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2.5" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Rango</span>
            <span className="font-semibold text-gray-900">
              {kpi.thresholds.low} - {kpi.thresholds.high}
              {kpi.unit}
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
