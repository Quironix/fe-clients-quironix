import { afterEach, describe, expect, it, vi } from "vitest";
import { getQuironscore } from "../services";
import { buildQuironscoreView } from "../utils/quironscore-view";

const respond = (body: unknown, ok = true) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok,
    json: async () => body,
  } as Response);

describe("getQuironscore", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sin cálculo todavía ({ data: null }) devuelve null y la tarjeta no se rompe", async () => {
    respond({ data: null });
    const data = await getQuironscore("token", "client-1");
    expect(data).toBeNull();
    expect(buildQuironscoreView(data).headline).toBe("Sin cálculo todavía");
  });

  it("desenvuelve la foto del Quironscore", async () => {
    respond({ data: { quironscore: null, calculationDate: "2026-09-26" } });
    expect(await getQuironscore("token", "client-1")).toEqual({
      quironscore: null,
      calculationDate: "2026-09-26",
    });
  });

  it("si la respuesta falla devuelve null", async () => {
    respond({ message: "Unauthorized" }, false);
    expect(await getQuironscore("token", "client-1")).toBeNull();
  });
});
