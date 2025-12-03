import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { GripVerticalIcon, InfoIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { KPI } from "../services/types";

interface KPICardCompactProps {
  kpi: KPI;
  isDragging?: boolean;
}

export const KPICardCompact = ({ kpi, isDragging }: KPICardCompactProps) => {
  const getStatusConfig = () => {
    switch (kpi.status) {
      case "success":
        return {
          badge: "bg-green-100 text-green-700 border-green-300",
          progress: "bg-green-500",
          border: "border-green-200",
        };
      case "warning":
        return {
          badge: "bg-orange-100 text-orange-700 border-orange-300",
          progress: "bg-orange-500",
          border: "border-orange-200",
        };
      case "error":
        return {
          badge: "bg-red-100 text-red-700 border-red-300",
          progress: "bg-red-500",
          border: "border-red-200",
        };
      default:
        return {
          badge: "bg-gray-100 text-gray-700 border-gray-200",
          progress: "bg-gray-500",
          border: "border-gray-200",
        };
    }
  };

  const getTrendIcon = () => {
    if (!kpi.trend) return null;

    const isGoodTrend =
      (kpi.thresholds.direction === "ascending" && kpi.trend === "up") ||
      (kpi.thresholds.direction === "descending" && kpi.trend === "down");

    if (kpi.trend === "up") {
      return (
        <TrendingUpIcon
          className={cn("h-3 w-3", isGoodTrend ? "text-green-600" : "text-red-600")}
        />
      );
    }
    if (kpi.trend === "down") {
      return (
        <TrendingDownIcon
          className={cn("h-3 w-3", isGoodTrend ? "text-green-600" : "text-red-600")}
        />
      );
    }
    return null;
  };

  const statusConfig = getStatusConfig();
  const progressPercentage =
    kpi.target > 0 ? Math.min((kpi.value / kpi.target) * 100, 100) : 0;

  return (
    <Card
      className={cn(
        "border-l-4 transition-all duration-200 hover:shadow-md",
        statusConfig.border,
        isDragging && "opacity-50 scale-95"
      )}
    >
      <div className="p-3">
        <div className="flex items-start gap-2">
          <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-0.5">
            <GripVerticalIcon className="h-4 w-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 truncate">
                  {kpi.name}
                </h4>
                <span className="text-xs text-gray-500">{kpi.type}</span>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
                      <InfoIcon className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs font-semibold mb-1">{kpi.name}</p>
                    <p className="text-xs text-gray-600">{kpi.definition}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  {kpi.value}
                </span>
                <span className="text-sm font-medium text-gray-600">{kpi.unit}</span>
                {getTrendIcon()}
              </div>

              <Badge
                variant="outline"
                className={cn("text-xs font-medium px-2 py-0.5 border", statusConfig.badge)}
              >
                {kpi.status === "success"
                  ? "En Meta"
                  : kpi.status === "warning"
                  ? "Atención"
                  : "Crítico"}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Meta: {kpi.target}{kpi.unit}</span>
                <span className="font-semibold text-gray-700">
                  {progressPercentage.toFixed(0)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-1.5" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
