import { KPI, KPIType } from "../services/types";
import { KPICard } from "./kpi-card";

interface KPIGridProps {
  kpis: KPI[];
}

export const KPIGrid = ({ kpis }: KPIGridProps) => {
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

  const types: KPIType[] = ["Calidad Producida", "Eficiencia", "Impecabilidad"];

  if (kpis.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No se encontraron KPIs</p>
        <p className="text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {types.map((type) => {
        const typeKPIs = groupedKPIs[type];
        if (!typeKPIs || typeKPIs.length === 0) return null;

        return (
          <div key={type}>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">{type}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {typeKPIs.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
