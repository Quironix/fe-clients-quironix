import { describe, expect, it } from "vitest";
import { getInvoicePhaseLabel } from "./index";

describe("getInvoicePhaseLabel (PRD_dte_columnas_oc_referencia_y_fase.md §6)", () => {
  it("returns the descriptive name for a known phase number", () => {
    expect(getInvoicePhaseLabel(3)).toBe("Recepcionada");
    expect(getInvoicePhaseLabel(8)).toBe("Factura Pagada");
  });

  it("accepts numeric strings", () => {
    expect(getInvoicePhaseLabel("1")).toBe("Factura sin información");
  });

  it("falls back to 'Fase {n}' for a phase outside 1-8", () => {
    expect(getInvoicePhaseLabel(99)).toBe("Fase 99");
  });

  it("returns '-' when there is no phase", () => {
    expect(getInvoicePhaseLabel(null)).toBe("-");
    expect(getInvoicePhaseLabel(undefined)).toBe("-");
    expect(getInvoicePhaseLabel("")).toBe("-");
  });
});
