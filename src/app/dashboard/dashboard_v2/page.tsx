"use client";
import "./dashboard-v2.css";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { LayoutGrid } from "lucide-react";
import { Suspense, useMemo } from "react";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { useKPIData } from "../overview/hooks/useKPIData";
import { QuironProvider } from "./components/ai/quiron-context";
import { QuironWidget } from "./components/ai/quiron-widget";
import { DashboardViewSwitcher } from "./components/dashboard-view-switcher";
import { CollectionManagerView } from "./components/views/collection-manager-view";
import { ExecutiveView } from "./components/views/executive-view";
import { GenericView } from "./components/views/generic-view";
import { ManagerView } from "./components/views/manager-view";
import { useActiveDashboardType } from "./hooks/useActiveDashboardType";
import { useAvailableDashboardTypes } from "./hooks/useAvailableDashboardTypes";
import {
  useAgingBuckets,
  useCashTrendWeekly,
  useCommitmentsSummary,
  useContactEffectiveness,
  useDebtorConcentration,
  useDsoProjection,
  useInvoicePhaseDistribution,
  useMyProgress,
  useTaskProgress,
  useTeamCapacity,
  useTeamOverview,
  useTodayPriorities,
  useUpcomingCommitments,
} from "./hooks/useDashboardAggregates";
import { Level2KpiData } from "./utils/kpi-adapter";

const DashboardV2Content = () => {
  const { profile, session } = useProfileContext();
  const accessToken = session?.token || "";
  const clientId = profile?.client?.id || "";
  const currentUserId = profile?.id || "";

  const availableTypes = useAvailableDashboardTypes(profile as { roles?: { dashboard_type?: "MANAGER" | "COLLECTION_MANAGER" | "EXECUTIVE" | null }[] } | null);
  const [activeType, setActiveType] = useActiveDashboardType(availableTypes);

  const isManager = activeType === "MANAGER";
  const isJefe = activeType === "COLLECTION_MANAGER";
  const isExecutive = activeType === "EXECUTIVE";

  const {
    data: kpiData,
    isLoading,
    error,
  } = useKPIData({
    accessToken,
    clientId,
    executiveId: isExecutive ? currentUserId : null,
    enabled: !!accessToken && !!clientId,
  });

  const { data: agingBuckets, isLoading: agingLoading } = useAgingBuckets({
    accessToken,
    clientId,
    enabled: isManager,
  });

  const { data: debtorConcentration, isLoading: concentrationLoading } =
    useDebtorConcentration({
      accessToken,
      clientId,
      enabled: isManager || isJefe,
    });

  const { data: dsoProjection, isLoading: dsoLoading } = useDsoProjection({
    accessToken,
    clientId,
    enabled: isManager,
  });

  const { data: team, isLoading: teamLoading } = useTeamOverview({
    accessToken,
    clientId,
    enabled: isJefe || isExecutive,
  });

  const { data: priorities, isLoading: prioritiesLoading } =
    useTodayPriorities({
      accessToken,
      clientId,
      executiveId: currentUserId,
      enabled: isExecutive,
    });

  // Level 2 hooks
  const { data: taskProgress, isLoading: taskProgressLoading } = useTaskProgress({
    accessToken,
    clientId,
    executiveId: isExecutive ? currentUserId : undefined,
    teamWide: isJefe,
    enabled: isJefe || isExecutive,
  });

  const { data: commitmentsSummary } = useCommitmentsSummary({
    accessToken,
    clientId,
    executiveId: isExecutive ? currentUserId : undefined,
    enabled: isJefe || isExecutive,
  });

  const { data: contactEffectiveness, isLoading: contactEffectivenessLoading } =
    useContactEffectiveness({
      accessToken,
      clientId,
      executiveId: isExecutive ? currentUserId : undefined,
      period: isExecutive ? "day" : "month",
      enabled: isJefe || isExecutive,
    });

  const { data: invoicePhase } = useInvoicePhaseDistribution({
    accessToken,
    clientId,
    executiveId: isExecutive ? currentUserId : undefined,
    phase: 1,
    enabled: isExecutive,
  });

  const { data: upcomingCommitments, isLoading: upcomingLoading } =
    useUpcomingCommitments({
      accessToken,
      clientId,
      executiveId: isExecutive ? currentUserId : undefined,
      days: 7,
      enabled: isExecutive,
    });

  const { data: weeklyTrend, isLoading: trendLoading } = useCashTrendWeekly({
    accessToken,
    clientId,
    executiveId: isExecutive ? currentUserId : undefined,
    weeks: 8,
    enabled: isExecutive,
  });

  const { data: myProgress, isLoading: myProgressLoading } = useMyProgress({
    accessToken,
    clientId,
    enabled: isExecutive,
  });

  const { data: teamCapacity, isLoading: teamCapacityLoading } =
    useTeamCapacity({
      accessToken,
      clientId,
      enabled: isJefe,
    });

  const todayStatsLoading =
    taskProgressLoading || contactEffectivenessLoading || upcomingLoading;

  const level2Data: Level2KpiData = useMemo(
    () => ({
      taskProgress,
      commitmentsSummary,
      contactEffectiveness,
      invoicePhase,
    }),
    [taskProgress, commitmentsSummary, contactEffectiveness, invoicePhase],
  );

  const kpis = kpiData?.data || [];
  const indicators = kpiData?.indicators;

  return (
    <QuironProvider enabled={!isExecutive}>
      <Header fixed>
        <Language />
      </Header>
      <Main className="peer-[.header-fixed]/header:mt-20 pr-2 p-10 py-4">
        <TitleSection
          title="Dashboard"
          description="Revisa tus indicadores clave de rendimiento"
          icon={<LayoutGrid color="white" />}
          subDescription="Dashboard V2"
        />
        <div className="-mx-4 flex-1 px-4 py-4">
          {availableTypes.length > 1 && (
            <div className="mb-4">
              <DashboardViewSwitcher
                options={availableTypes}
                value={activeType}
                onChange={setActiveType}
              />
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 p-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500" />
              <p className="text-lg font-semibold text-gray-700">
                Cargando dashboard...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-4 p-12">
              <div className="text-red-500 text-4xl">⚠️</div>
              <p className="text-lg font-semibold text-gray-700">
                Error al cargar el dashboard
              </p>
              <p className="text-sm text-gray-500">{error.message}</p>
            </div>
          ) : isManager ? (
            <ManagerView
              agingBuckets={agingBuckets}
              agingBucketsLoading={agingLoading}
              debtorConcentration={debtorConcentration}
              debtorConcentrationLoading={concentrationLoading}
              dsoProjection={dsoProjection}
              dsoProjectionLoading={dsoLoading}
              realKpis={kpis}
              level2Data={level2Data}
            />
          ) : isJefe ? (
            <CollectionManagerView
              team={team}
              teamLoading={teamLoading}
              debtorConcentration={debtorConcentration}
              debtorConcentrationLoading={concentrationLoading}
              realKpis={kpis}
              level2Data={level2Data}
              teamCapacity={teamCapacity}
              teamCapacityLoading={teamCapacityLoading}
            />
          ) : isExecutive ? (
            <ExecutiveView
              priorities={priorities}
              prioritiesLoading={prioritiesLoading}
              ranking={team}
              rankingLoading={teamLoading}
              currentExecutiveId={currentUserId}
              realKpis={kpis}
              taskProgress={taskProgress}
              contactEffectiveness={contactEffectiveness}
              todayStatsLoading={todayStatsLoading}
              upcomingCommitments={upcomingCommitments}
              upcomingCommitmentsLoading={upcomingLoading}
              weeklyTrend={weeklyTrend}
              weeklyTrendLoading={trendLoading}
              level2Data={level2Data}
              myProgress={myProgress}
              myProgressLoading={myProgressLoading}
            />
          ) : (
            <GenericView kpis={kpis} indicators={indicators} />
          )}
        </div>
      </Main>
      <QuironWidget dashboardType={activeType} kpis={kpis} />
    </QuironProvider>
  );
};

const DashboardV2Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500" />
        </div>
      }
    >
      <DashboardV2Content />
    </Suspense>
  );
};

export default DashboardV2Page;
