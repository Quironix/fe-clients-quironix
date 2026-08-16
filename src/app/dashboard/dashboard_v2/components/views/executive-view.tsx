import { KpiGridMock } from "../kpi-card-mock";
import { MyProgressCard } from "../my-progress-card";
import { MyRankingCard } from "../my-ranking-card";
import { MyTrendCard } from "../my-trend-card";
import { PipelineCard } from "../pipeline-card";
import { TodayPriorities } from "../today-priorities";
import { TodayStatsGrid } from "../today-stats-grid";
import { MOCK_KPIS_EJECUTIVO } from "../../constants/mock-kpis";
import { TeamMemberRow, TodayPriorityTask } from "../../types";
import { buildKpiGridItems } from "../../utils/kpi-adapter";
import { KPI } from "../../../overview/services/types";

interface ExecutiveViewProps {
  priorities?: TodayPriorityTask[];
  prioritiesLoading?: boolean;
  ranking?: TeamMemberRow[];
  rankingLoading?: boolean;
  currentExecutiveId?: string;
  realKpis?: KPI[];
}

export const ExecutiveView: React.FC<ExecutiveViewProps> = ({
  priorities,
  prioritiesLoading,
  ranking,
  currentExecutiveId,
  realKpis,
}) => {
  return (
    <div className="qxv2" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <TodayStatsGrid />
      <TodayPriorities data={priorities} isLoading={prioritiesLoading} />
      <div className="qxv2-fwd-grid">
        <PipelineCard />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <MyProgressCard />
          <MyRankingCard team={ranking} currentExecutiveId={currentExecutiveId} />
        </div>
      </div>
      <MyTrendCard />
      <KpiGridMock items={buildKpiGridItems(MOCK_KPIS_EJECUTIVO, realKpis)} />
    </div>
  );
};
