import { Activity, TrendingDown, TrendingUp } from "lucide-react";
import { KPI } from "../services/types";

interface KPISummaryHeaderProps {
  kpis: KPI[];
}

const getStatus = (kpi: KPI): string => {
  const { low, high, direction } = kpi.thresholds;
  const { value } = kpi;

  if (direction === "ascending") {
    if (value >= high) return "optimal";
    if (value >= low) return "warning";
    return "critical";
  }

  if (value <= low) return "optimal";
  if (value <= high) return "warning";
  return "critical";
};

export const KPISummaryHeader: React.FC<KPISummaryHeaderProps> = ({ kpis }) => {
  const stats = kpis.reduce(
    (acc, k) => {
      const s = getStatus(k);
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const health = Math.round(((stats.optimal || 0) / kpis.length) * 100);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400">Health Score</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{health}%</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Activity size={20} className="text-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400">Óptimos</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.optimal || 0}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400">En Alerta</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.warning || 0}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
            <Activity size={20} className="text-amber-500" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400">Críticos</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.critical || 0}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <TrendingDown size={20} className="text-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
