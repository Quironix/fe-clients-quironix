import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircleIcon, CheckCircleIcon, TrendingUpIcon } from "lucide-react";

interface CategoryStats {
  total: number;
  success: number;
  warning: number;
  error: number;
}

interface KPICategorySummaryProps {
  title: string;
  stats: CategoryStats;
  icon?: React.ReactNode;
  color?: string;
}

export const KPICategorySummary = ({
  title,
  stats,
  icon,
  color = "blue",
}: KPICategorySummaryProps) => {
  const successRate = stats.total > 0 ? (stats.success / stats.total) * 100 : 0;

  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-700",
          icon: "text-blue-600",
        };
      case "purple":
        return {
          bg: "bg-purple-50",
          border: "border-purple-200",
          text: "text-purple-700",
          icon: "text-purple-600",
        };
      case "indigo":
        return {
          bg: "bg-indigo-50",
          border: "border-indigo-200",
          text: "text-indigo-700",
          icon: "text-indigo-600",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-700",
          icon: "text-gray-600",
        };
    }
  };

  const colors = getColorClasses();

  return (
    <Card className={`border-2 ${colors.border} ${colors.bg}`}>
      <CardHeader className="pb-3">
        <CardTitle className={`text-base font-semibold ${colors.text} flex items-center gap-2`}>
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
          <span className="text-sm text-gray-600">KPIs totales</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              <span className="text-gray-700">En Meta</span>
            </div>
            <span className="font-semibold text-green-700">{stats.success}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4 text-orange-600" />
              <span className="text-gray-700">Atención</span>
            </div>
            <span className="font-semibold text-orange-700">{stats.warning}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <AlertCircleIcon className="h-4 w-4 text-red-600" />
              <span className="text-gray-700">Críticos</span>
            </div>
            <span className="font-semibold text-red-700">{stats.error}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Tasa de Cumplimiento</span>
            <span className="text-sm font-bold text-gray-900">{successRate.toFixed(1)}%</span>
          </div>
          <Progress value={successRate} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};
