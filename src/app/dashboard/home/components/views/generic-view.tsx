import { KPISummaryHeader } from "../../../overview/components/kpi-summary-header";
import { Indicators, KPI } from "../../../overview/services/types";
import { kpiGrid, viewRoot } from "../dash-card";
import { KpiCard } from "../kpi-card";

interface GenericViewProps {
  kpis: KPI[];
  indicators?: Indicators;
}

export const GenericView: React.FC<GenericViewProps> = ({
  kpis,
  indicators,
}) => {
  return (
    <div className={viewRoot}>
      <KPISummaryHeader indicators={indicators as Indicators} />
      <div className={kpiGrid}>
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </div>
  );
};
