"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { ActivityIcon, BarChart3Icon, GaugeIcon, TrendingUpIcon } from "lucide-react";
import { Suspense, useEffect } from "react";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { KPIAIChat } from "./components/kpi-ai-chat";
import { KPICategorySummary } from "./components/kpi-category-summary";
import { KPIChart } from "./components/kpi-chart";
import { KPIDateFilter } from "./components/kpi-date-filter";
import { KPIFilters } from "./components/kpi-filters";
import { KPIGauge } from "./components/kpi-gauge";
import { KPITrendChart } from "./components/kpi-trend-chart";
import { useKPIStore } from "./store";

const KPIContent = () => {
  const { profile, session } = useProfileContext();
  const {
    filteredKpis,
    kpis,
    loading,
    filters,
    setSearchTerm,
    setTypeFilter,
    setDateRange,
    fetchKPIs,
  } = useKPIStore();

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      fetchKPIs(session?.token, profile.client.id);
    }
  }, [session?.token, profile?.client?.id]);

  const criticalKPIs = filteredKpis.filter((k) => k.status === "error" || k.status === "warning").slice(0, 4);
  const topPerformingKPIs = filteredKpis.filter((k) => k.status === "success").slice(0, 4);

  const kpisByType = {
    "Calidad Producida": filteredKpis.filter(k => k.type === "Calidad Producida"),
    "Eficiencia": filteredKpis.filter(k => k.type === "Eficiencia"),
    "Impecabilidad": filteredKpis.filter(k => k.type === "Impecabilidad"),
  };

  const totalKPIs = kpis.length;
  const successKPIs = kpis.filter((k) => k.status === "success").length;
  const warningKPIs = kpis.filter((k) => k.status === "warning").length;
  const errorKPIs = kpis.filter((k) => k.status === "error").length;
  const successRate = totalKPIs > 0 ? (successKPIs / totalKPIs) * 100 : 0;

  const getCategoryStats = (type: string) => {
    const categoryKPIs = kpis.filter((k) => k.type === type);
    const success = categoryKPIs.filter((k) => k.status === "success").length;
    const warning = categoryKPIs.filter((k) => k.status === "warning").length;
    const error = categoryKPIs.filter((k) => k.status === "error").length;
    return { total: categoryKPIs.length, success, warning, error };
  };

  const calidadStats = getCategoryStats("Calidad Producida");
  const eficienciaStats = getCategoryStats("Eficiencia");
  const impecabilidadStats = getCategoryStats("Impecabilidad");

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Dashboard de Indicadores Clave de Rendimiento"
          description="Análisis y monitoreo en tiempo real de los KPIs operativos"
          icon={<ActivityIcon color="white" />}
          subDescription="Panel KPI"
        />
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
          {loading ? (
            <Card className="p-12 bg-white border-2 border-blue-100">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
                <p className="text-lg font-semibold text-gray-700">
                  Cargando indicadores...
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-9 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <BarChart3Icon className="h-8 w-8 opacity-80" />
                      </div>
                      <div className="text-4xl font-bold mb-1">{totalKPIs}</div>
                      <div className="text-sm opacity-90">Total KPIs</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUpIcon className="h-8 w-8 opacity-80" />
                      </div>
                      <div className="text-4xl font-bold mb-1">{successKPIs}</div>
                      <div className="text-sm opacity-90">En Meta</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-400 to-orange-500 border-0 text-white shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <ActivityIcon className="h-8 w-8 opacity-80" />
                      </div>
                      <div className="text-4xl font-bold mb-1">{warningKPIs}</div>
                      <div className="text-sm opacity-90">Atención</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0 text-white shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <GaugeIcon className="h-8 w-8 opacity-80" />
                      </div>
                      <div className="text-4xl font-bold mb-1">{errorKPIs}</div>
                      <div className="text-sm opacity-90">Críticos</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <KPICategorySummary
                    title="Calidad Producida"
                    stats={calidadStats}
                    color="blue"
                    icon={<ActivityIcon className="h-5 w-5" />}
                  />
                  <KPICategorySummary
                    title="Eficiencia"
                    stats={eficienciaStats}
                    color="purple"
                    icon={<TrendingUpIcon className="h-5 w-5" />}
                  />
                  <KPICategorySummary
                    title="Impecabilidad"
                    stats={impecabilidadStats}
                    color="indigo"
                    icon={<GaugeIcon className="h-5 w-5" />}
                  />
                </div>

                <Card className="border-2 border-blue-100 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
                    <CardTitle className="text-xl font-bold text-gray-900">
                      KPIs Críticos - Requieren Atención
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {criticalKPIs.length} indicadores necesitan seguimiento inmediato
                    </p>
                  </CardHeader>
                  <CardContent className="p-6">
                    {criticalKPIs.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {criticalKPIs.map((kpi) => (
                          <KPIGauge key={kpi.id} kpi={kpi} size="sm" />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-lg font-semibold">¡Excelente trabajo!</p>
                        <p className="text-sm mt-1">Todos los KPIs están en buen estado</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <KPIChart kpis={criticalKPIs.length > 0 ? criticalKPIs : topPerformingKPIs} title="Indicadores Prioritarios" />
                  {filteredKpis.length > 0 && filteredKpis[0].history && (
                    <KPITrendChart kpis={[filteredKpis[0]]} title="Evolución Temporal" />
                  )}
                </div>

                <Card className="border-2 border-blue-100 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-white border-b border-gray-200">
                    <CardTitle className="text-xl font-bold text-gray-900">
                      Análisis por Categoría
                    </CardTitle>
                    <div className="mt-4">
                      <KPIFilters
                        searchTerm={filters.searchTerm || ""}
                        selectedType={filters.type || "all"}
                        onSearchChange={setSearchTerm}
                        onTypeChange={setTypeFilter}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-100 p-1">
                        <TabsTrigger value="all" className="data-[state=active]:bg-white">
                          Todos ({filteredKpis.length})
                        </TabsTrigger>
                        <TabsTrigger value="Calidad Producida" className="data-[state=active]:bg-white">
                          Calidad ({kpisByType["Calidad Producida"].length})
                        </TabsTrigger>
                        <TabsTrigger value="Eficiencia" className="data-[state=active]:bg-white">
                          Eficiencia ({kpisByType["Eficiencia"].length})
                        </TabsTrigger>
                        <TabsTrigger value="Impecabilidad" className="data-[state=active]:bg-white">
                          Impecabilidad ({kpisByType["Impecabilidad"].length})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="all">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredKpis.map((kpi) => (
                            <KPIGauge key={kpi.id} kpi={kpi} size="md" />
                          ))}
                        </div>
                      </TabsContent>

                      {Object.entries(kpisByType).map(([type, kpiList]) => (
                        <TabsContent key={type} value={type}>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {kpiList.map((kpi) => (
                              <KPIGauge key={kpi.id} kpi={kpi} size="md" />
                            ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-12 lg:col-span-3 space-y-6">
                <KPIDateFilter onDateChange={setDateRange} />
                <KPIAIChat />
              </div>
            </div>
          )}
        </div>
      </Main>
    </>
  );
};

const KPIPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-white">
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

export default KPIPage;
