export type Interval = { start: Date; end: Date; id?: string };

export function rangesOverlap(a: Interval, b: Interval) {
  return a.start < b.end && b.start < a.end;
}

export type TeamAssignment = {
  userId: string;
  eventId: string;
  title: string;
  start: Date;
  end: Date;
};

export function findTeamConflicts(args: {
  assignedUserIds: string[];
  start: Date;
  end: Date;
  existing: TeamAssignment[];
  ignoreEventId?: string;
}) {
  if (args.end <= args.start) {
    return {
      valid: false as const,
      message: "End time must be after start time.",
      conflicts: [],
    };
  }
  const conflicts = args.existing.filter((event) => {
    if (args.ignoreEventId && event.eventId === args.ignoreEventId) return false;
    if (!args.assignedUserIds.includes(event.userId)) return false;
    return rangesOverlap(
      { start: args.start, end: args.end },
      { start: event.start, end: event.end },
    );
  });
  if (!conflicts.length) {
    return { valid: true as const, conflicts: [] };
  }
  return {
    valid: false as const,
    message: "CONFLICT DETECTED",
    conflicts,
  };
}

export const DEFAULT_REMINDER_OFFSETS_MINUTES = [24 * 60, 2 * 60];

export function reminderSendAt(eventStart: Date, offsetMinutes: number) {
  return new Date(eventStart.getTime() - offsetMinutes * 60 * 1000);
}

export function reminderDedupeKey(
  eventId: string,
  offsetMinutes: number,
  channel: string,
) {
  return `${eventId}:${offsetMinutes}:${channel}`;
}

export type InvoiceItem = {
  description: string;
  quantity: number;
  price: number;
};

export function invoiceTotals(args: {
  items: InvoiceItem[];
  discount?: number;
  taxRate?: number;
  paid?: number;
}) {
  const subtotal = args.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );
  const discount = args.discount ?? 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * ((args.taxRate ?? 0) / 100);
  const total = taxable + tax;
  const paid = args.paid ?? 0;
  const balance = Math.max(0, total - paid);
  return {
    subtotal: roundMoney(subtotal),
    discount: roundMoney(discount),
    tax: roundMoney(tax),
    total: roundMoney(total),
    paid: roundMoney(paid),
    balance: roundMoney(balance),
  };
}

export function deriveInvoiceStatus(args: {
  current: string;
  total: number;
  paid: number;
  dueDate?: Date | null;
  now?: Date;
}) {
  if (args.current === "draft" || args.current === "cancelled") {
    return args.current;
  }
  if (args.paid <= 0) {
    if (args.dueDate && (args.now ?? new Date()) > args.dueDate) return "overdue";
    return "issued";
  }
  if (args.paid >= args.total) return "paid";
  if (args.dueDate && (args.now ?? new Date()) > args.dueDate) return "overdue";
  return "partially_paid";
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export const LEAD_STAGES = [
  "new",
  "contacted",
  "qualified",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
] as const;

export const PROJECT_STAGES = [
  "enquiry",
  "planning",
  "scheduled",
  "in_production",
  "editing",
  "client_review",
  "revisions",
  "delivered",
  "completed",
] as const;

export const PROJECT_WORKFLOWS: Record<string, typeof PROJECT_STAGES[number][]> = {
  video: [
    "enquiry",
    "planning",
    "scheduled",
    "in_production",
    "editing",
    "client_review",
    "revisions",
    "delivered",
    "completed",
  ],
  website: [
    "enquiry",
    "planning",
    "in_production",
    "client_review",
    "revisions",
    "delivered",
    "completed",
  ],
  seo: ["enquiry", "planning", "in_production", "client_review", "delivered", "completed"],
  marketing: [
    "enquiry",
    "planning",
    "scheduled",
    "in_production",
    "client_review",
    "revisions",
    "delivered",
    "completed",
  ],
};

export const TASK_STATUSES = ["todo", "in_progress", "waiting", "done"] as const;
export const EVENT_TYPES = [
  "shoot",
  "meeting",
  "site_visit",
  "deadline",
  "delivery",
  "other",
] as const;
