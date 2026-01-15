import {
  CATEGORY_MAP,
  DESCENDING_METRICS,
  KPI_DEFINITION_MAP,
  KPI_NAME_MAP,
  UNIT_MAP,
} from "../constants/kpi-constants";
import { calculateKPIStatus, getTrendDirection } from "../utils/kpi-utils";
import { KPI, KPIResponse, KPIThresholds, KPIType, ResponseKPIV2 } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const calculateThresholds = (
  sla: number,
  acceptance_criteria: number,
  direction: "ascending" | "descending"
): KPIThresholds => {
  return {
    sla,
    acceptance_criteria,
    direction,
  };
};

const determineDirection = (metricName: string): "ascending" | "descending" => {
  return DESCENDING_METRICS.includes(metricName) ? "descending" : "ascending";
};

const buildKPIObject = (
  item: any,
  categoryKey: keyof typeof CATEGORY_MAP,
  index: number
): KPI => {
  const name = KPI_NAME_MAP[item.name] || item.name;
  const definition = KPI_DEFINITION_MAP[item.name] || "";
  const unit = UNIT_MAP[item.unit] || item.unit;
  const category = CATEGORY_MAP[categoryKey];
  const rawValue = item.value ?? 0;
  const value = Math.round(rawValue * 100) / 100;
  const sla = item.sla ?? 0;
  const acceptance_criteria = item.acceptance_criteria ?? 0;
  const direction = determineDirection(item.name);
  const thresholds = calculateThresholds(sla, acceptance_criteria, direction);
  const statusInfo = calculateKPIStatus(value, thresholds);
  const trend = getTrendDirection(value, acceptance_criteria, direction);

  return {
    id: index.toString(),
    name,
    type: category,
    definition,
    unit: unit as KPI["unit"],
    value,
    target: acceptance_criteria,
    thresholds,
    status: statusInfo.status,
    trend,
    sla: item.sla?.toString() || "",
    criterio: item.acceptance_criteria?.toString() || "",
    lastUpdated: new Date().toISOString(),
    history: item.history || [],
    invoices: item.invoices || [],
  };
};

const transformResponseToKPIs = (response: ResponseKPIV2): KPI[] => {
  const kpis: KPI[] = [];
  let index = 0;

  const processCategory = (
    items: typeof response.produced_quality,
    categoryKey: keyof typeof CATEGORY_MAP
  ) => {
    items.forEach((item) => {
      kpis.push(buildKPIObject(item, categoryKey, ++index));
    });
  };

  processCategory(response.produced_quality, "produced_quality");
  processCategory(response.efficiency, "efficiency");
  processCategory(response.impeccability, "impeccability");

  return kpis;
};

export const getAll = async (
  accessToken: string,
  clientId: string,
  filters?: { from?: string; to?: string }
): Promise<KPIResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/reports/dashboard/kpis`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch KPIs");
    }

    const apiData: ResponseKPIV2 = await response.json();
    let kpis = transformResponseToKPIs(apiData);

    if (filters?.from || filters?.to) {
      kpis = kpis.map((kpi) => ({
        ...kpi,
        history: kpi.history?.filter((h) => {
          const date = new Date(h.date);
          const from = filters.from ? new Date(filters.from) : null;
          const to = filters.to ? new Date(filters.to) : null;

          if (from && to) {
            return date >= from && date <= to;
          } else if (from) {
            return date >= from;
          } else if (to) {
            return date <= to;
          }
          return true;
        }),
      }));
    }

    return {
      data: kpis,
      total: kpis.length,
      lastUpdated: new Date().toISOString(),
      indicators: apiData.indicators,
    };
  } catch (error) {
    console.error("Error fetching KPI data:", error);
    throw error;
  }
};

// export const getById = async (
//   id: string,
//   accessToken: string,
//   clientId: string
// ): Promise<KPI | null> => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       const kpi = DUMMY_KPIS.find((k) => k.id === id);
//       resolve(kpi || null);
//     }, 300);
//   });
// };

export const getAllKPI = async (
  accessToken: string,
  clientId: string
): Promise<ResponseKPIV2> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/reports/dashboard/kpis`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch countries");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching KPI data:", error);
    throw error;
  }
};
