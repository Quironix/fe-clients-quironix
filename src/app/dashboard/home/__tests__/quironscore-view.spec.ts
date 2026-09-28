import { describe, expect, it } from "vitest";
import { QuironscoreData } from "../types";
import { buildQuironscoreView } from "../utils/quironscore-view";

const DATA: QuironscoreData = {
  calculationDate: "2026-09-26",
  quironscore: null,
  status: "INSUFFICIENT_INFORMATION",
  naCauses: ["GO: sin plan operativo entregado a ejecutores"],
  classificationStatus: "EN_CALIBRACION",
  cash: { score: 77.64, raw: 77.64, pctMonthDue: 62.3 },
  rating: {
    score: 44.71,
    simpleAverage: 63.9,
    coverageBalance: 0.94,
    cutStatus: "PROVISIONAL_C0",
  },
  go: { score: null, planned: 0, compliant: 0 },
  credibility: { score: 71, coverage: 0.94, n: 47, universeN: 50 },
};

describe("buildQuironscoreView (PRD KPIs Parte C)", () => {
  it("sin GO no hay Quironscore, pero los componentes presentes se ven", () => {
    const view = buildQuironscoreView(DATA);
    expect(view.score).toBeNull();
    expect(view.headline).toBe("Información insuficiente");
    expect(view.components.map((c) => [c.label, c.value])).toEqual([
      ["Caja", 77.6],
      ["Rating de atraso", 44.7],
      ["Gestión operativa", null],
      ["Credibilidad", 71],
    ]);
    expect(view.components[2].detail).toBe(
      "esperando el primer plan del Sistema de Tareas",
    );
  });

  it("marca los cortes provisionales y la cobertura (GTQ-09, GTQ-10)", () => {
    const view = buildQuironscoreView(DATA);
    expect(view.components[1].detail).toBe(
      "cobertura 94% del saldo · cortes provisionales",
    );
    expect(view.components[3].detail).toBe("cobertura 94% (47 de 50 deudores)");
  });

  it("con los 4 componentes muestra el número, nunca 'saludable' (GTQ-11)", () => {
    const view = buildQuironscoreView({
      ...DATA,
      quironscore: 88.04,
      status: "OK",
      go: { score: 90, planned: 10, compliant: 9 },
    });
    expect(view.score).toBe(88);
    expect(view.headline).toBe("En calibración");
  });

  it("sin cálculo no inventa nada", () => {
    expect(buildQuironscoreView(null)).toEqual({
      score: null,
      headline: "Sin cálculo todavía",
      components: [],
    });
  });
});
