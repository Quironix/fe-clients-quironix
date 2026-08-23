import { describe, expect, it } from "vitest";
import { buildEmailPayload } from "./email-builder";
import type { ManagementFormData } from "../components/tabs/add-management-tab";
import type { ManagementCombination } from "../config/management-types";

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
