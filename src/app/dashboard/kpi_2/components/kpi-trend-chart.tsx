import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { KPI } from "../services/types";

interface KPITrendChartProps {
  kpis: KPI[];
  title?: string;
}

export const KPITrendChart = ({
  kpis,
  title = "Tendencias de KPIs",
}: KPITrendChartProps) => {
  if (kpis.length === 0 || !kpis[0].history || kpis[0].history.length === 0) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-gray-500">
          No hay datos históricos disponibles
        </CardContent>
      </Card>
    );
  }

  const kpi = kpis[0];
  const chartData = kpi.history.map((h) => ({
    date: format(new Date(h.date), "d MMM", { locale: es }),
    fullDate: format(new Date(h.date), "PPP", { locale: es }),
    value: h.value,
    target: kpi.target,
  }));

  const getGradientId = () => {
    if (kpi.status === "success") return "colorSuccess";
    if (kpi.status === "warning") return "colorWarning";
    return "colorError";
  };

  const getColor = () => {
    if (kpi.status === "success") return "#2563eb";
    if (kpi.status === "warning") return "#ff8113";
    return "#ef4444";
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-xl">
          <p className="font-semibold text-sm text-gray-900 mb-1">
            {payload[0].payload.fullDate}
          </p>
          <p className="text-xs text-gray-600">
            Valor:{" "}
            <span className="font-bold text-gray-900">
              {payload[0].value}
              {kpi.unit}
            </span>
          </p>
          <p className="text-xs text-gray-600">
            Meta:{" "}
            <span className="font-bold text-gray-900">
              {payload[1].value}
              {kpi.unit}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          {kpi.name} - {title}
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">{kpi.definition}</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff8113" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff8113" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={getColor()}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#${getGradientId()})`}
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={0}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getColor() }} />
            <span className="text-gray-700 font-medium">Valor Real</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-12 border-2 border-dashed border-gray-400 rounded" />
            <span className="text-gray-700 font-medium">Meta</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
