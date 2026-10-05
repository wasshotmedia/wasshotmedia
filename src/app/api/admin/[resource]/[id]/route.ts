import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { requireUser, lean, logActivity } from "@/lib/admin-guard";
import { errorJson, json } from "@/lib/utils";
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
  Payment,
  Service,
  PortfolioProject,
  FAQ,
  Testimonial,
  PricingPlan,
  ContactMessage,
  User,
  ActivityLog,
} from "@/models";
import {
  findTeamConflicts,
  invoiceTotals,
  deriveInvoiceStatus,
  type TeamAssignment,
} from "@/lib/domain";
import { syncEventReminders } from "@/lib/reminders";
import { canOverrideConflicts, canWrite } from "@/lib/auth";

const collections: Record<string, mongoose.Model<any>> = {
  clients: Client,
  leads: Lead,
  projects: Project,
  tasks: Task,
  events: CalendarEvent,
  reminders: Reminder,
  notifications: Notification,
  invoices: Invoice,
  payments: Payment,
  services: Service,
  portfolio: PortfolioProject,
  faqs: FAQ,
  testimonials: Testimonial,
  pricing: PricingPlan,
  messages: ContactMessage,
  users: User,
};

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ resource: string; id: string }> },
) {
  const { session, response } = await requireUser();
  if (!session) return response;
  const { resource, id } = await ctx.params;

  // Local store path
  if (!isMongoConnected()) {
    const item = localStore.findById(resource as any, id);
    if (!item) return errorJson("Item not found", 404);

    if (resource === "clients") {
      const projects = localStore.find("projects", { clientId: id });
      const events = localStore.find("events", { clientId: id });
      const tasks = localStore.find("tasks", { clientId: id });
      const invoices = localStore.find("invoices", { clientId: id });
      const messages = localStore.find("messages", { email: item.email });
      const activities = localStore.find("activityLogs", { entityId: id });

      return json({
        item,
        projects,
        events,
        tasks,
        invoices,
        messages,
        activities,
      });
    }

    if (resource === "events") {
      const reminders = localStore.find("reminders", { eventId: id });
      const team = localStore.find("users");
      return json({ item, reminders, team });
    }

    if (resource === "projects") {
      const tasks = localStore.find("tasks", { projectId: id });
      const events = localStore.find("events", { projectId: id });
      const client = item.clientId ? localStore.findById("clients", item.clientId) : null;
      return json({ item, tasks, events, client });
    }

    return json({ item });
  }

  // MongoDB path
  const model = collections[resource];
  if (!model) return errorJson("Unknown resource", 404);
  if (!mongoose.Types.ObjectId.isValid(id)) return errorJson("Invalid ID format", 400);

  const item = await model.findById(id).lean();
  if (!item) return errorJson("Item not found", 404);

  if (resource === "clients") {
    const [projects, events, tasks, invoices, messages, activities] = await Promise.all([
      Project.find({ clientId: id }).sort({ createdAt: -1 }).lean(),
      CalendarEvent.find({ clientId: id }).sort({ start: -1 }).lean(),
      Task.find({ clientId: id }).sort({ dueDate: 1 }).lean(),
      Invoice.find({ clientId: id }).sort({ createdAt: -1 }).lean(),
      ContactMessage.find({ email: (item as any).email }).sort({ createdAt: -1 }).lean(),
      ActivityLog.find({ entityId: id }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    return json({
      item: lean(item),
      projects: lean(projects),
      events: lean(events),
      tasks: lean(tasks),
      invoices: lean(invoices),
      messages: lean(messages),
      activities: lean(activities),
    });
  }

  if (resource === "events") {
    const [reminders, team] = await Promise.all([
      Reminder.find({ eventId: id }).sort({ sendAt: 1 }).lean(),
      User.find({ _id: { $in: (item as any).assignedTeam || [] } }).select("name email role title").lean(),
    ]);
    return json({
      item: lean(item),
      reminders: lean(reminders),
      team: lean(team),
    });
  }

  if (resource === "projects") {
    const [tasks, events, client] = await Promise.all([
      Task.find({ projectId: id }).sort({ dueDate: 1 }).lean(),
      CalendarEvent.find({ projectId: id }).sort({ start: 1 }).lean(),
      (item as any).clientId ? Client.findById((item as any).clientId).lean() : null,
    ]);
    return json({
      item: lean(item),
      tasks: lean(tasks),
      events: lean(events),
      client: client ? lean(client) : null,
    });
  }

  return json({ item: lean(item) });
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ resource: string; id: string }> },
) {
  const { session, response } = await requireUser();
  if (!session) return response;
  const { resource, id } = await ctx.params;
  const body = await request.json().catch(() => ({}));

  // Local store path
  if (!isMongoConnected()) {
    const existing = localStore.findById(resource as any, id);
    if (!existing) return errorJson("Item not found", 404);

    // Lead conversion
    if (resource === "leads" && body.stage === "won") {
      let client = existing.convertedClientId ? localStore.findById("clients", existing.convertedClientId) : null;
      if (!client) {
        client = localStore.create("clients", {
          name: existing.company || existing.name,
          contactPerson: existing.name,
          email: existing.email,
          phone: existing.phone,
          business: existing.service,
          notes: `Converted from lead (${existing.service || "General"}). Budget: ${existing.budget || "N/A"}`,
        });
        body.convertedClientId = client._id;
      }
    }

    // Invoice updates / payments
    if (resource === "invoices") {
      if (body.action === "payment" && body.amount) {
        const amount = Number(body.amount);
        const paid = (existing.amountPaid || 0) + amount;
        const balance = Math.max(0, (existing.total || 0) - paid);
        body.amountPaid = paid;
        body.balance = balance;
        body.status = balance === 0 ? "paid" : "partial";
      } else if (body.items) {
        const items = body.items;
        const subtotal = items.reduce((s: number, i: any) => s + (Number(i.quantity || 1) * Number(i.unitPrice || 0)), 0);
        const taxRate = Number(body.taxRate !== undefined ? body.taxRate : existing.taxRate || 18);
        const tax = (subtotal * taxRate) / 100;
        const total = subtotal + tax;
        const balance = Math.max(0, total - (existing.amountPaid || 0));
        body.subtotal = subtotal;
        body.tax = tax;
        body.total = total;
        body.balance = balance;
      }
    }

    delete body.action;
    delete body._id;
    delete body.createdAt;
    delete body.updatedAt;

    const updated = localStore.findByIdAndUpdate(resource as any, id, body);
    localStore.logActivity(`update:${resource}`, resource, id, {}, session.name);
    return json({ item: updated });
  }

  // MongoDB path
  const model = collections[resource];
  if (!model) return errorJson("Unknown resource", 404);
  if (!mongoose.Types.ObjectId.isValid(id)) return errorJson("Invalid ID format", 400);

  const existing = await model.findById(id);
  if (!existing) return errorJson("Item not found", 404);

  if (resource === "events") {
    const start = body.start ? new Date(body.start) : existing.start;
    const end = body.end ? new Date(body.end) : existing.end;
    const assignedTeam = body.assignedTeam !== undefined ? body.assignedTeam : existing.assignedTeam;

    if (
      body.status !== "cancelled" &&
      (body.start || body.end || body.assignedTeam)
    ) {
      const existingDocs = await CalendarEvent.find({
        _id: { $ne: id },
        status: { $ne: "cancelled" },
        assignedTeam: { $in: (assignedTeam || []).filter(Boolean) },
        start: { $lt: end },
        end: { $gt: start },
      });

      const existingAssignments: TeamAssignment[] = existingDocs.flatMap((ev) =>
        (ev.assignedTeam || []).map((userId: any) => ({
          userId: String(userId),
          eventId: String(ev._id),
          title: ev.title,
          start: ev.start,
          end: ev.end,
        })),
      );

      const check = findTeamConflicts({
        assignedUserIds: assignedTeam,
        start,
        end,
        existing: existingAssignments,
      });

      if (!check.valid && check.conflicts.length) {
        if (!body.overrideConflict || !canOverrideConflicts(session.role)) {
          return errorJson("CONFLICT DETECTED", 409, {
            conflicts: check.conflicts,
            message:
              "This person is already booked in the selected window. An owner or admin must explicitly override the conflict.",
          });
        }
        body.conflictOverride = true;
        body.conflictOverrideBy = session.id;
      }
    }

    if (body.start || body.reminderOffsets || body.assignedTeam || body.status) {
      await syncEventReminders({
        eventId: id,
        start,
        assignedTeam: assignedTeam || [],
        offsets: body.reminderOffsets,
        cancelOnly: body.status === "cancelled",
      });
    }
  }

  if (resource === "leads") {
    if (body.stage === "won" && !existing.convertedClientId) {
      const client = await Client.create({
        name: existing.company || existing.name,
        contactPerson: existing.name,
        email: existing.email,
        phone: existing.phone,
        business: existing.service,
        notes: `Converted from lead (${existing.service || "General"}). Budget: ${existing.budget || "N/A"}. Timeline: ${existing.timeline || "N/A"}`,
        createdBy: session.id,
      });

      body.convertedClientId = client._id;

      await logActivity(session, "convert:lead", "leads", id, {
        clientId: client._id,
        clientName: client.name,
      });

      return json({ item: lean(existing), convertedClient: lean(client) });
    }
  }

  if (resource === "invoices") {
    if (body.action === "payment" && body.amount) {
      const amount = Number(body.amount);
      await Payment.create({
        invoiceId: existing._id,
        amount,
        method: body.method || "bank_transfer",
        notes: body.notes || "",
        paidAt: body.paidAt ? new Date(body.paidAt) : new Date(),
      });

      existing.paid = (existing.paid || 0) + amount;
      existing.balance = Math.max(0, (existing.total || 0) - existing.paid);
      existing.status = deriveInvoiceStatus({
        current: existing.status,
        total: existing.total || 0,
        paid: existing.paid,
        dueDate: existing.dueDate,
      });
      await existing.save();

      await logActivity(session, "payment:invoice", "invoices", id, {
        amount,
        newBalance: existing.balance,
        status: existing.status,
      });

      return json({ item: lean(existing) });
    }

    if (body.items || body.taxRate !== undefined || body.discount !== undefined) {
      const items = body.items || existing.items;
      const taxRate = body.taxRate !== undefined ? body.taxRate : existing.taxRate;
      const discount = body.discount !== undefined ? body.discount : existing.discount;
      const totals = invoiceTotals({
        items,
        taxRate,
        discount,
        paid: existing.paid,
      });
      Object.assign(existing, totals);
      existing.items = items;
      existing.taxRate = taxRate;
      existing.discount = discount;
      existing.status = deriveInvoiceStatus({
        current: body.status || existing.status,
        total: totals.total,
        paid: existing.paid,
        dueDate: body.dueDate ? new Date(body.dueDate) : existing.dueDate,
      });
    }
  }

  delete body.action;
  delete body._id;
  delete body.createdAt;
  delete body.updatedAt;

  Object.assign(existing, body);
  await existing.save();

  await logActivity(session, `update:${resource}`, resource, id);
  return json({ item: lean(existing) });
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ resource: string; id: string }> },
) {
  const { session, response } = await requireUser();
  if (!session) return response;
  if (!canWrite(session.role)) return errorJson("Forbidden", 403);

  const { resource, id } = await ctx.params;

  // Local store path
  if (!isMongoConnected()) {
    const ok = localStore.findByIdAndDelete(resource as any, id);
    if (!ok) return errorJson("Item not found", 404);
    localStore.logActivity(`delete:${resource}`, resource, id, {}, session.name);
    return json({ success: true, id });
  }

  // MongoDB path
  const model = collections[resource];
  if (!model) return errorJson("Unknown resource", 404);
  if (!mongoose.Types.ObjectId.isValid(id)) return errorJson("Invalid ID format", 400);

  if (resource === "events") {
    await syncEventReminders({
      eventId: id,
      start: new Date(),
      assignedTeam: [],
      cancelOnly: true,
    });
  }

  const deleted = await model.findByIdAndDelete(id);
  if (!deleted) return errorJson("Item not found", 404);

  await logActivity(session, `delete:${resource}`, resource, id);
  return json({ success: true, id });
}

export const runtime = "nodejs";
