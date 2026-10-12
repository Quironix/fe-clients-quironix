import type { TrackEmailMessage } from "@/services/inbound-email-replies";
import { describe, expect, it } from "vitest";
import { fromCobranza, isPending, sentBy, shortDate } from "./unified-inbox";

const message = (overrides: Partial<TrackEmailMessage>): TrackEmailMessage => ({
  id: "m1",
  direction: "OUT",
  client_id: "c1",
  debtor_id: "d1",
  from_address: "cobranza@reply.quironix.com",
  created_at: "2026-10-12T10:00:00Z",
  ...overrides,
});

describe("sentBy", () => {
  it("labels who sent an outgoing email, Quirón first", () => {
    expect(
      sentBy(message({ sent_by_agent: true, sent_by_executive_id: "u1" })),
    ).toBe("QUIRON");
    expect(sentBy(message({ sent_by_executive_id: "u1" }))).toBe("EXECUTIVE");
    expect(sentBy(message({ collector_execution_log_id: "l1" }))).toBe(
      "COLLECTOR",
    );
    expect(sentBy(message({}))).toBeNull();
  });

  it("ignores incoming emails", () => {
    expect(
      sentBy(message({ direction: "IN", collector_execution_log_id: "l1" })),
    ).toBeNull();
  });
});

describe("isPending", () => {
  it("never counts a sent email as pending", () => {
    expect(isPending(fromCobranza(message({})))).toBe(false);
    expect(isPending(fromCobranza(message({ direction: "IN" })))).toBe(true);
  });
});

describe("shortDate", () => {
  const now = new Date("2026-10-12T18:00:00");

  it("shows the time for today and the day for older emails", () => {
    expect(shortDate("2026-10-12T10:18:00", now)).toBe("10:18");
    expect(shortDate("2026-10-09T10:18:00", now)).toBe("09-10");
  });
});
