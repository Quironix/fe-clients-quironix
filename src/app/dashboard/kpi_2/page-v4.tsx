"use client";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import {
  BarChart3,
  Gauge,
  LayoutGrid,
  LineChart,
  RotateCcw,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { KPIAIChat } from "./components/kpi-ai-chat";
import { KPISummaryHeader } from "./components/kpi-summary-header";
import { KPIWidget, ViewType } from "./components/kpi-widget-v4";
import { useKPIStoreV4 } from "./store/kpi-store-v4";

const viewTypes: Array<{
  id: ViewType;
  name: string;
  icon: React.ElementType;
}> = [
  { id: "card", name: "Card", icon: LayoutGrid },
  { id: "gauge", name: "Gauge", icon: Gauge },
  { id: "bullet", name: "Bullet", icon: BarChart3 },
  { id: "sparkline", name: "Sparkline", icon: LineChart },
];

const categories = ["all", "Calidad Producida", "Eficiencia", "Impecabilidad"];

const KPIContent = () => {
  const { profile, session } = useProfileContext();
  const {
    filteredKpis,
    kpis,
    loading,
    preferences,
    fetchKPIs,
    setKPIView,
    setAllViews,
    setGridColumns,
    setFilterCategory,
    setKPIOrder,
    resetLayout,
  } = useKPIStoreV4();

  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      fetchKPIs(session?.token, profile.client.id);
    }
  }, [session?.token, profile?.client?.id, fetchKPIs]);

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
      <Main>
        <TitleSection
          title="Panel de KPIs v4"
          description="Arrastra las tarjetas para reorganizar"
          icon={<LayoutGrid color="white" />}
          subDescription="Dashboard Personalizable"
        />
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 p-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
              <p className="text-lg font-semibold text-gray-700">
                Cargando indicadores...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-9 space-y-6">
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex bg-white border border-gray-200 rounded-lg p-1">
                      {viewTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setAllViews(type.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                            title={`Todos a ${type.name}`}
                          >
                            <Icon size={16} />
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                      {[2, 3, 4].map((n) => (
                        <button
                          key={n}
                          onClick={() => setGridColumns(n)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            preferences.gridColumns === n
                              ? "bg-gray-900 text-white"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {n} col
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={resetLayout}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <RotateCcw size={14} />
                      Reset
                    </button>
                  </div>
                </header>

                <KPISummaryHeader kpis={kpis} />

                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                        preferences.filterCategory === cat
                          ? "bg-gray-900 text-white"
                          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {cat === "all" ? "Todos" : cat}
                    </button>
                  ))}
                </div>

                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: `repeat(${preferences.gridColumns}, minmax(0, 1fr))`,
                  }}
                >
                  {filteredKpis.map((kpi) => (
                    <KPIWidget
                      key={kpi.id}
                      kpi={kpi}
                      viewType={
                        preferences.kpiViews[kpi.id] || preferences.viewMode
                      }
                      onViewChange={(viewType) => setKPIView(kpi.id, viewType)}
                      onDragStart={(e) => handleDragStart(e, kpi.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, kpi.id)}
                      isDragging={draggedId === kpi.id}
                    />
                  ))}
                </div>

                <footer className="mt-12 pt-6 border-t border-gray-200 text-center">
                  <p className="text-xs text-gray-400">
                    Dashboard KPI v4.0 · Personalizable · Drag & Drop
                  </p>
                </footer>
              </div>

              <div className="col-span-12 lg:col-span-3">
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
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
            <p className="text-lg font-semibold text-gray-700">
              Cargando Dashboard KPI...
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
