import { AgingBucketsCard } from "../aging-buckets-card";
import { DebtorConcentrationCard } from "../debtor-concentration-card";
import { ExecutiveSummaryCard } from "../executive-summary-card";
import { HeroCashDeviationCard } from "../hero-cash-deviation-card";
import { KpiGridMock } from "../kpi-card-mock";
import { ProjectionCard } from "../projection-card";
import { QuironscoreCard } from "../quironscore-card";
import { MOCK_KPIS_MANAGER } from "../../constants/mock-kpis";
import { AgingBucket, DebtorConcentrationItem } from "../../types";
import { buildKpiGridItems } from "../../utils/kpi-adapter";
import { KPI } from "../../../overview/services/types";

interface ManagerViewProps {
  agingBuckets?: AgingBucket[];
  agingBucketsLoading?: boolean;
  debtorConcentration?: DebtorConcentrationItem[];
  debtorConcentrationLoading?: boolean;
  realKpis?: KPI[];
}

export const ManagerView: React.FC<ManagerViewProps> = ({
  agingBuckets,
  agingBucketsLoading,
  debtorConcentration,
  debtorConcentrationLoading,
  realKpis,
}) => {
  return (
    <div className="qxv2" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="qxv2-hero-grid">
        <QuironscoreCard />
        <ExecutiveSummaryCard />
      </div>
      <HeroCashDeviationCard />
      <div className="qxv2-v2-grid">
        <div className="qxv2-v2-stack">
          <AgingBucketsCard data={agingBuckets} isLoading={agingBucketsLoading} />
          <ProjectionCard />
        </div>
        <DebtorConcentrationCard
          data={debtorConcentration}
          isLoading={debtorConcentrationLoading}
        />
      </div>
      <KpiGridMock items={buildKpiGridItems(MOCK_KPIS_MANAGER, realKpis)} />
    </div>
  );
};
