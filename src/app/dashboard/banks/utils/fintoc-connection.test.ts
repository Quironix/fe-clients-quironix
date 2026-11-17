import { describe, expect, it } from "vitest";
import { canManageBanks } from "./fintoc-connection";

const profile = (type: string, scopes: string[]) =>
  ({ type, roles: [{ scopes }] }) as any;

describe("canManageBanks", () => {
  it("ADMIN puede reconectar", () => {
    expect(canManageBanks(profile("ADMIN", []))).toBe(true);
  });

  it("un rol con el permiso de Bancos y cuentas puede reconectar", () => {
    expect(
      canManageBanks(profile("NORMAL", ["client.onboarding.banks:read"])),
    ).toBe(true);
  });

  it("sin ese permiso no puede (le sale el aviso de avisar a un administrador)", () => {
    expect(
      canManageBanks(
        profile("NORMAL", [
          "client_debtors:read",
          "client.onboarding.companies:read",
        ]),
      ),
    ).toBe(false);
    expect(canManageBanks(null)).toBe(false);
  });
});
