"use client";

import Language from "@/components/ui/language";
import { PhoneCall } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense, useState } from "react";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { DailyPlanFilters } from "./components/daily-plan-filters";
import { DailyPlanList } from "./components/daily-plan-list";
import IndicatorsDebtor from "./components/indicators-debtors";
import { TaskFilters } from "./components/task-filters";
import { TasksList } from "./components/tasks-list";
import { useDailyPlan } from "./hooks/useDailyPlan";
import { useTaskEngineMode } from "./hooks/useTaskEngineMode";
import { QuadrantType } from "./services/types";
import { DailyPlanTab } from "./types/daily-plan";

const PAGE_LIMIT = 20;

const QuadrantTasks = () => {
  const [selectedQuadrant, setSelectedQuadrant] = useState<QuadrantType>(null);

  return (
    <>
      <TaskFilters
        selectedQuadrant={selectedQuadrant}
        onQuadrantChange={setSelectedQuadrant}
      />
      <TasksList selectedQuadrant={selectedQuadrant} />
    </>
  );
};

const DailyPlanTasks = () => {
  const [tab, setTab] = useState<DailyPlanTab>("ALL");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useDailyPlan({
    tab,
    page,
    limit: PAGE_LIMIT,
  });

  const changeTab = (next: DailyPlanTab) => {
    setTab(next);
    setPage(1);
  };

  const changePage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <DailyPlanFilters
        selectedTab={tab}
        countsByTab={data?.countsByTab}
        onTabChange={changeTab}
      />
      <DailyPlanList
        data={data}
        isLoading={isLoading}
        isError={isError}
        onPageChange={changePage}
      />
    </>
  );
};

const Content = () => {
  const t = useTranslations("debtorManagement");
  const { data: engineMode } = useTaskEngineMode();

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title={t("title")}
          description={t("description")}
          icon={<PhoneCall color="white" />}
          subDescription={t("subDescription")}
        />
        <div className="flex gap-5 w-full overflow-x-auto mb-10 pb-10">
          <div className="w-60 shrink-0">
            <IndicatorsDebtor />
          </div>
          <div className="flex-1 rounded-md shadow-xl min-w-0 p-5 bg-white">
            {engineMode === "obligations" ? (
              <DailyPlanTasks />
            ) : (
              <QuadrantTasks />
            )}
          </div>
        </div>
      </Main>
    </>
  );
};

const DebtorManagementPage = () => {
  return (
    <Suspense fallback={<div></div>}>
      <Content />
    </Suspense>
  );
};

export default DebtorManagementPage;
