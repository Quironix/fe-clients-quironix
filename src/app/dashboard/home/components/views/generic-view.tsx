import { KPISummaryHeader } from "../../../overview/components/kpi-summary-header";
import { Indicators, KPI } from "../../../overview/services/types";
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
    <div className="qxv2" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <KPISummaryHeader indicators={indicators as Indicators} />
      <div className="qxv2-kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </div>
  );
};
