import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { KPI } from "../services/types";

interface KPICardEnhancedProps {
  kpi: KPI;
}

export const KPICardEnhanced = ({ kpi }: KPICardEnhancedProps) => {
  const getStatusConfig = () => {
    switch (kpi.status) {
      case "success":
        return {
          badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
          label: "En Meta",
          progressColor: "bg-emerald-500",
        };
      case "warning":
        return {
          badge: "bg-amber-100 text-amber-700 border-amber-200",
          label: "Atención",
          progressColor: "bg-amber-500",
        };
      case "error":
        return {
          badge: "bg-rose-100 text-rose-700 border-rose-200",
          label: "Crítico",
          progressColor: "bg-rose-500",
        };
      default:
        return {
          badge: "bg-gray-100 text-gray-700 border-gray-200",
          label: "Normal",
          progressColor: "bg-gray-500",
        };
    }
  };

  const getTrendIcon = () => {
    if (!kpi.trend) return null;

    switch (kpi.trend) {
      case "up":
        return (
          <div className="flex items-center gap-1 text-emerald-600">
            <TrendingUpIcon className="h-4 w-4" />
            <span className="text-xs font-semibold">+{((kpi.value / kpi.target) * 100 - 100).toFixed(1)}%</span>
          </div>
        );
      case "down":
        return (
          <div className="flex items-center gap-1 text-rose-600">
            <TrendingDownIcon className="h-4 w-4" />
            <span className="text-xs font-semibold">-{(100 - (kpi.value / kpi.target) * 100).toFixed(1)}%</span>
          </div>
        );
      case "stable":
        return (
          <div className="flex items-center gap-1 text-gray-600">
            <span className="text-xs font-semibold">Estable</span>
          </div>
        );
    }
  };

  const statusConfig = getStatusConfig();
  const progressPercentage =
    kpi.target > 0 ? Math.min((kpi.value / kpi.target) * 100, 100) : 0;

  return (
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-base text-gray-900 leading-tight mb-1">
              {kpi.name}
            </h3>
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium px-2 py-0.5 border",
                statusConfig.badge
              )}
            >
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-gray-900">
                {kpi.value}
              </span>
              <span className="text-lg font-semibold text-gray-600">
                {kpi.unit}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Meta: {kpi.target}
              {kpi.unit}
            </div>
          </div>
          {getTrendIcon()}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600 font-medium">Progreso</span>
            <span className="font-semibold text-gray-900">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", statusConfig.progressColor)}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {kpi.definition}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 font-medium uppercase tracking-wide">
            {kpi.type}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
