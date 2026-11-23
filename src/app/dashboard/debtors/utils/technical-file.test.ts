import { describe, expect, it } from "vitest";
import {
  describeCalendar,
  dismissProposal,
  functionOfRole,
  functionsWithoutDefault,
  hasCollectorCoverage,
  isProposalDismissed,
} from "./technical-file";

const contact = (overrides = {}) => ({
  name: "Ana",
  role: "Tesorero",
  channel: "email",
  ...overrides,
});

describe("hasCollectorCoverage (FTQ-08)", () => {
  it("sin contactos suscritos no hay cobertura", () => {
    expect(hasCollectorCoverage([contact()])).toBe(false);
    expect(hasCollectorCoverage([])).toBe(false);
  });

  it("un contacto activo con collector_ids o flags legacy cubre", () => {
    expect(hasCollectorCoverage([contact({ collector_ids: ["c1"] })])).toBe(
      true,
    );
    expect(hasCollectorCoverage([contact({ send_pdf: true })])).toBe(true);
  });

  it("un contacto desactivado no cuenta", () => {
    expect(
      hasCollectorCoverage([
        contact({ collector_ids: ["c1"], enabled: false }),
      ]),
    ).toBe(false);
  });
});

describe("functionOfRole (FTQ-01)", () => {
  const roles = [{ name: "Tesorero", function: "Tesorería", active: true }];

  it("deriva la función del cargo del catálogo", () => {
    expect(functionOfRole(roles, "Tesorero")).toBe("Tesorería");
  });

  it("un cargo legacy fuera del catálogo no tiene función", () => {
    expect(functionOfRole(roles, "contabilidad ppal.")).toBe("");
  });
});

describe("functionsWithoutDefault (FTQ-02)", () => {
  it("detecta la función que tiene contactos activos pero ninguno por defecto", () => {
    const contacts = [
      contact({ function: "Tesorería", default: true }),
      contact({ function: "Gerencia o jefatura" }),
      contact({ function: "Gerencia o jefatura", default: false }),
    ];
    expect(functionsWithoutDefault(contacts)).toEqual(["Gerencia o jefatura"]);
  });

  it("ignora los contactos desactivados", () => {
    const contacts = [contact({ function: "Tesorería", enabled: false })];
    expect(functionsWithoutDefault(contacts)).toEqual([]);
  });
});

describe("describeCalendar", () => {
  it("mensual y semanal", () => {
    expect(describeCalendar({ kind: "MONTHLY", days: [10, 25] })).toBe(
      "días 10 y 25",
    );
    expect(
      describeCalendar({ kind: "WEEKLY", weekday: 5, weeks: [1, 3] }),
    ).toBe("viernes de las semanas 1 y 3");
    expect(describeCalendar({ kind: "WEEKLY", weekday: 1, weeks: [] })).toBe(
      "todos los lunes",
    );
  });
});

describe("proposal dismissal", () => {
  it("oculta la propuesta 30 días y luego vuelve", () => {
    const now = Date.now();
    dismissProposal("d1", now);
    expect(isProposalDismissed("d1", now + 29 * 86_400_000)).toBe(true);
    expect(isProposalDismissed("d1", now + 31 * 86_400_000)).toBe(false);
    expect(isProposalDismissed("otro", now)).toBe(false);
  });
});
