import { KPI, KPIResponse, KPIStatus } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getKPIStatus = (
  value: number,
  thresholds: { low: number; high: number; direction: string }
): KPIStatus => {
  if (thresholds.direction === "ascending") {
    if (value >= thresholds.high) return "success";
    if (value >= thresholds.low) return "warning";
    return "error";
  } else {
    if (value <= thresholds.low) return "success";
    if (value <= thresholds.high) return "warning";
    return "error";
  }
};

const generateHistory = (currentValue: number, months: number = 6) => {
  const history = [];
  const today = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    const variation = (Math.random() - 0.5) * 20;
    const value = Math.max(0, currentValue + variation);
    history.push({
      date: date.toISOString().split("T")[0],
      value: Math.round(value * 10) / 10,
    });
  }

  return history;
};

const DUMMY_KPIS: KPI[] = [
  {
    id: "1",
    name: "Generación de Caja",
    type: "Calidad Producida",
    definition:
      "El Recaudado Real es la sumatoria de los pagos recibidos y debe excluir cheques a fecha, Ajustes y aplicaciones. Este debe mostrarse diariamente e ir con el acumulado mensual. Debe tener Cierre mensual.",
    unit: "%",
    value: 97,
    target: 100,
    thresholds: { low: 95, high: 100, direction: "ascending" },
    status: "success",
    trend: "up",
    sla: "30",
    criterio: "100",
    lastUpdated: new Date().toISOString(),
    history: generateHistory(97),
  },
  {
    id: "2",
    name: "% CEI",
    type: "Calidad Producida",
    definition:
      "Este Indicador representa el % que estoy logrando Cobrar de todo lo que se podía cobrar (deuda vencida). Lo importante es ir monitoreando su tendencia mes a mes para que se acerque al 100% que es el ideal.",
    unit: "%",
    value: 76,
    target: 80,
    thresholds: { low: 75, high: 80, direction: "ascending" },
    status: "warning",
    trend: "stable",
    sla: "75",
    criterio: "75",
    lastUpdated: new Date().toISOString(),
    history: generateHistory(76),
  },
  {
    id: "3",
    name: "Índice Credibilidad",
    type: "Calidad Producida",
    definition:
      "Este indicador mide la confiabilidad y autonomía de pago de cada deudor, reflejando el costo de gobernabilidad de la cartera. No se limita a medir el atraso de pagos (DBT), sino el esfuerzo operativo necesario para que el cliente cumpla lo que aceptó.",
    unit: "%",
    value: 59,
    target: 60,
    thresholds: { low: 58, high: 60, direction: "ascending" },
    status: "warning",
    trend: "up",
    sla: "30",
    criterio: "60",
    lastUpdated: new Date().toISOString(),
    history: generateHistory(59),
  },
  {
    id: "4",
    name: "Conciliación Bancaria Quironix",
    type: "Calidad Producida",
    definition:
      "Este indicador busca medir el % de pagos de cartola que fueron aplicados de forma automática por Quironix",
    unit: "%",
    value: 75,
    target: 90,
    thresholds: { low: 65, high: 90, direction: "ascending" },
    status: "warning",
    trend: "up",
    sla: "20",
    criterio: "20",
    lastUpdated: new Date().toISOString(),
    history: generateHistory(75),
  },
  {
    id: "5",
    name: "Compensación Tiempo de Servicio - Quironix",
    type: "Calidad Producida",
    definition:
      "Busca medir el % de pagos que fueron aplicados de forma automática en las primeras 24 horas desde el momento en que el pago ingresa en cartola o es registrado en la plataforma.",
    unit: "%",
    value: 94,
    target: 95,
    thresholds: { low: 93, high: 95, direction: "ascending" },
    status: "warning",
    trend: "stable",
    sla: "95",
    criterio: "95",
    lastUpdated: new Date().toISOString(),
    history: generateHistory(94),
  },
  {
    id: "6",
    name: "% Normalización Litigios",
    type: "Eficiencia",
    definition: "Mide el % de litigios que han sido normalizados.",
    unit: "%",
    value: 68,
    target: 70,
    thresholds: { low: 67, high: 70, direction: "ascending" },
    status: "warning",
    trend: "up",
    sla: "30",
    criterio: "70",
    lastUpdated: new Date().toISOString(),
    history: generateHistory(68),
  },
  {
    id: "7",
    name: "DDO",
    type: "Eficiencia",
    definition:
      "Métrica que se utiliza en algunas empresas, particularmente en sectores como seguros, retail o servicios financieros, para medir el tiempo promedio que toma resolver y aplicar deducciones en pagos o facturas pendientes.",
    unit: "días",
    value: 15,
    target: 10,
    thresholds: { low: 0, high: 0, direction: "descending" },
    status: "warning",
    trend: "stable",
    sla: "",
    criterio: "",
    lastUpdated: new Date().toISOString(),
    history: generateHistory(15),
  },
  {
    id: "8",
    name: "% Match Rate",
    type: "Eficiencia",
    definition: "Mide cuanto % de facturación tiene NC",
    unit: "%",
    value: 87,
    target: 90,
    thresholds: { low: 85, high: 90, direction: "ascending" },
    status: "warning",
    trend: "up",
    sla: "85",
    criterio: "85",
    lastUpdated: new Date().toISOString(),
    history: generateHistory(87),
  },
  {
    id: "9",
    name: "Litigios Abiertos",
    type: "Eficiencia",
    definition:
      "%de litigios abiertos > 30 días en gestión. Sobre el total de litigios abiertos.",
    unit: "%",
    value: 25,
    target: 20,
    thresholds: { low: 20, high: 30, direction: "descending" },
    status: "warning",
    trend: "down",
    sla: "30",
    criterio: "20",
    lastUpdated: new Date().toISOString(),
    history: generateHistory(25),
  },
  {
    id: "10",
    name: "Pagos en Tránsito",
    type: "Eficiencia",
    definition:
      "Monto de pagos Aplicados v/s pagos Cargados usar todos los tipos de pago, no considerar ajustes y aplicaciones.",
    unit: "%",
    value: 99,
    target: 100,
    thresholds: { low: 98, high: 100, direction: "ascending" },
    status: "warning",
    trend: "up",
    sla: "30",
    criterio: "100",
    lastUpdated: new Date().toISOString(),
    history: generateHistory(99),
  },
  {
    id: "11",
    name: "Compensación Tiempo de Servicio",
    type: "Eficiencia",
    definition:
      "Busca medir el % de pagos que fueron aplicados de forma manual en las primeras 24 horas desde el momento en que el pago ingresa en cartola o es registrado en la plataforma.",
    unit: "%",
    value: 94,
    target: 95,
    thresholds: { low: 93, high: 95, direction: "ascending" },
    status: "warning",
    trend: "stable",
    sla: "95",
    criterio: "95",
    lastUpdated: new Date().toISOString(),
    history: generateHistory(94),
  },
  {
    id: "12",
    name: "Efectividad de Negociación",
    type: "Eficiencia",
    definition:
      "Mide en %, cuantas veces que interviene un ejecutivo obtiene el compromiso de pago",
    unit: "%",
    value: 60,
    target: 70,
    thresholds: { low: 50, high: 70, direction: "ascending" },
    status: "warning",
    trend: "up",
    sla: "30",
    criterio: "70",
    lastUpdated: new Date().toISOString(),
    history: generateHistory(60),
  },
  {
    id: "13",
    name: "DBT",
    type: "Impecabilidad",
    definition: "Días después del Vencimiento que se realizó Pago",
    unit: "días",
    value: 7,
    target: 5,
    thresholds: { low: 5, high: 10, direction: "descending" },
    status: "warning",
    trend: "stable",
    sla: "5",
    criterio: "5",
    lastUpdated: new Date().toISOString(),
    history: generateHistory(7),
  },
  {
    id: "14",
    name: "% Over Due",
    type: "Impecabilidad",
    definition: "Días de Deudas Vencida",
    unit: "%",
    value: 52,
    target: 50,
    thresholds: { low: 50, high: 55, direction: "descending" },
    status: "warning",
    trend: "down",
    sla: "50",
    criterio: "50",
    lastUpdated: new Date().toISOString(),
    history: generateHistory(52),
  },
  {
    id: "15",
    name: "% Over Due Crítico",
    type: "Impecabilidad",
    definition: "Días de Deudas Vencida con más de 30 días",
    unit: "%",
    value: 3,
    target: 2,
    thresholds: { low: 2, high: 5, direction: "descending" },
    status: "warning",
    trend: "down",
    sla: "2",
    criterio: "2",
    lastUpdated: new Date().toISOString(),
    history: generateHistory(3),
  },
  {
    id: "16",
    name: "DSO",
    type: "Impecabilidad",
    definition: "Días Calle",
    unit: "nº",
    value: 70,
    target: 60,
    thresholds: { low: 60, high: 85, direction: "descending" },
    status: "warning",
    trend: "stable",
    sla: "60",
    criterio: "60",
    lastUpdated: new Date().toISOString(),
    history: generateHistory(70),
  },
  {
    id: "17",
    name: "Provisión",
    type: "Impecabilidad",
    definition: "Provisión de cobranza dudosa",
    unit: "%",
    value: 85,
    target: 80,
    thresholds: { low: 80, high: 90, direction: "descending" },
    status: "success",
    trend: "stable",
    sla: "30",
    criterio: "80",
    lastUpdated: new Date().toISOString(),
    history: generateHistory(85),
  },
];

DUMMY_KPIS.forEach((kpi) => {
  kpi.status = getKPIStatus(kpi.value, kpi.thresholds);
});

export const getAll = async (
  accessToken: string,
  clientId: string,
  filters?: { from?: string; to?: string }
): Promise<KPIResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredKPIs = [...DUMMY_KPIS];

      if (filters?.from || filters?.to) {
        filteredKPIs = filteredKPIs.map((kpi) => ({
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

      resolve({
        data: filteredKPIs,
        total: filteredKPIs.length,
        lastUpdated: new Date().toISOString(),
      });
    }, 500);
  });
};

export const getById = async (
  id: string,
  accessToken: string,
  clientId: string
): Promise<KPI | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const kpi = DUMMY_KPIS.find((k) => k.id === id);
      resolve(kpi || null);
    }, 300);
  });
};
