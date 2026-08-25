import { describe, expect, it } from "vitest";
import { createAmountFieldSchema } from "./amount-field-schema";

describe("createAmountFieldSchema — monto del compromiso de pago", () => {
  const totalInvoicesAmount = 4200000;
  const schema = createAmountFieldSchema(
    totalInvoicesAmount,
    "El monto es requerido",
    "El monto no puede superar el total de las facturas seleccionadas"
  );

  it("accepts an amount equal to the total invoices amount (suggested value)", () => {
    const result = schema.safeParse(totalInvoicesAmount);
    expect(result.success).toBe(true);
  });

  it("accepts a partial amount lower than the total invoices amount", () => {
    const result = schema.safeParse(3000000);
    expect(result.success).toBe(true);
  });

  it("rejects an amount of 0", () => {
    const result = schema.safeParse(0);
    expect(result.success).toBe(false);
  });

  it("rejects a negative amount", () => {
    const result = schema.safeParse(-100);
    expect(result.success).toBe(false);
  });

  it("rejects an amount greater than the total invoices amount", () => {
    const result = schema.safeParse(totalInvoicesAmount + 1);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "El monto no puede superar el total de las facturas seleccionadas"
      );
    }
  });

  it("falls back to no upper bound when totalizeSelectedInvoices is 0", () => {
    const noInvoicesSchema = createAmountFieldSchema(
      0,
      "El monto es requerido",
      "..."
    );
    const result = noInvoicesSchema.safeParse(1);
    expect(result.success).toBe(true);
  });
});
