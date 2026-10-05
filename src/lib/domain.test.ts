import { describe, expect, it } from "vitest";
import {
  deriveInvoiceStatus,
  findTeamConflicts,
  invoiceTotals,
  rangesOverlap,
  reminderDedupeKey,
  reminderSendAt,
} from "@/lib/domain";

describe("calendar conflicts", () => {
  it("detects overlapping assignments for the same person", () => {
    const start = new Date("2026-10-03T10:00:00.000Z");
    const end = new Date("2026-10-03T13:00:00.000Z");
    const result = findTeamConflicts({
      assignedUserIds: ["praneeth"],
      start: new Date("2026-10-03T12:00:00.000Z"),
      end: new Date("2026-10-03T14:00:00.000Z"),
      existing: [
        {
          userId: "praneeth",
          eventId: "a",
          title: "Client Shoot",
          start,
          end,
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.message).toBe("CONFLICT DETECTED");
    expect(result.conflicts).toHaveLength(1);
  });

  it("allows bookings for a different teammate", () => {
    const result = findTeamConflicts({
      assignedUserIds: ["wasim"],
      start: new Date("2026-10-03T12:00:00.000Z"),
      end: new Date("2026-10-03T14:00:00.000Z"),
      existing: [
        {
          userId: "praneeth",
          eventId: "a",
          title: "Client Shoot",
          start: new Date("2026-10-03T10:00:00.000Z"),
          end: new Date("2026-10-03T13:00:00.000Z"),
        },
      ],
    });
    expect(result.valid).toBe(true);
  });

  it("rejects inverted time ranges", () => {
    const result = findTeamConflicts({
      assignedUserIds: ["praneeth"],
      start: new Date("2026-10-03T14:00:00.000Z"),
      end: new Date("2026-10-03T12:00:00.000Z"),
      existing: [],
    });
    expect(result.valid).toBe(false);
  });

  it("range overlap is exclusive at the edges", () => {
    expect(
      rangesOverlap(
        { start: new Date("2026-10-03T10:00:00Z"), end: new Date("2026-10-03T12:00:00Z") },
        { start: new Date("2026-10-03T12:00:00Z"), end: new Date("2026-10-03T14:00:00Z") },
      ),
    ).toBe(false);
  });
});

describe("invoices", () => {
  it("computes totals from items, discount and tax", () => {
    const totals = invoiceTotals({
      items: [
        { description: "Shoot", quantity: 1, price: 10000 },
        { description: "Edit", quantity: 2, price: 2500 },
      ],
      discount: 1000,
      taxRate: 18,
      paid: 5000,
    });
    expect(totals.subtotal).toBe(15000);
    expect(totals.total).toBe(16520);
    expect(totals.balance).toBe(11520);
  });

  it("marks overdue issued invoices", () => {
    expect(
      deriveInvoiceStatus({
        current: "issued",
        total: 100,
        paid: 0,
        dueDate: new Date("2026-01-01"),
        now: new Date("2026-02-01"),
      }),
    ).toBe("overdue");
  });
});

describe("reminders", () => {
  it("schedules send time from event start", () => {
    const start = new Date("2026-10-04T10:00:00.000Z");
    expect(reminderSendAt(start, 120).toISOString()).toBe("2026-10-04T08:00:00.000Z");
  });

  it("builds a stable dedupe key", () => {
    expect(reminderDedupeKey("evt1", 1440, "email")).toBe("evt1:1440:email");
  });
});
