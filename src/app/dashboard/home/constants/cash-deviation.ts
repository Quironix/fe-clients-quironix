export type HeroPeriod = "dia" | "semana" | "mes";

export const HERO_PERIOD_LABELS: Record<HeroPeriod, string> = {
  dia: "Día",
  semana: "Semana",
  mes: "Mes",
};

export const CASH_DEVIATION_SEGMENT_COLORS: Record<string, string> = {
  litigio: "#9333EA",
  compromiso: "#DC2626",
  fase1: "#F27313",
  pago: "#3B82F6",
  otras: "#94A3B8",
};
