import { QuironscoreData } from "../types";

export interface QuironscoreComponentView {
  label: string;
  weight: number;
  value: number | null;
  detail: string;
}

export interface QuironscoreView {
  score: number | null;
  headline: string;
  components: QuironscoreComponentView[];
}

const pct = (ratio: number | null) =>
  ratio === null ? "—" : `${Math.round(ratio * 100)}%`;

const round1 = (value: number | null) =>
  value === null ? null : Math.round(value * 10) / 10;

export function buildQuironscoreView(
  data: QuironscoreData | null,
): QuironscoreView {
  if (!data) {
    return {
      score: null,
      headline: "Sin cálculo todavía",
      components: [],
    };
  }

  const { cash, rating, go, credibility } = data;
  return {
    score: round1(data.quironscore),
    headline:
      data.quironscore === null ? "Información insuficiente" : "En calibración",
    components: [
      {
        label: "Caja",
        weight: 45,
        value: round1(cash.score),
        detail:
          cash.raw === null
            ? "sin estimado exigible"
            : `${Math.round(cash.raw)}% de lo exigible · ${Math.round(
                cash.pctMonthDue ?? 0,
              )}% del mes exigible`,
      },
      {
        label: "Rating de atraso",
        weight: 25,
        value: round1(rating.score),
        detail: [
          `cobertura ${pct(rating.coverageBalance)} del saldo`,
          rating.cutStatus === "PROVISIONAL_C0" ? "cortes provisionales" : null,
        ]
          .filter(Boolean)
          .join(" · "),
      },
      {
        label: "Gestión operativa",
        weight: 15,
        value: round1(go.score),
        detail:
          go.planned === 0
            ? "esperando el primer plan del Sistema de Tareas"
            : `${go.compliant} de ${go.planned} a tiempo`,
      },
      {
        label: "Credibilidad",
        weight: 15,
        value: round1(credibility.score),
        detail: `cobertura ${pct(credibility.coverage)} (${credibility.n} de ${credibility.universeN} deudores)`,
      },
    ],
  };
}
