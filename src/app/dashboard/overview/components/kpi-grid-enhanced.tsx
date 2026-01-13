import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPI, KPIType } from "../services/types";
import { KPICardEnhanced } from "./kpi-card-enhanced";

interface KPIGridEnhancedProps {
  kpis: KPI[];
}

export const KPIGridEnhanced = ({ kpis }: KPIGridEnhancedProps) => {
  const groupedKPIs = kpis.reduce(
    (acc, kpi) => {
      if (!acc[kpi.type]) {
        acc[kpi.type] = [];
      }
      acc[kpi.type].push(kpi);
      return acc;
    },
    {} as Record<KPIType, KPI[]>
  );

  const types: { value: KPIType; label: string; emoji: string }[] = [
    { value: "Calidad Producida", label: "Calidad Producida", emoji: "🎯" },
    { value: "Eficiencia", label: "Eficiencia", emoji: "⚡" },
    { value: "Impecabilidad", label: "Impecabilidad", emoji: "✨" },
  ];

  if (kpis.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-xl font-semibold text-gray-700 mb-2">
          No se encontraron KPIs
        </p>
        <p className="text-sm text-gray-500">
          Intenta ajustar los filtros de búsqueda
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 h-auto bg-gray-100 p-1">
        <TabsTrigger
          value="all"
          className="py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          <span className="mr-2">📊</span>
          Todos ({kpis.length})
        </TabsTrigger>
        {types.map((type) => {
          const count = groupedKPIs[type.value]?.length || 0;
          return (
            <TabsTrigger
              key={type.value}
              value={type.value}
              className="py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
              disabled={count === 0}
            >
              <span className="mr-2">{type.emoji}</span>
              {type.label} ({count})
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="all" className="space-y-8 mt-6">
        {types.map((type) => {
          const typeKPIs = groupedKPIs[type.value];
          if (!typeKPIs || typeKPIs.length === 0) return null;

          return (
            <div key={type.value} className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm">
                  <span className="text-xl">{type.emoji}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {type.label}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {typeKPIs.length} indicadores activos
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {typeKPIs.map((kpi) => (
                  <KPICardEnhanced key={kpi.id} kpi={kpi} />
                ))}
              </div>
            </div>
          );
        })}
      </TabsContent>

      {types.map((type) => {
        const typeKPIs = groupedKPIs[type.value];
        if (!typeKPIs || typeKPIs.length === 0) return null;

        return (
          <TabsContent key={type.value} value={type.value} className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-orange-200">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md">
                  <span className="text-2xl">{type.emoji}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {type.label}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {typeKPIs.length} indicadores en esta categoría
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {typeKPIs.map((kpi) => (
                  <KPICardEnhanced key={kpi.id} kpi={kpi} />
                ))}
              </div>
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};
