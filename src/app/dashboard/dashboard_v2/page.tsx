"use client";
import "./dashboard-v2.css";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { LayoutGrid } from "lucide-react";
import { Suspense } from "react";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { useKPIData } from "../overview/hooks/useKPIData";
import { DashboardViewSwitcher } from "./components/dashboard-view-switcher";
import { CollectionManagerView } from "./components/views/collection-manager-view";
import { ExecutiveView } from "./components/views/executive-view";
import { GenericView } from "./components/views/generic-view";
import { ManagerView } from "./components/views/manager-view";
import { useActiveDashboardType } from "./hooks/useActiveDashboardType";
import { useAvailableDashboardTypes } from "./hooks/useAvailableDashboardTypes";
import {
  useAgingBuckets,
  useDebtorConcentration,
  useTeamOverview,
  useTodayPriorities,
} from "./hooks/useDashboardAggregates";

const DashboardV2Content = () => {
  const { profile, session } = useProfileContext();
  const accessToken = session?.token || "";
  const clientId = profile?.client?.id || "";
  const currentUserId = profile?.id || "";

  const availableTypes = useAvailableDashboardTypes(profile);
  const [activeType, setActiveType] = useActiveDashboardType(availableTypes);

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
    enabled: activeType === "MANAGER",
  });

  const { data: debtorConcentration, isLoading: concentrationLoading } =
    useDebtorConcentration({
      accessToken,
      clientId,
      enabled: activeType === "MANAGER" || activeType === "COLLECTION_MANAGER",
    });

  const { data: team, isLoading: teamLoading } = useTeamOverview({
    accessToken,
    clientId,
    enabled: activeType === "COLLECTION_MANAGER" || isExecutive,
  });

  const { data: priorities, isLoading: prioritiesLoading } =
    useTodayPriorities({
      accessToken,
      clientId,
      executiveId: currentUserId,
      enabled: isExecutive,
    });

  const kpis = kpiData?.data || [];
  const indicators = kpiData?.indicators;

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main className="peer-[.header-fixed]/header:mt-20 pr-2 p-10 py-4">
        <TitleSection
          title="Dashboard"
          description="Vista por rol — Manager, Jefe de Cobranza y Ejecutivo"
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
          ) : activeType === "MANAGER" ? (
            <ManagerView
              agingBuckets={agingBuckets}
              agingBucketsLoading={agingLoading}
              debtorConcentration={debtorConcentration}
              debtorConcentrationLoading={concentrationLoading}
              realKpis={kpis}
            />
          ) : activeType === "COLLECTION_MANAGER" ? (
            <CollectionManagerView
              team={team}
              teamLoading={teamLoading}
              debtorConcentration={debtorConcentration}
              debtorConcentrationLoading={concentrationLoading}
              realKpis={kpis}
            />
          ) : activeType === "EXECUTIVE" ? (
            <ExecutiveView
              priorities={priorities}
              prioritiesLoading={prioritiesLoading}
              ranking={team}
              rankingLoading={teamLoading}
              currentExecutiveId={currentUserId}
              realKpis={kpis}
            />
          ) : (
            <GenericView kpis={kpis} indicators={indicators} />
          )}
        </div>
      </Main>
    </>
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
