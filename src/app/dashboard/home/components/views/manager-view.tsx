import { viewRoot } from "../dash-card";
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
    <div className={viewRoot}>
      <div className="grid grid-cols-1 gap-4 min-[1181px]:grid-cols-[318px_minmax(0,1fr)]">
        <QuironscoreCard />
        <ExecutiveSummaryCard />
      </div>
      <HeroCashDeviationCard />
      <div className="grid grid-cols-1 items-start gap-4 min-[1081px]:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4">
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
