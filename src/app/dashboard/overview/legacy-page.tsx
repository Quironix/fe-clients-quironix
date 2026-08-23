"use client";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { cn } from "@/lib/utils";
import { LayoutGrid, MessageCircle, RotateCcw, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { KPIAIChat } from "./components/kpi-ai-chat";
import { KPIPeriodFilter } from "./components/kpi-period-filter";
import { KPISummaryHeader } from "./components/kpi-summary-header";
import { KPIWidget } from "./components/kpi-widget-v4";
import {
  CATEGORIES,
  GRID_COLUMN_OPTIONS,
  VIEW_TYPES,
  ViewType,
} from "./constants/kpi-constants";
import { useKPIData } from "./hooks/useKPIData";
import { useKPIStore } from "./store";

const KPIContent = () => {
  const t = useTranslations("overview");
  const { profile, session } = useProfileContext();
  const {
    filteredKpis,
    kpis,
    preferences,
    indicators,
    setKPIs,
    setKPIView,
    setAllViews,
    setGridColumns,
    setFilterCategory,
    setKPIOrder,
    resetLayout,
    setIndicators,
    setPeriod,
  } = useKPIStore();

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [chatWidth, setChatWidth] = useState(480);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isResizingChat = useRef(false);

  const handleChatResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingChat.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingChat.current) return;
      const newWidth = window.innerWidth - e.clientX;
      setChatWidth(Math.min(480, Math.max(340, newWidth)));
    };
    const handleMouseUp = () => {
      if (!isResizingChat.current) return;
      isResizingChat.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const {
    data: kpiData,
    isLoading,
    error,
    isFetching,
    dataUpdatedAt,
  } = useKPIData({
    accessToken: session?.token || "",
    clientId: profile?.client?.id || "",
    period: preferences.period,
    enabled: !!session?.token && !!profile?.client?.id,
  });

  useEffect(() => {
    if (kpiData?.data) {
      setKPIs(kpiData.data);
    }
    if (kpiData?.indicators) {
      setIndicators(kpiData.indicators);
    }
  }, [kpiData, setKPIs, setIndicators]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const newKpis = [...filteredKpis];
    const draggedIndex = newKpis.findIndex((k) => k.id === draggedId);
    const targetIndex = newKpis.findIndex((k) => k.id === targetId);
    const [removed] = newKpis.splice(draggedIndex, 1);
    newKpis.splice(targetIndex, 0, removed);

    setKPIOrder(newKpis.map((k) => k.id));
    setDraggedId(null);
  };

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main className="peer-[.header-fixed]/header:mt-20 pr-2 p-10 py-4">
        <TitleSection
          title={t("title")}
          description={t("description")}
          icon={<LayoutGrid color="white" />}
          subDescription={t("subDescription")}
        />
        <div className="-mx-4 flex-1 px-4 py-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 p-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
              <p className="text-lg font-semibold text-gray-700">
                {t("loading")}
              </p>
              <p className="text-sm text-gray-500">{t("loadingCache")}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-4 p-12">
              <div className="text-red-500 text-4xl">⚠️</div>
              <p className="text-lg font-semibold text-gray-700">
                {t("errorLoading")}
              </p>
              <p className="text-sm text-gray-500">{error.message}</p>
            </div>
          ) : (
            <div className="flex flex-col min-[1440px]:flex-row gap-6 items-start relative">
              <div className="w-full min-w-0 space-y-6">
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                      {VIEW_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setAllViews(type.id as any)}
                            className={`p-2 rounded-md transition-colors ${
                              preferences.viewMode === type.id
                                ? "bg-orange-500 text-white"
                                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                            }`}
                            title={t("viewAllAs", { type: type.name })}
                          >
                            <Icon size={16} />
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                      {GRID_COLUMN_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => setGridColumns(option.value)}
                            className={`px-3 py-1.5 text-xs font-medium  rounded-md transition-colors ${
                              preferences.gridColumns === option.value
                                ? "bg-orange-500 text-white"
                                : "text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            <Icon size={19} />
                          </button>
                        );
                      })}
                    </div>

                    <KPIPeriodFilter
                      value={preferences.period}
                      onChange={setPeriod}
                    />

                    <button
                      onClick={resetLayout}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <RotateCcw size={14} />
                      {t("clear")}
                    </button>
                  </div>
                </header>

                <KPISummaryHeader indicators={kpiData?.indicators} />

                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                        preferences.filterCategory === cat
                          ? "bg-orange-500 text-white"
                          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {cat === "all" ? t("allCategories") : cat}
                    </button>
                  ))}
                </div>

                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: `repeat(${preferences.gridColumns}, minmax(0, 1fr))`,
                  }}
                >
                  {filteredKpis.map((kpi) => {
                    const validViewTypes: ViewType[] = VIEW_TYPES.map(
                      (vt) => vt.id,
                    );
                    const storedView =
                      preferences.kpiViews[kpi.id] || preferences.viewMode;
                    const viewType = validViewTypes.includes(
                      storedView as ViewType,
                    )
                      ? (storedView as ViewType)
                      : "card";

                    return (
                      <KPIWidget
                        key={kpi.id}
                        kpi={kpi}
                        viewType={viewType}
                        onViewChange={(viewType) =>
                          setKPIView(kpi.id, viewType as any)
                        }
                        onDragStart={(e) => handleDragStart(e, kpi.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, kpi.id)}
                        isDragging={draggedId === kpi.id}
                      />
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setIsChatOpen((open) => !open)}
                className="min-[1440px]:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-orange-500 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-orange-600 transition-colors"
              >
                <MessageCircle size={18} />
                {t("kpiAssistant")}
              </button>

              {isChatOpen && (
                <div
                  onClick={() => setIsChatOpen(false)}
                  className="min-[1440px]:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                />
              )}

              <div
                className={cn(
                  "min-[1440px]:translate-x-0 min-[1440px]:w-(--chat-w) min-[1440px]:flex-none min-[1440px]:min-w-85 min-[1440px]:max-w-120 min-[1440px]:sticky min-[1440px]:top-20 min-[1440px]:h-[calc(100vh-6rem)] min-[1440px]:shadow-none min-[1440px]:backdrop-blur-none min-[1440px]:bg-transparent",
                  "fixed inset-y-0 right-0 z-50 w-full max-w-95 h-dvh bg-white/95 backdrop-blur-md shadow-2xl transition-transform duration-300",
                  isChatOpen ? "translate-x-0" : "translate-x-full",
                )}
                style={{ "--chat-w": `${chatWidth}px` } as React.CSSProperties}
              >
                <div
                  onMouseDown={handleChatResizeStart}
                  className="hidden min-[1440px]:flex absolute -left-3 top-0 h-full w-3 cursor-col-resize items-center justify-center group z-10"
                >
                  <div className="h-10 w-1 rounded-full bg-gray-300 group-hover:bg-orange-500 transition-colors" />
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="min-[1440px]:hidden absolute top-3 right-3 z-10 rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
                >
                  <X size={16} />
                </button>
                <KPIAIChat />
              </div>
            </div>
          )}
        </div>
      </Main>
    </>
  );
};

const KPIPageV4 = () => {
  const t = useTranslations("overview");
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
            <p className="text-lg font-semibold text-gray-700">
              {t("loadingDashboard")}
            </p>
          </div>
        </div>
      }
    >
      <KPIContent />
    </Suspense>
  );
};

export default KPIPageV4;
