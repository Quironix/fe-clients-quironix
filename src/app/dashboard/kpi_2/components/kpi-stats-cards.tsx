import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ActivityIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  XCircleIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { KPI } from "../services/types";

interface KPIStatsCardsProps {
  kpis: KPI[];
}

export const KPIStatsCards = ({ kpis }: KPIStatsCardsProps) => {
  const t = useTranslations("kpi.stats");
  const totalKPIs = kpis.length;
  const successKPIs = kpis.filter((k) => k.status === "success").length;
  const warningKPIs = kpis.filter((k) => k.status === "warning").length;
  const errorKPIs = kpis.filter((k) => k.status === "error").length;
  const successRate = totalKPIs > 0 ? (successKPIs / totalKPIs) * 100 : 0;

  const stats = [
    {
      title: t("totalIndicators"),
      value: totalKPIs,
      subtitle: t("activelyMonitored"),
      icon: ActivityIcon,
      iconBg: "bg-blue-500",
      cardBg: "bg-blue-50",
      iconColor: "text-white",
    },
    {
      title: t("onTarget"),
      value: successKPIs,
      subtitle: t("ofTotal", { percent: successRate.toFixed(0) }),
      icon: CheckCircle2Icon,
      iconBg: "bg-emerald-500",
      cardBg: "bg-emerald-50",
      iconColor: "text-white",
    },
    {
      title: t("needAttention"),
      value: warningKPIs,
      subtitle: t("reviewAndImprove"),
      icon: AlertTriangleIcon,
      iconBg: "bg-amber-500",
      cardBg: "bg-amber-50",
      iconColor: "text-white",
    },
    {
      title: t("critical"),
      value: errorKPIs,
      subtitle: t("immediateAction"),
      icon: XCircleIcon,
      iconBg: "bg-rose-500",
      cardBg: "bg-rose-50",
      iconColor: "text-white",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`${stat.cardBg} border-0 shadow-sm hover:shadow-md transition-all duration-300`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {stat.title}
              </CardTitle>
              <div
                className={`${stat.iconBg} h-11 w-11 rounded-full flex items-center justify-center shadow-sm`}
              >
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-gray-600 font-medium">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
