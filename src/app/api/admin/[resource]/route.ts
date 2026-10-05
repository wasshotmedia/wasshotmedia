import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { requireUser, lean, logActivity } from "@/lib/admin-guard";
import { errorJson, json, slugify } from "@/lib/utils";
import { isMongoConnected } from "@/lib/db";
import { localStore } from "@/lib/local-store";
import {
  Client,
  Lead,
  Project,
  Task,
  CalendarEvent,
  Reminder,
  Notification,
  Invoice,
  Service,
  PortfolioProject,
  FAQ,
  Testimonial,
  PricingPlan,
  ContactMessage,
  User,
  Payment,
} from "@/models";
import {
  clientSchema,
  leadSchema,
  projectSchema,
  taskSchema,
  cmsServiceSchema,
  portfolioSchema,
  faqSchema,
  testimonialSchema,
  pricingSchema,
} from "@/lib/validators";
import { findTeamConflicts, invoiceTotals, deriveInvoiceStatus } from "@/lib/domain";
import { syncEventReminders } from "@/lib/reminders";
import { canOverrideConflicts, canWrite, type SessionUser } from "@/lib/auth";

const collections = {
  clients: { model: Client, schema: clientSchema, search: ["name", "email", "business"] },
  leads: { model: Lead, schema: leadSchema },
  projects: { model: Project, schema: projectSchema },
  tasks: { model: Task, schema: taskSchema },
  services: { model: Service, schema: cmsServiceSchema },
  portfolio: { model: PortfolioProject, schema: portfolioSchema },
  faqs: { model: FAQ, schema: faqSchema },
  testimonials: { model: Testimonial, schema: testimonialSchema },
  pricing: { model: PricingPlan, schema: pricingSchema },
  messages: { model: ContactMessage, schema: null },
  reminders: { model: Reminder, schema: null },
  notifications: { model: Notification, schema: null },
  users: { model: User, schema: null },
  payments: { model: Payment, schema: null },
  events: { model: CalendarEvent, schema: null },
  invoices: { model: Invoice, schema: null },
} as const;

type Resource = keyof typeof collections;

function asResource(value: string): Resource | null {
  return value in collections ? (value as Resource) : null;
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ resource: string }> },
) {
  const { session, response } = await requireUser();
  if (!session) return response;
  const { resource: raw } = await ctx.params;

  // Local fallback fast path
  if (!isMongoConnected()) {
    if (raw === "analytics") {
      const allClients = localStore.find("clients");
      const allLeads = localStore.find("leads");
      const allProjects = localStore.find("projects");
      const allTasks = localStore.find("tasks");
      const allEvents = localStore.find("events");
      const allInvoices = localStore.find("invoices");
      const allMessages = localStore.find("messages");
      const allReminders = localStore.find("reminders");

      return json({
        clients: allClients.length,
        leads: allLeads.filter((l: any) => l.stage !== "won" && l.stage !== "lost").length,
        projects: allProjects.filter((p: any) => p.stage !== "delivered").length,
        openTasks: allTasks.filter((t: any) => t.status !== "done").length,
        upcomingEvents: allEvents.filter((e: any) => e.status !== "cancelled").length,
        overdueInvoices: allInvoices.filter((i: any) => i.status === "overdue").length,
        unreadMessages: allMessages.filter((m: any) => m.status === "new").length,
        remindersScheduled: allReminders.length,
        leadByStage: [
          { _id: "new", count: allLeads.filter((l: any) => l.stage === "new").length },
          { _id: "proposal_sent", count: allLeads.filter((l: any) => l.stage === "proposal_sent").length },
          { _id: "qualified", count: allLeads.filter((l: any) => l.stage === "qualified").length },
          { _id: "won", count: allLeads.filter((l: any) => l.stage === "won").length },
        ],
      });
    }

    if (raw === "events") {
      const items = localStore.find("events");
      return json({ items });
    }

    if (raw === "invoices") {
      const items = localStore.find("invoices");
      return json({ items });
    }

    if (raw === "activity") {
      const items = localStore.find("activityLogs");
      return json({ items });
    }

    if (raw === "settings") {
      const settings = localStore.getSettings();
      return json({ item: settings });
    }

    const resource = asResource(raw);
    if (!resource) return errorJson("Unknown resource", 404);

    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const stage = url.searchParams.get("stage");
    const status = url.searchParams.get("status");

    const filter: Record<string, any> = {};
    if (stage) filter.stage = stage;
    if (status) filter.status = status;
    if (q && resource === "clients") {
      filter.$or = [
        { name: new RegExp(q, "i") },
        { email: new RegExp(q, "i") },
        { business: new RegExp(q, "i") },
      ];
    }

    const items = localStore.find(resource as any, filter);
    return json({ items });
  }

  // MongoDB path
  if (raw === "analytics") return analytics();
  if (raw === "events") return listEvents(request);
  if (raw === "invoices") return listInvoices();
  if (raw === "activity") {
    const { ActivityLog } = await import("@/models");
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100).lean();
    return json({ items: lean(logs) });
  }
  if (raw === "settings") {
    const { AgencySettings } = await import("@/models");
    const settings = await AgencySettings.findOne({ singleton: "agency" });
    return json({ item: lean(settings) });
  }

  const resource = asResource(raw);
  if (!resource) return errorJson("Unknown resource", 404);
  const { model } = collections[resource];
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const filter: Record<string, unknown> = {};
  const stage = url.searchParams.get("stage");
  const status = url.searchParams.get("status");
  if (stage) filter.stage = stage;
  if (status) filter.status = status;
  if (q && resource === "clients") {
    filter.$or = [
      { name: new RegExp(q, "i") },
      { email: new RegExp(q, "i") },
      { business: new RegExp(q, "i") },
    ];
  }
  let query = (model as any).find(filter).sort({ createdAt: -1 }).limit(200);
  if (resource === "users") {
    query = User.find({ isActive: true }).select("-passwordHash").sort({ name: 1 }) as any;
  }
  const items = await query;
  return json({ items: lean(items) });
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ resource: string }> },
) {
  const { session, response } = await requireUser();
  if (!session) return response;
  const { resource: raw } = await ctx.params;
  const body = await request.json().catch(() => ({}));

  // Local fallback fast path
  if (!isMongoConnected()) {
    if (raw === "events") {
      const created = localStore.create("events", {
        ...body,
        status: body.status || "scheduled",
      });
      localStore.logActivity("create:event", "events", String(created._id), { title: created.title }, session.name);
      return json({ item: created }, { status: 201 });
    }

    if (raw === "invoices") {
      const items = body.items || [];
      const subtotal = items.reduce((sum: number, it: any) => sum + (Number(it.quantity || 1) * Number(it.unitPrice || 0)), 0);
      const taxRate = Number(body.taxRate || 18);
      const tax = (subtotal * taxRate) / 100;
      const total = subtotal + tax;
      const amountPaid = Number(body.paid || 0);
      const balance = Math.max(0, total - amountPaid);
      const invCount = localStore.find("invoices").length + 1;
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invCount).padStart(3, "0")}`;

      const created = localStore.create("invoices", {
        ...body,
        invoiceNumber,
        items,
        subtotal,
        tax,
        total,
        amountPaid,
        balance,
        status: balance === 0 ? "paid" : amountPaid > 0 ? "partial" : "sent",
      });
      localStore.logActivity("create:invoice", "invoices", String(created._id), { invoiceNumber }, session.name);
      return json({ item: created }, { status: 201 });
    }

    if (raw === "settings") {
      const updated = localStore.updateSettings(body);
      localStore.logActivity("update:settings", "settings", "agency", {}, session.name);
      return json({ item: updated });
    }

    const resource = asResource(raw);
    if (!resource) return errorJson("Unknown resource", 404);

    if (raw === "portfolio" && !body.slug && body.title) {
      body.slug = slugify(body.title);
    }

    const created = localStore.create(resource as any, body);
    localStore.logActivity(`create:${raw}`, raw, String(created._id), {}, session.name);
    return json({ item: created }, { status: 201 });
  }

  // MongoDB path
  if (raw === "events") return createEvent(request, body, session);
  if (raw === "invoices") return createInvoice(body, session);
  if (raw === "settings") {
    const { AgencySettings } = await import("@/models");
    const updated = await AgencySettings.findOneAndUpdate(
      { singleton: "agency" },
      { $set: body },
      { new: true, upsert: true },
    );
    await logActivity(session, "update:settings", "settings", "agency");
    return json({ item: lean(updated) });
  }
  if (raw === "process-reminders") {
    const { processDueReminders } = await import("@/lib/reminders");
    const results = await processDueReminders();
    return json({ processed: results.length, results });
  }

  const resource = asResource(raw);
  if (!resource) return errorJson("Unknown resource", 404);
  if (resource === "users" || resource === "reminders") {
    return errorJson("This resource cannot be created this way", 400);
  }
  const spec = collections[resource];
  if (!spec.schema) {
    return errorJson("Create is not supported on this resource", 400);
  }
  const parsed = spec.schema.safeParse(body);
  if (!parsed.success) return errorJson("Invalid data", 400, { issues: parsed.error.flatten() });
  const data: Record<string, unknown> = { ...parsed.data };
  if ("slug" in data && !data.slug && typeof data.title === "string") data.slug = slugify(data.title);
  const created = await (spec.model as any).create(data);
  if (!created) return errorJson("Failed to create", 500);
  await logActivity(session, `create:${raw}`, raw, String(created._id));
  return json({ item: lean(created) }, { status: 201 });
}

async function analytics() {
  const [
    clients,
    leads,
    projects,
    openTasks,
    upcomingEvents,
    overdueInvoices,
    unreadMessages,
    remindersScheduled,
  ] = await Promise.all([
    Client.countDocuments(),
    Lead.countDocuments({ stage: { $nin: ["won", "lost"] } }),
    Project.countDocuments({ stage: { $ne: "completed" } }),
    Task.countDocuments({ status: { $ne: "done" } }),
    CalendarEvent.countDocuments({
      status: { $ne: "cancelled" },
      start: { $gte: new Date() },
    }),
    Invoice.countDocuments({ status: "overdue" }),
    ContactMessage.countDocuments({ status: "new" }),
    Reminder.countDocuments({ status: "scheduled" }),
  ]);
  const leadByStage = await Lead.aggregate([{ $group: { _id: "$stage", count: { $sum: 1 } } }]);
  return json({
    clients,
    leads,
    projects,
    openTasks,
    upcomingEvents,
    overdueInvoices,
    unreadMessages,
    remindersScheduled,
    leadByStage,
  });
}

async function listEvents(request: NextRequest) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const filter: Record<string, unknown> = { status: { $ne: "cancelled" } };
  if (from || to) {
    filter.start = {
      ...(from ? { $gte: new Date(from) } : {}),
      ...(to ? { $lte: new Date(to) } : {}),
    };
  }
  const items = await CalendarEvent.find(filter).sort({ start: 1 }).limit(500);
  return json({ items: lean(items) });
}

async function listInvoices() {
  const items = await Invoice.find().sort({ createdAt: -1 }).limit(200);
  return json({ items: lean(items) });
}

async function createEvent(
  request: NextRequest,
  body: Record<string, unknown>,
  session: SessionUser,
) {
  try {
    const { eventSchema } = await import("@/lib/validators");
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) return errorJson("Invalid event", 400, { issues: parsed.error.flatten() });
    const start = new Date(parsed.data.start);
    const end = new Date(parsed.data.end);
    const assigned = parsed.data.assignedTeam || [];
    const existingDocs = await CalendarEvent.find({
      status: { $ne: "cancelled" },
      assignedTeam: { $in: assigned.filter(Boolean) },
      start: { $lt: end },
      end: { $gt: start },
    });
    const existing = existingDocs.flatMap((event) =>
      (event.assignedTeam || []).map((userId) => ({
        userId: String(userId),
        eventId: String(event._id),
        title: event.title,
        start: event.start,
        end: event.end,
      })),
    );
    const check = findTeamConflicts({
      assignedUserIds: assigned,
      start,
      end,
      existing,
    });
    if (!check.valid && check.conflicts.length) {
      if (!parsed.data.overrideConflict || !canOverrideConflicts(session.role)) {
        return errorJson("CONFLICT DETECTED", 409, {
          conflicts: check.conflicts,
          message:
            "This person is already booked in the selected window. An owner or admin must explicitly override the conflict.",
        });
      }
    }
    const created = await CalendarEvent.create({
      ...parsed.data,
      start,
      end,
      conflictOverride: Boolean(parsed.data.overrideConflict && check.conflicts.length),
      conflictOverrideBy: parsed.data.overrideConflict ? session.id : undefined,
    });
    if (created.status === "confirmed" || created.status === "scheduled") {
      await syncEventReminders({
        eventId: String(created._id),
        start,
        assignedTeam: assigned,
        offsets: parsed.data.reminderOffsets,
      });
    }
    await logActivity(session, "create:event", "events", String(created._id));
    return json({ item: lean(created), conflictOverridden: created.conflictOverride }, { status: 201 });
  } catch (err: any) {
    console.error("createEvent error:", err);
    return errorJson(err.message || "Failed to create event", 500);
  }
}

async function createInvoice(
  body: Record<string, unknown>,
  session: SessionUser,
) {
  const { invoiceSchema } = await import("@/lib/validators");
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) return errorJson("Invalid invoice", 400, { issues: parsed.error.flatten() });
  const totals = invoiceTotals({
    items: parsed.data.items,
    discount: parsed.data.discount,
    taxRate: parsed.data.taxRate,
    paid: parsed.data.paid,
  });
  const count = await Invoice.countDocuments();
  const number = `WSM-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
  const status = deriveInvoiceStatus({
    current: parsed.data.status || "draft",
    total: totals.total,
    paid: totals.paid,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
  });
  const created = await Invoice.create({
    number,
    clientId: parsed.data.clientId,
    projectId: parsed.data.projectId || undefined,
    items: parsed.data.items,
    taxRate: parsed.data.taxRate || 0,
    ...totals,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    status,
    notes: parsed.data.notes,
  });
  await logActivity(session, "create:invoice", "invoices", String(created._id));
  return json({ item: lean(created) }, { status: 201 });
}

export const runtime = "nodejs";
