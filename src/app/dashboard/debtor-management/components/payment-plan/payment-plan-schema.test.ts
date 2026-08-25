import { describe, expect, it } from "vitest";
import { createPaymentPlanSchema } from "./payment-plan-schema";

const BASE = {
  downPayment: 0,
  numberOfInstallments: 3,
  annualInterestRate: 0,
  paymentMethod: "TRANSFER",
  paymentFrequency: "FREQ_30_DAYS",
  startDate: new Date("2026-09-01"),
};

describe("createPaymentPlanSchema — committedAmount validation", () => {
  const totalInvoicesAmount = 4200000;
  const schema = createPaymentPlanSchema(totalInvoicesAmount);

  it("accepts a committedAmount equal to the total invoices amount (suggested value)", () => {
    const result = schema.safeParse({ ...BASE, committedAmount: totalInvoicesAmount });
    expect(result.success).toBe(true);
  });

  it("accepts a committedAmount lower than the total invoices amount (partial payment)", () => {
    const result = schema.safeParse({ ...BASE, committedAmount: 3000000 });
    expect(result.success).toBe(true);
  });

  it("rejects a committedAmount of 0", () => {
    const result = schema.safeParse({ ...BASE, committedAmount: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("committedAmount");
    }
  });

  it("rejects a negative committedAmount", () => {
    const result = schema.safeParse({ ...BASE, committedAmount: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects a committedAmount greater than the total invoices amount", () => {
    const result = schema.safeParse({
      ...BASE,
      committedAmount: totalInvoicesAmount + 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("committedAmount");
    }
  });

  it("falls back to no upper bound when totalInvoicesAmount is 0 (no invoices selected yet)", () => {
    const noInvoicesSchema = createPaymentPlanSchema(0);
    const result = noInvoicesSchema.safeParse({
      ...BASE,
      committedAmount: 1,
    });
    expect(result.success).toBe(true);
  });
});
