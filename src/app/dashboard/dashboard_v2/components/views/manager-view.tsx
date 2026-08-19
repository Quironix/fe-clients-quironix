import { AgingBucketsCard } from "../aging-buckets-card";
import { DebtorConcentrationCard } from "../debtor-concentration-card";
import { ExecutiveSummaryCard } from "../executive-summary-card";
import { HeroCashDeviationCard } from "../hero-cash-deviation-card";
import { KpiGridMock } from "../kpi-card-mock";
import { ProjectionCard } from "../projection-card";
import { QuironscoreCard } from "../quironscore-card";
import { MOCK_KPIS_MANAGER } from "../../constants/mock-kpis";
import {
  AgingBucket,
  DebtorConcentrationItem,
  DsoProjectionData,
} from "../../types";
import { buildKpiGridItems, Level2KpiData } from "../../utils/kpi-adapter";
import { KPI } from "../../../overview/services/types";

interface ManagerViewProps {
  agingBuckets?: AgingBucket[];
  agingBucketsLoading?: boolean;
  debtorConcentration?: DebtorConcentrationItem[];
  debtorConcentrationLoading?: boolean;
  dsoProjection?: DsoProjectionData;
  dsoProjectionLoading?: boolean;
  realKpis?: KPI[];
  level2Data?: Level2KpiData;
}

export const ManagerView: React.FC<ManagerViewProps> = ({
  agingBuckets,
  agingBucketsLoading,
  debtorConcentration,
  debtorConcentrationLoading,
  dsoProjection,
  dsoProjectionLoading,
  realKpis,
  level2Data,
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
          <ProjectionCard data={dsoProjection} isLoading={dsoProjectionLoading} />
        </div>
        <DebtorConcentrationCard
          data={debtorConcentration}
          isLoading={debtorConcentrationLoading}
        />
      </div>
      <KpiGridMock items={buildKpiGridItems(MOCK_KPIS_MANAGER, realKpis, level2Data)} />
    </div>
  );
};
