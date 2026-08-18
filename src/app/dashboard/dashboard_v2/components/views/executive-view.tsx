import { KpiGridMock } from "../kpi-card-mock";
import { MyProgressCard } from "../my-progress-card";
import { MyRankingCard } from "../my-ranking-card";
import { MyTrendCard } from "../my-trend-card";
import { PipelineCard } from "../pipeline-card";
import { TodayPriorities } from "../today-priorities";
import { TodayStatsGrid } from "../today-stats-grid";
import { MOCK_KPIS_EJECUTIVO } from "../../constants/mock-kpis";
import {
  ContactEffectivenessData,
  MyProgressData,
  TaskProgressData,
  TeamMemberRow,
  TodayPriorityTask,
  UpcomingCommitmentDay,
  WeeklyCashTrendItem,
} from "../../types";
import { buildKpiGridItems, Level2KpiData } from "../../utils/kpi-adapter";
import { KPI } from "../../../overview/services/types";

interface ExecutiveViewProps {
  priorities?: TodayPriorityTask[];
  prioritiesLoading?: boolean;
  ranking?: TeamMemberRow[];
  rankingLoading?: boolean;
  currentExecutiveId?: string;
  realKpis?: KPI[];
  taskProgress?: TaskProgressData;
  contactEffectiveness?: ContactEffectivenessData;
  todayStatsLoading?: boolean;
  upcomingCommitments?: UpcomingCommitmentDay[];
  upcomingCommitmentsLoading?: boolean;
  weeklyTrend?: WeeklyCashTrendItem[];
  weeklyTrendLoading?: boolean;
  level2Data?: Level2KpiData;
  myProgress?: MyProgressData | null;
  myProgressLoading?: boolean;
}

export const ExecutiveView: React.FC<ExecutiveViewProps> = ({
  priorities,
  prioritiesLoading,
  ranking,
  currentExecutiveId,
  realKpis,
  taskProgress,
  contactEffectiveness,
  todayStatsLoading,
  upcomingCommitments,
  upcomingCommitmentsLoading,
  weeklyTrend,
  weeklyTrendLoading,
  level2Data,
  myProgress,
  myProgressLoading,
}) => {
  return (
    <div className="qxv2" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <TodayStatsGrid
        taskProgress={taskProgress}
        contactEffectiveness={contactEffectiveness}
        upcomingCommitments={upcomingCommitments}
        isLoading={todayStatsLoading}
      />
      <TodayPriorities data={priorities} isLoading={prioritiesLoading} />
      <div className="qxv2-fwd-grid">
        <PipelineCard
          data={upcomingCommitments}
          isLoading={upcomingCommitmentsLoading}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <MyProgressCard
            dailyGoal={myProgress?.daily_goal}
            weeklyGoal={myProgress?.weekly_goal}
            monthlyGoal={myProgress?.monthly_goal}
            isLoading={myProgressLoading}
          />
          <MyRankingCard
            team={ranking}
            currentExecutiveId={currentExecutiveId}
            upcomingCommitments={upcomingCommitments}
          />
        </div>
      </div>
      <MyTrendCard data={weeklyTrend} isLoading={weeklyTrendLoading} />
      <KpiGridMock items={buildKpiGridItems(MOCK_KPIS_EJECUTIVO, realKpis, level2Data)} />
    </div>
  );
};
