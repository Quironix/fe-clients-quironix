import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../index";

const ACCESS_TOKEN = "token-1";
const CLIENT_ID = "client-1";

describe("notifications service — getNotifications", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("calls the unread endpoint with default unread=true and limit=50", async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await getNotifications(ACCESS_TOKEN, CLIENT_ID);

    const [url, options] = (fetch as any).mock.calls[0];
    expect(url).toContain(`/v2/clients/${CLIENT_ID}/notifications?`);
    expect(url).toContain("unread=true");
    expect(url).toContain("limit=50");
    expect(options.headers.Authorization).toBe(`Bearer ${ACCESS_TOKEN}`);
  });

  it("respects explicit unread=false and a custom limit", async () => {
    (fetch as any).mockResolvedValue({ ok: true, json: async () => [] });

    await getNotifications(ACCESS_TOKEN, CLIENT_ID, false, 10);

    const [url] = (fetch as any).mock.calls[0];
    expect(url).toContain("unread=false");
    expect(url).toContain("limit=10");
  });

  it("returns the parsed JSON body on success", async () => {
    const notifications = [{ id: "n-1", type: "EMAIL_REPLY" }];
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => notifications,
    });

    const result = await getNotifications(ACCESS_TOKEN, CLIENT_ID);

    expect(result).toEqual(notifications);
  });

  it("throws with the backend error message when the response is not ok", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ message: "Forbidden" }),
    });

    await expect(getNotifications(ACCESS_TOKEN, CLIENT_ID)).rejects.toThrow(
      "Forbidden",
    );
  });

  it("falls back to a generic error message when the error body is not JSON", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("not json");
      },
    });

    await expect(getNotifications(ACCESS_TOKEN, CLIENT_ID)).rejects.toThrow(
      "Error 500",
    );
  });
});

describe("notifications service — markNotificationAsRead", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("issues a PATCH to the type-scoped read endpoint", async () => {
    (fetch as any).mockResolvedValue({ ok: true, json: async () => ({}) });

    await markNotificationAsRead(ACCESS_TOKEN, CLIENT_ID, "EMAIL_REPLY", "msg-1");

    const [url, options] = (fetch as any).mock.calls[0];
    expect(url).toBe(
      `http://localhost:3000/v2/clients/${CLIENT_ID}/notifications/EMAIL_REPLY/msg-1/read`,
    );
    expect(options.method).toBe("PATCH");
  });

  it("builds the correct URL for an INCOMING_CALL notification", async () => {
    (fetch as any).mockResolvedValue({ ok: true, json: async () => ({}) });

    await markNotificationAsRead(ACCESS_TOKEN, CLIENT_ID, "INCOMING_CALL", "call-1");

    const [url] = (fetch as any).mock.calls[0];
    expect(url).toContain("/notifications/INCOMING_CALL/call-1/read");
  });

  it("throws when the backend responds with a non-ok status", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: "Notification not found" }),
    });

    await expect(
      markNotificationAsRead(ACCESS_TOKEN, CLIENT_ID, "EMAIL_REPLY", "missing"),
    ).rejects.toThrow("Notification not found");
  });
});

describe("notifications service — markAllNotificationsAsRead", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("issues a PATCH to the read-all endpoint", async () => {
    (fetch as any).mockResolvedValue({ ok: true, json: async () => ({}) });

    await markAllNotificationsAsRead(ACCESS_TOKEN, CLIENT_ID);

    const [url, options] = (fetch as any).mock.calls[0];
    expect(url).toBe(
      `http://localhost:3000/v2/clients/${CLIENT_ID}/notifications/read-all`,
    );
    expect(options.method).toBe("PATCH");
    expect(options.headers.Authorization).toBe(`Bearer ${ACCESS_TOKEN}`);
  });

  it("throws when the backend responds with a non-ok status", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "Internal error" }),
    });

    await expect(
      markAllNotificationsAsRead(ACCESS_TOKEN, CLIENT_ID),
    ).rejects.toThrow("Internal error");
  });
});
