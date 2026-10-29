import type { TrackEmailMessage } from "@/services/inbound-email-replies";
import type { InboundInvoiceEmail } from "@/services/inbound-invoice-emails";
import { describe, expect, it } from "vitest";
import {
  fromCobranza,
  isPending,
  mergeInboxPages,
  sentBy,
  shortDate,
  withinLoadedRange,
} from "./unified-inbox";

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

describe("mergeInboxPages", () => {
  const email = (day: number, status = "PENDING_REVIEW") =>
    ({
      id: `e${day}`,
      status,
      cursor: `2026-10-${String(day).padStart(2, "0")}T00:00:00.000000Z_e${day}`,
    }) as InboundInvoiceEmail;
  // Más nuevo primero, como lo devuelve el servidor.
  const range = (from: number, to: number) =>
    Array.from({ length: from - to + 1 }, (_, i) => email(from - i));

  it("a short head is already everything", () => {
    const head = range(3, 1);
    expect(mergeInboxPages(head, [range(3, 1)], 5).emails).toBe(head);
  });

  it("takes the head's range from the head and older rows from the pages", () => {
    const head = [email(10, "MATCHED"), ...range(9, 7)];

    const { emails, hasGap } = mergeInboxPages(
      head,
      [range(10, 7), range(6, 3)],
      4,
    );

    expect(emails.map((e) => e.id)).toEqual([
      "e10",
      "e9",
      "e8",
      "e7",
      "e6",
      "e5",
      "e4",
      "e3",
    ]);
    expect(emails[0].status).toBe("MATCHED");
    expect(hasGap).toBe(false);
  });

  it("flags a gap when more than a page arrived", () => {
    expect(mergeInboxPages(range(20, 17), [range(10, 7)], 4).hasGap).toBe(true);
  });
});

describe("withinLoadedRange", () => {
  const at = (day: number) =>
    `2026-10-${String(day).padStart(2, "0")}T00:00:00Z`;
  const rows = [12, 10, 8, 5].map((day) =>
    fromCobranza(message({ id: `m${day}`, created_at: at(day) })),
  );

  it("hides rows older than the last loaded row of a source with more pages", () => {
    const sources = [
      { data: [{ created_at: at(9) }], hasNextPage: true },
      { data: [{ created_at: at(4) }], hasNextPage: true },
      { data: [{ created_at: at(11) }], hasNextPage: false },
    ];
    expect(withinLoadedRange(rows, sources).map((row) => row.key)).toEqual([
      "c-m12",
      "c-m10",
    ]);
  });

  it("keeps everything when every source is complete", () => {
    expect(
      withinLoadedRange(rows, [
        { data: [{ created_at: at(9) }], hasNextPage: false },
      ]),
    ).toBe(rows);
  });
});

describe("shortDate", () => {
  const now = new Date("2026-10-12T18:00:00");

  it("shows the time for today and the day for older emails", () => {
    expect(shortDate("2026-10-12T10:18:00", now)).toBe("10:18");
    expect(shortDate("2026-10-09T10:18:00", now)).toBe("09-10");
  });
});
