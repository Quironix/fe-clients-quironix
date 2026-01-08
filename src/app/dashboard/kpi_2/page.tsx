"use client";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import {
  Columns2,
  Columns3,
  Columns4,
  Gauge,
  LayoutGrid,
  LineChart,
  List,
  Maximize,
  PieChart,
  RotateCcw,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { KPIAIChat } from "./components/kpi-ai-chat";
import { KPISummaryHeader } from "./components/kpi-summary-header";
import { KPIWidget, ViewType } from "./components/kpi-widget-v4";
import { useKPIData } from "./hooks/useKPIData";
import { useKPIStore } from "./store";

const viewTypes: Array<{
  id: ViewType;
  name: string;
  icon: React.ElementType;
}> = [
  { id: "card", name: "Card", icon: LayoutGrid },
  { id: "gauge", name: "Gauge", icon: Gauge },
  { id: "sparkline", name: "Sparkline", icon: LineChart },
  { id: "ring", name: "Ring", icon: PieChart },
  { id: "compact", name: "Compacto", icon: List },
  { id: "detailed", name: "Detallado", icon: Maximize },
];

const categories = ["all", "Calidad producida", "Eficiencia", "Impecabilidad"];

const KPIContent = () => {
  const { profile, session } = useProfileContext();
  const {
    filteredKpis,
    kpis,
    preferences,
    setKPIs,
    setKPIView,
    setAllViews,
    setGridColumns,
    setFilterCategory,
    setKPIOrder,
    resetLayout,
  } = useKPIStore();

  const [draggedId, setDraggedId] = useState<string | null>(null);

  const {
    data: kpiData,
    isLoading,
    error,
    isFetching,
    dataUpdatedAt,
  } = useKPIData({
    accessToken: session?.token || "",
    clientId: profile?.client?.id || "",
    enabled: !!session?.token && !!profile?.client?.id,
  });

  useEffect(() => {
    if (kpiData?.data) {
      setKPIs(kpiData.data);
    }
  }, [kpiData, setKPIs]);

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
          title="Dashboard"
          description="Revisa tus indicadores clave de rendimiento"
          icon={<LayoutGrid color="white" />}
          subDescription="KPIs"
        />
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 p-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
              <p className="text-lg font-semibold text-gray-700">
                Cargando indicadores...
              </p>
              <p className="text-sm text-gray-500">
                Los datos se almacenarán en caché por 5 minutos
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-4 p-12">
              <div className="text-red-500 text-4xl">⚠️</div>
              <p className="text-lg font-semibold text-gray-700">
                Error al cargar los indicadores
              </p>
              <p className="text-sm text-gray-500">{error.message}</p>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-9 space-y-6">
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                      {viewTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setAllViews(type.id)}
                            className={`p-2 rounded-md transition-colors ${
                              preferences.viewMode === type.id
                                ? "bg-orange-500 text-white"
                                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                            }`}
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
                          className={`px-3 py-1.5 text-xs font-medium  rounded-md transition-colors ${
                            preferences.gridColumns === n
                              ? "bg-orange-500 text-white"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {n === 2 && <Columns2 size={19} />}
                          {n === 3 && <Columns3 size={19} />}
                          {n === 4 && <Columns4 size={19} />}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={resetLayout}
                      className="flex items-center gap-2 px-3 py-3 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <RotateCcw size={14} />
                      Limpiar
                    </button>
                  </div>
                </header>

                <KPISummaryHeader kpis={kpis} />

                {dataUpdatedAt && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isFetching
                            ? "bg-orange-500 animate-pulse"
                            : "bg-emerald-500"
                        }`}
                      />
                      <span>
                        {isFetching
                          ? "Actualizando datos..."
                          : `Última actualización: ${new Date(
                              dataUpdatedAt
                            ).toLocaleTimeString("es-CL")}`}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-medium">
                      Caché: 5 min
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                        preferences.filterCategory === cat
                          ? "bg-orange-500 text-white"
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
                  {filteredKpis.map((kpi) => {
                    const validViewTypes: ViewType[] = [
                      "card",
                      "gauge",
                      "sparkline",
                      "ring",
                      "compact",
                      "detailed",
                    ];
                    const storedView =
                      preferences.kpiViews[kpi.id] || preferences.viewMode;
                    const viewType = validViewTypes.includes(
                      storedView as ViewType
                    )
                      ? (storedView as ViewType)
                      : "card";

                    return (
                      <KPIWidget
                        key={kpi.id}
                        kpi={kpi}
                        viewType={viewType}
                        onViewChange={(viewType) =>
                          setKPIView(kpi.id, viewType)
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

              <div className="col-span-12 lg:col-span-3 mt-18">
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
