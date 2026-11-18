import { viewRoot } from "../dash-card";
import { DebtorConcentrationCard } from "../debtor-concentration-card";
import { HeroCashDeviationCard } from "../hero-cash-deviation-card";
import { KpiGridMock } from "../kpi-card-mock";
import { TeamCapacityCard } from "../team-capacity-card";
import { TeamTable } from "../team-table";
import { MOCK_KPIS_JEFE } from "../../constants/mock-kpis";
import {
  DebtorConcentrationItem,
  TeamCapacityMember,
  TeamMemberRow,
} from "../../types";
import { buildKpiGridItems, Level2KpiData } from "../../utils/kpi-adapter";
import { KPI } from "../../../overview/services/types";

interface CollectionManagerViewProps {
  team?: TeamMemberRow[];
  teamLoading?: boolean;
  debtorConcentration?: DebtorConcentrationItem[];
  debtorConcentrationLoading?: boolean;
  realKpis?: KPI[];
  level2Data?: Level2KpiData;
  teamCapacity?: TeamCapacityMember[] | null;
  teamCapacityLoading?: boolean;
}

export const CollectionManagerView: React.FC<CollectionManagerViewProps> = ({
  team,
  teamLoading,
  debtorConcentration,
  debtorConcentrationLoading,
  realKpis,
  level2Data,
  teamCapacity,
  teamCapacityLoading,
}) => {
  return (
    <div className={viewRoot}>
      <HeroCashDeviationCard />
      <KpiGridMock items={buildKpiGridItems(MOCK_KPIS_JEFE, realKpis, level2Data)} />
      <TeamTable data={team} isLoading={teamLoading} />
      <div className="grid grid-cols-1 items-start gap-4 min-[1081px]:grid-cols-2">
        <DebtorConcentrationCard
          data={debtorConcentration}
          isLoading={debtorConcentrationLoading}
        />
        <TeamCapacityCard data={teamCapacity} isLoading={teamCapacityLoading} />
      </div>
    </div>
  );
};
