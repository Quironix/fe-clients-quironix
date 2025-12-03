import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon, InfoIcon, MinusIcon } from "lucide-react";
import { KPI } from "../services/types";

interface KPICardProps {
  kpi: KPI;
}

export const KPICard = ({ kpi }: KPICardProps) => {
  const getStatusColor = () => {
    switch (kpi.status) {
      case "success":
        return "bg-green-50 border-green-500 text-green-900";
      case "warning":
        return "bg-orange-50 border-orange-500 text-orange-900";
      case "error":
        return "bg-red-50 border-red-500 text-red-900";
      default:
        return "bg-gray-100 border-gray-500 text-gray-700";
    }
  };

  const getStatusBadge = () => {
    switch (kpi.status) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-orange-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = () => {
    switch (kpi.status) {
      case "success":
        return "En Meta";
      case "warning":
        return "Atención";
      case "error":
        return "Crítico";
      default:
        return "N/A";
    }
  };

  const getTrendIcon = () => {
    if (!kpi.trend) return null;

    const isGoodTrend =
      (kpi.thresholds.direction === "ascending" && kpi.trend === "up") ||
      (kpi.thresholds.direction === "descending" && kpi.trend === "down");

    switch (kpi.trend) {
      case "up":
        return <ArrowUpIcon className={cn("h-4 w-4", isGoodTrend ? "text-green-600" : "text-red-600")} />;
      case "down":
        return <ArrowDownIcon className={cn("h-4 w-4", isGoodTrend ? "text-green-600" : "text-red-600")} />;
      case "stable":
        return <MinusIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className={cn("p-4 border-l-4 transition-all hover:shadow-lg", getStatusColor())}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base">{kpi.name}</h3>
            <div className={cn("h-2.5 w-2.5 rounded-full", getStatusBadge())} />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
              {kpi.type}
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <InfoIcon className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="text-sm font-semibold mb-2">{kpi.name}</p>
                  <p className="text-xs mb-2">{kpi.definition}</p>
                  {kpi.sla && (
                    <p className="text-xs">
                      <span className="font-semibold">SLA:</span> {kpi.sla}
                    </p>
                  )}
                  {kpi.criterio && (
                    <p className="text-xs">
                      <span className="font-semibold">Criterio de Aceptación:</span> {kpi.criterio}
                    </p>
                  )}
                  <p className="text-xs mt-2">
                    <span className="font-semibold">Rango:</span> {kpi.thresholds.low} - {kpi.thresholds.high}{kpi.unit}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between mt-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {kpi.value}
              <span className="text-lg ml-1">{kpi.unit}</span>
            </span>
            {getTrendIcon()}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            <span className="font-medium">Meta:</span> {kpi.target}{kpi.unit}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Rango: {kpi.thresholds.low} - {kpi.thresholds.high}{kpi.unit}
          </div>
        </div>

        <div className="text-right">
          <div className={cn(
            "text-xs font-semibold px-3 py-1.5 rounded-full border",
            kpi.status === "success" && "bg-green-100 text-green-700 border-green-300",
            kpi.status === "warning" && "bg-orange-100 text-orange-700 border-orange-300",
            kpi.status === "error" && "bg-red-100 text-red-700 border-red-300"
          )}>
            {getStatusLabel()}
          </div>
        </div>
      </div>
    </Card>
  );
};
