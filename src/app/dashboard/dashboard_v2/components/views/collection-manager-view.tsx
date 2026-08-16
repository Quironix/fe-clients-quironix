import { DebtorConcentrationCard } from "../debtor-concentration-card";
import { HeroCashDeviationCard } from "../hero-cash-deviation-card";
import { KpiGridMock } from "../kpi-card-mock";
import { TeamCapacityCard } from "../team-capacity-card";
import { TeamTable } from "../team-table";
import { MOCK_KPIS_JEFE } from "../../constants/mock-kpis";
import { DebtorConcentrationItem, TeamMemberRow } from "../../types";
import { buildKpiGridItems, Level2KpiData } from "../../utils/kpi-adapter";
import { KPI } from "../../../overview/services/types";

interface CollectionManagerViewProps {
  team?: TeamMemberRow[];
  teamLoading?: boolean;
  debtorConcentration?: DebtorConcentrationItem[];
  debtorConcentrationLoading?: boolean;
  realKpis?: KPI[];
  level2Data?: Level2KpiData;
}

export const CollectionManagerView: React.FC<CollectionManagerViewProps> = ({
  team,
  teamLoading,
  debtorConcentration,
  debtorConcentrationLoading,
  realKpis,
  level2Data,
}) => {
  return (
    <div className="qxv2" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <HeroCashDeviationCard />
      <KpiGridMock items={buildKpiGridItems(MOCK_KPIS_JEFE, realKpis, level2Data)} />
      <TeamTable data={team} isLoading={teamLoading} />
      <div className="qxv2-v2-grid">
        <DebtorConcentrationCard
          data={debtorConcentration}
          isLoading={debtorConcentrationLoading}
        />
        <TeamCapacityCard />
      </div>
    </div>
  );
};
