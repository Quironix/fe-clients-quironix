import { Activity, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Indicators, KPI } from "../services/types";

interface KPISummaryHeaderProps {
  indicators: Indicators;
}

const getStatus = (kpi: KPI): string => {
  const { sla, acceptance_criteria, direction } = kpi.thresholds;
  const { value } = kpi;

  if (direction === "ascending") {
    if (value >= acceptance_criteria) return "optimal";
    if (value >= sla) return "warning";
    return "critical";
  }

  if (value <= acceptance_criteria) return "optimal";
  if (value <= sla) return "warning";
  return "critical";
};

const toPercentage = (value) => {
  return (value * 100).toFixed(0) + "%";
};

export const KPISummaryHeader: React.FC<KPISummaryHeaderProps> = ({
  indicators,
}) => {
  const t = useTranslations("overview");
  // const stats = kpis.reduce(
  //   (acc, k) => {
  //     const s = getStatus(k);
  //     acc[s] = (acc[s] || 0) + 1;
  //     return acc;
  //   },
  //   {} as Record<string, number>
  // );

  // const health = Math.round(((stats.optimal || 0) / kpis.length) * 100);

  return (
    <div className="grid grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
      <div className="bg-white border border-gray-200 rounded-xl p-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-md font-medium text-gray-400">{t("healthScore")}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {toPercentage(indicators?.optimal || 0)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Activity size={20} className="text-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-md font-medium text-gray-400">{t("optimal")}</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {toPercentage(indicators?.optimal || 0)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-md font-medium text-gray-400">{t("alert")}</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {indicators?.alert || 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
            <Activity size={20} className="text-amber-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
