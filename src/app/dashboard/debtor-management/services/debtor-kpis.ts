const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface DebtorKpis {
  debtorId: string;
  calculationDate: string | null;
  credibility: {
    score: number | null;
    sufficiency: "CON_NOTA" | "HISTORIA_INSUFICIENTE" | "SIN_HECHOS";
    trafficLight: "VERDE" | "AMARILLO" | "ROJO" | null;
    factsTotal: number;
    factsFulfilled: number;
  } | null;
  rating: {
    ratingDays: number;
    color: "VERDE" | "AMARILLO" | "ROJO";
    cutStatus: "VALIDADO" | "PROVISIONAL_C0";
    nPredictiveInvoices: number;
  } | null;
}

export const getDebtorKpis = async (
  accessToken: string,
  clientId: string,
  debtorId: string,
): Promise<DebtorKpis | null> => {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/reports/kpis/debtors/${debtorId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!response.ok) return null;
  const json = await response.json();
  return (json?.data ?? null) as DebtorKpis | null;
};
