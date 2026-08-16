import { describe, expect, it } from "vitest";
import {
  MOCK_KPIS_EJECUTIVO,
  MOCK_KPIS_JEFE,
  MOCK_KPIS_MANAGER,
} from "../constants/mock-kpis";
import { buildKpiGridItems } from "../utils/kpi-adapter";
import { KPI } from "../../overview/services/types";

describe("kpi-adapter (Dashboard V2)", () => {
  it("should return mock items unchanged when real KPIs and level 2 data are undefined", () => {
    const items = buildKpiGridItems(MOCK_KPIS_MANAGER, undefined, undefined);
    expect(items).toEqual(MOCK_KPIS_MANAGER);
  });

  it("should adapt Level 1 real KPIs into MockKpiDef shape", () => {
    const realKpis: KPI[] = [
      {
        id: "dso-id",
        name: "DSO (Días de Venta Pendientes)",
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
  });

  it("should adapt Level 2 InvoicePhaseDistributionData into % Facturas en Fase 1", () => {
    const items = buildKpiGridItems(MOCK_KPIS_EJECUTIVO, undefined, {
      invoicePhase: {
        targetPhase: 1,
        targetPhaseCount: 25,
        targetPhaseAmount: 10000000,
        totalOverdueCount: 100,
        totalOverdueAmount: 40000000,
        targetPhaseCountPercent: 25,
        targetPhaseAmountPercent: 25,
        distribution: [],
      },
    });

    const phaseItem = items.find((i) => i.name === "% Facturas en Fase 1");
    expect(phaseItem).toBeDefined();
    expect(phaseItem?.value).toBe("25");
    expect(phaseItem?.status).toBe("good");
  });
});
