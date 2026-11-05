import { afterEach, describe, expect, it, vi } from "vitest";
import { queueTrackSummaryEmail } from "./email-sender";

const fetchMock = vi.fn();

describe("queueTrackSummaryEmail", () => {
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("encola el correo con los ids de las gestiones", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ queued: true }),
    });

    const result = await queueTrackSummaryEmail(
      ["t-1", "t-2"],
      "token-1",
      "client-1"
    );

    expect(result.success).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "http://localhost:3000/v2/clients/client-1/managements/emails/track-summary"
    );
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer token-1");
    expect(JSON.parse(init.body)).toEqual({ track_ids: ["t-1", "t-2"] });
  });

  it("devuelve success false si el backend rechaza el pedido", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: "Track not found" }),
    });

    const result = await queueTrackSummaryEmail(["x"], "token-1", "client-1");

    expect(result).toEqual({ success: false, message: "Track not found" });
  });
});
