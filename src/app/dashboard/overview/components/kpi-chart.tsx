import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { KPI, KPIStatus } from "../services/types";

interface KPIChartProps {
  kpis: KPI[];
  title?: string;
}

export const KPIChart = ({
  kpis,
  title = "Indicadores Prioritarios",
}: KPIChartProps) => {
  const chartData = kpis.map((kpi) => ({
    name: kpi.name.length > 20 ? kpi.name.substring(0, 20) + "..." : kpi.name,
    value: kpi.value,
    target: kpi.target,
    status: kpi.status,
    fullName: kpi.name,
    unit: kpi.unit,
  }));

  const getBarColor = (status: KPIStatus) => {
    switch (status) {
      case "success":
        return "#10b981";
      case "warning":
        return "#f59e0b";
      case "error":
        return "#ef4444";
      default:
        return "#9ca3af";
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const statusLabel = data.status === "success" ? "En Meta" : data.status === "warning" ? "Atención" : "Crítico";
      const statusColor = data.status === "success" ? "text-green-600" : data.status === "warning" ? "text-orange-600" : "text-red-600";

      return (
        <div className="bg-white p-4 border-2 border-gray-200 rounded-lg shadow-xl max-w-xs">
          <p className="font-semibold text-sm text-gray-900 mb-2">
            {data.fullName}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4">
              <span className="text-xs text-gray-600">Valor Actual:</span>
              <span className="font-bold text-sm text-gray-900">
                {data.value}{data.unit}
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-xs text-gray-600">Meta:</span>
              <span className="font-bold text-sm text-gray-900">
                {data.target}{data.unit}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <span className={`text-xs font-semibold ${statusColor}`}>
                Estado: {statusLabel}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          {title}
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Top {chartData.length} indicadores según prioridad
        </p>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 50 }}>
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={60}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
