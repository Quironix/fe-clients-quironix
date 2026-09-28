import { describe, expect, it } from "vitest";
import {
  MOCK_KPIS_EJECUTIVO,
  MOCK_KPIS_JEFE,
  MOCK_KPIS_MANAGER,
} from "../constants/mock-kpis";
import { buildKpiGridItems } from "../utils/kpi-adapter";
import { KPI } from "../../overview/services/types";

describe("kpi-adapter (Dashboard V2)", () => {
  it("KPIs with a real source never fall back to mock numbers; only sourceless ones stay illustrative", () => {
    const items = buildKpiGridItems(MOCK_KPIS_MANAGER, undefined, undefined);
    expect(
      items.map((i) => [i.name, i.value, i.badge.tx, !!i._isMock]),
    ).toEqual([
      ["DSO", "—", "Sin datos", false],
      ["% Overdue Crítico", "—", "Sin datos", false],
      ["Generación de Caja", "—", "Sin datos", false],
      ["Credibilidad compuesta", "—", "Sin datos", false],
      ["Calidad de Negociación", "58", "→ +0,8 pp", true],
    ]);
  });

  it("while level 2 data is loading, its KPIs show 'Cargando' instead of mock numbers", () => {
    const items = buildKpiGridItems(MOCK_KPIS_JEFE, undefined, {
      isLoading: true,
    });
    const tasks = items.find((i) => i.name === "% Avance de Tareas");
    expect(tasks).toMatchObject({ value: "—", badge: { tx: "Cargando" } });
    expect(tasks?._isMock).toBeUndefined();
  });

  it("should adapt Level 1 real KPIs into MockKpiDef shape", () => {
    const realKpis: KPI[] = [
      {
        id: "dso-id",
        name: "DSO",
        value: 48.5,
        target: 35,
        unit: "d",
        status: "warning",
        category: "efficiency",
        description: "Días de venta pendientes",
        formula: "DSO",
        thresholds: { good: 35, warning: 45, direction: "down" },
        history: [{ period: "2026-07", value: 52 }],
        drillDown: { byCustomer: [], byProduct: [], byRegion: [] },
      },
    ];

    const items = buildKpiGridItems(MOCK_KPIS_MANAGER, realKpis);
    const dsoItem = items.find((i) => i.name === "DSO");

    expect(dsoItem).toBeDefined();
    expect(dsoItem?.value).toContain("48,5");
    expect(dsoItem?.status).toBe("warn");
  });

  it("should adapt Level 2 TaskProgressData into % Avance de Tareas KPI", () => {
    const items = buildKpiGridItems(MOCK_KPIS_JEFE, undefined, {
      taskProgress: {
        completed: 20,
        pending: 5,
        total: 25,
        progress_percent: 80,
      },
    });

    const taskItem = items.find((i) => i.name === "% Avance de Tareas");
    expect(taskItem).toBeDefined();
    expect(taskItem?.value).toBe("80");
    expect(taskItem?.pct).toBe(80);
    expect(taskItem?.status).toBe("good");
    expect(taskItem?.badge.tx).toBe("Meta cumplida");
  });

  it("should adapt Level 2 CommitmentsSummaryData into % Compromisos Cumplidos", () => {
    const items = buildKpiGridItems(MOCK_KPIS_JEFE, undefined, {
      commitmentsSummary: {
        totalCommitments: 10,
        brokenCount: 2,
        keptCount: 8,
        futureCount: 0,
        noInvoicesCount: 0,
        brokenPercentage: 20,
        fulfilledPercentage: 80,
      },
    });

    const commItem = items.find((i) => i.name === "% Compromisos Cumplidos");
    expect(commItem).toBeDefined();
    expect(commItem?.value).toBe("80");
    expect(commItem?.status).toBe("good");
  });

  it("should adapt Level 2 ContactEffectivenessData for Executive view", () => {
    const items = buildKpiGridItems(MOCK_KPIS_EJECUTIVO, undefined, {
      contactEffectiveness: {
        totalContacts: 100,
        effectiveContacts: 60,
        unreachableContacts: 40,
        effectivenessPercent: 60,
        todayTotal: 25,
        todayEffective: 18,
        todayEffectivenessPercent: 72,
      },
    });

    const callsItem = items.find((i) => i.name === "Llamadas Efectivas");
    expect(callsItem).toBeDefined();
    expect(callsItem?.value).toBe("18");
    expect(callsItem?.status).toBe("good");
    expect(callsItem?.done).toBe(18);
    expect(callsItem?.total).toBe(25);
  });

  it("does not fall back to the mock trend line when a real trend KPI has under 2 history points", () => {
    const realKpis: KPI[] = [
      {
        id: "credibility-id",
        name: "Credibilidad compuesta",
        value: 0,
        target: 60,
        unit: "%",
        status: "error",
        category: "produced-quality",
        description: "Credibilidad compuesta",
        formula: "CREDIBILITY_INDEX",
        thresholds: { good: 60, warning: 40, direction: "up" },
        history: [],
        drillDown: { byCustomer: [], byProduct: [], byRegion: [] },
      },
    ];

    const items = buildKpiGridItems(MOCK_KPIS_MANAGER, realKpis);
    const credibilityItem = items.find(
      (i) => i.name === "Credibilidad compuesta",
    );

    expect(credibilityItem).toBeDefined();
    expect(credibilityItem?.value).toBe("0");
    // Antes de este fix, con menos de 2 puntos de historial se usaba la tendencia mock
    // ([55, 58, 61, 60, 66, 69, 71]), mostrando una línea ficticia por sobre la meta
    // aunque el valor real fuera 0%.
    expect(credibilityItem?.trend).toEqual([0, 0]);
  });

  it("should adapt Level 2 InvoicePhaseDistributionData into % Facturas en Fase 1", () => {
    const items = buildKpiGridItems(MOCK_KPIS_EJECUTIVO, undefined, {
      invoicePhase: {
        targetPhase: 1,
        targetPhaseCount: 25,
        targetPhaseAmount: 10000000,
        totalOverdueCount: 100,
        totalOverdueAmount: 40000000,
        targetPhaseCountPercent: 72,
        targetPhaseAmountPercent: 72,
        distribution: [],
      },
    });

    const phaseItem = items.find((i) => i.name === "% Facturas en Fase 1");
    expect(phaseItem).toBeDefined();
    expect(phaseItem?.value).toBe("72");
    expect(phaseItem?.status).toBe("good");
    expect(phaseItem?.num).toBe(72);
    expect(phaseItem?.target).toBe(60);
  });
  it("a KPI without a value (API null) shows 'Sin datos', never 0% or Crítico", () => {
    const realKpis: KPI[] = [
      {
        id: "credibility-id",
        name: "Credibilidad compuesta",
        value: 0,
        hasValue: false,
        target: 60,
        unit: "%",
        status: "error",
        category: "produced-quality",
        description: "Credibilidad compuesta",
        formula: "CREDIBILITY_INDEX",
        thresholds: { good: 60, warning: 40, direction: "up" },
        history: [],
        drillDown: { byCustomer: [], byProduct: [], byRegion: [] },
      } as unknown as KPI,
    ];

    const item = buildKpiGridItems(MOCK_KPIS_MANAGER, realKpis).find(
      (i) => i.name === "Credibilidad compuesta",
    );

    expect(item).toMatchObject({
      value: "—",
      status: "none",
      badge: { tx: "Sin datos", tone: "none" },
      trend: [],
    });
    expect(item?._isMock).toBeUndefined();
  });
});
