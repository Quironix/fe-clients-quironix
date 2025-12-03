import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2Icon,
  ClockIcon,
  XCircleIcon,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { KPI } from "../services/types";

interface KPIRadialOverviewProps {
  kpis: KPI[];
}

export const KPIRadialOverview = ({ kpis }: KPIRadialOverviewProps) => {
  const successCount = kpis.filter((k) => k.status === "success").length;
  const warningCount = kpis.filter((k) => k.status === "warning").length;
  const errorCount = kpis.filter((k) => k.status === "error").length;
  const total = kpis.length;

  const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;

  const data = [
    { name: "En Meta", value: successCount, color: "#10b981" },
    { name: "Atención", value: warningCount, color: "#f59e0b" },
    { name: "Críticos", value: errorCount, color: "#ef4444" },
  ];

  const stats = [
    {
      label: "Completados",
      value: successCount,
      icon: CheckCircle2Icon,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      iconBg: "bg-emerald-100",
    },
    {
      label: "En Progreso",
      value: warningCount,
      icon: ClockIcon,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      iconBg: "bg-amber-100",
    },
    {
      label: "Pendientes",
      value: errorCount,
      icon: XCircleIcon,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      iconBg: "bg-rose-100",
    },
  ];

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Rendimiento General
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Vista consolidada de KPIs
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {successRate}%
              </div>
              <div className="text-xs text-gray-500 mt-1">Efectividad</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${stat.bgColor}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`${stat.iconBg} h-10 w-10 rounded-full flex items-center justify-center`}
                  >
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className={`font-semibold ${stat.color}`}>
                      {stat.label}
                    </p>
                    <p className="text-xs text-gray-600">
                      {((stat.value / total) * 100).toFixed(0)}% del total
                    </p>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Última actualización:{" "}
            {new Date().toLocaleString("es-CL", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
