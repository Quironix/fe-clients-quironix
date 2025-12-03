import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { KPI } from "../services/types";

interface KPIGaugeProps {
  kpi: KPI;
  size?: "sm" | "md" | "lg";
}

export const KPIGauge = ({ kpi, size = "md" }: KPIGaugeProps) => {
  const percentage = kpi.target > 0 ? (kpi.value / kpi.target) * 100 : 0;
  const normalizedPercentage = Math.min(Math.max(percentage, 0), 100);

  const getColor = () => {
    if (kpi.status === "success") return "#10b981";
    if (kpi.status === "warning") return "#ff8113";
    return "#ef4444";
  };

  const getStatusBadge = () => {
    if (kpi.status === "success") return "En Meta";
    if (kpi.status === "warning") return "Atención";
    return "Crítico";
  };

  const getStatusBadgeColor = () => {
    if (kpi.status === "success") return "bg-green-100 text-green-700 border-green-300";
    if (kpi.status === "warning") return "bg-orange-100 text-orange-700 border-orange-300";
    return "bg-red-100 text-red-700 border-red-300";
  };

  const data = [
    { name: "completed", value: normalizedPercentage },
    { name: "remaining", value: 100 - normalizedPercentage },
  ];

  const sizes = {
    sm: { height: 120, innerRadius: 35, outerRadius: 50 },
    md: { height: 160, innerRadius: 50, outerRadius: 70 },
    lg: { height: 200, innerRadius: 65, outerRadius: 90 },
  };

  const currentSize = sizes[size];

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold text-gray-900 line-clamp-1">
              {kpi.name}
            </CardTitle>
            <p className="text-xs text-gray-600 line-clamp-1">{kpi.type}</p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
                  <InfoIcon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm font-semibold mb-2">{kpi.name}</p>
                <p className="text-xs mb-2">{kpi.definition}</p>
                {kpi.sla && (
                  <p className="text-xs">
                    <span className="font-semibold">SLA:</span> {kpi.sla}
                  </p>
                )}
                {kpi.criterio && (
                  <p className="text-xs">
                    <span className="font-semibold">Criterio:</span> {kpi.criterio}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={currentSize.height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                startAngle={180}
                endAngle={0}
                innerRadius={currentSize.innerRadius}
                outerRadius={currentSize.outerRadius}
                paddingAngle={0}
                dataKey="value"
              >
                <Cell fill={getColor()} />
                <Cell fill="#e5e7eb" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: size === 'sm' ? '-10px' : size === 'md' ? '-20px' : '-30px' }}>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {kpi.value}
                <span className="text-sm ml-0.5">{kpi.unit}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Meta: {kpi.target}
                {kpi.unit}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-center">
            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusBadgeColor()}`}>
              {getStatusBadge()}
            </span>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600">
              Rango: {kpi.thresholds.low} - {kpi.thresholds.high}{kpi.unit}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
