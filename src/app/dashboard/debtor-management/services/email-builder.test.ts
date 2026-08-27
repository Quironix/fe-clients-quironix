import { describe, expect, it } from "vitest";
import { buildEmailPayload } from "./email-builder";
import type { ManagementCombination } from "../config/management-types";

// Local minimal shape instead of importing ManagementFormData from
// add-management-tab.tsx: that file transitively pulls in
// ManagementLitigationForm.tsx, which the vite/esbuild JSX transform in this
// repo's vitest config fails to parse (pre-existing, unrelated to this fix —
// confirmed the same failure happens on develop HEAD via `git stash`).
type ManagementFormData = Record<string, any>;

const managementCombination: ManagementCombination = {
  id: "combo-1",
  label: "Recordatorio de pago",
  description: "",
  management_type: "CALL",
  debtor_comment: "NO_ANSWER",
  executive_comment: "PENDING",
  targetPhase: 1,
  fields: [],
};

const baseFormData = (
  overrides: Partial<ManagementFormData> = {},
): ManagementFormData =>
  ({
    managementType: "CALL",
    debtorComment: "NO_ANSWER",
    executiveComment: "PENDING",
    contactType: "EMAIL",
    contactValue: "principal@ejemplo.com",
    observation: "",
    nextManagementDate: "",
    nextManagementTime: "",
    caseData: {},
    ...overrides,
  }) as ManagementFormData;

const baseParams = (formOverrides: Partial<ManagementFormData> = {}) => ({
  managementFormData: baseFormData(formOverrides),
  selectedInvoices: [],
  profile: { client: { name: "ACME" } },
  managementCombination,
  debtorName: "Deudor 1",
});

describe("buildEmailPayload — recipients", () => {
  it("sends `to` as a single string when there are no additional contacts", () => {
    const payload = buildEmailPayload(baseParams());
    expect(payload.to).toBe("principal@ejemplo.com");
  });

  it("sends `to` as an array including the primary and additional enabled contacts", () => {
    const payload = buildEmailPayload(
      baseParams({ additionalContactEmails: ["extra@ejemplo.com"] }),
    );
    expect(payload.to).toEqual([
      "principal@ejemplo.com",
      "extra@ejemplo.com",
    ]);
  });

  it("de-duplicates the primary contact if it also appears in additionalContactEmails", () => {
    const payload = buildEmailPayload(
      baseParams({
        additionalContactEmails: ["principal@ejemplo.com", "extra@ejemplo.com"],
      }),
    );
    expect(payload.to).toEqual([
      "principal@ejemplo.com",
      "extra@ejemplo.com",
    ]);
  });

  it("throws when the primary contact has no email", () => {
    expect(() =>
      buildEmailPayload(baseParams({ contactValue: "" })),
    ).toThrow("El contacto seleccionado no tiene un email válido");
  });
});

describe("buildEmailPayload — committed amount", () => {
  const invoices = [
    { id: "inv-1", balance: 4200000 },
    { id: "inv-2", balance: 800000 },
  ] as any;

  it("uses the edited committed amount instead of the invoice sum when it's a number", () => {
    const payload = buildEmailPayload({
      ...baseParams({ caseData: { amount: 1000 } }),
      selectedInvoices: invoices,
    });
    expect(payload.dynamicTemplateData.header_amount).toBe("1.000");
  });

  it("falls back to the invoice sum when the committed amount is a string (regression: native <input> onChange must coerce to number)", () => {
    const payload = buildEmailPayload({
      ...baseParams({ caseData: { amount: "1000" } }),
      selectedInvoices: invoices,
    });
    expect(payload.dynamicTemplateData.header_amount).toBe("5.000.000");
  });

  it("falls back to the invoice sum when no committed amount was entered", () => {
    const payload = buildEmailPayload({
      ...baseParams({ caseData: {} }),
      selectedInvoices: invoices,
    });
    expect(payload.dynamicTemplateData.header_amount).toBe("5.000.000");
  });
});
