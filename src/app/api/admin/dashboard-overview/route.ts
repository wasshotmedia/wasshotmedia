import { requireUser } from "@/lib/admin-guard";
import { json } from "@/lib/utils";
import { isMongoConnected } from "@/lib/db";
import { localStore } from "@/lib/local-store";

export async function GET() {
  const { session, response } = await requireUser();
  if (!session) return response;

  if (!isMongoConnected()) {
    const overview = localStore.getDashboardOverview(session);
    return json(overview);
  }

  try {
    const {
      Client,
      Lead,
      Project,
      Task,
      CalendarEvent,
      Invoice,
      ActivityLog,
    } = await import("@/models");

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const [
      leadsCount,
      clientsCount,
      projectsCount,
      allEvents,
      allLeads,
      allTasks,
      allInvoices,
      activityLogs,
    ] = await Promise.all([
      Lead.countDocuments(),
      Client.countDocuments(),
      Project.countDocuments(),
      CalendarEvent.find({ status: { $ne: "cancelled" } })
        .sort({ start: 1 })
        .limit(50)
        .lean(),
      Lead.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Task.find({ status: { $ne: "done" } })
        .sort({ dueDate: 1 })
        .limit(50)
        .lean(),
      Invoice.find({ status: { $nin: ["paid", "cancelled"] } })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      ActivityLog.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
    ]);

    const todayEvents = allEvents.filter(
      (ev: any) => ev.start && String(ev.start).startsWith(todayStr)
    );
    const upcomingShoots = allEvents.filter(
      (ev: any) =>
        ev.type === "shoot" &&
        ev.status !== "cancelled" &&
        new Date(ev.start) >= now
    );

    const leadsAttention = allLeads.filter(
      (l: any) =>
        l.stage === "new" ||
        l.stage === "proposal_sent" ||
        (l.followUpAt && new Date(l.followUpAt) <= now)
    );

    const tasksToday = allTasks.filter(
      (t: any) => t.dueDate && String(t.dueDate).startsWith(todayStr)
    );
    const tasksOverdue = allTasks.filter(
      (t: any) =>
        t.dueDate &&
        new Date(t.dueDate) < now &&
        !String(t.dueDate).startsWith(todayStr)
    );

    const outstandingAmount = allInvoices.reduce(
      (sum: number, inv: any) => sum + (inv.balance ?? inv.total ?? 0),
      0
    );

    return json({
      user: session,
      metrics: {
        leads: leadsCount,
        clients: clientsCount,
        projects: projectsCount,
        shoots: upcomingShoots.length,
        tasksToday: tasksToday.length,
        tasksOverdue: tasksOverdue.length,
        pendingInvoices: allInvoices.length,
        outstandingAmount,
      },
      todayEvents,
      upcomingShoots: upcomingShoots.slice(0, 5),
      leadsAttention: leadsAttention.slice(0, 5),
      tasks: allTasks.slice(0, 8),
      activityLogs,
    });
  } catch (err) {
    console.warn("[DashboardOverview] Mongo query failed, using local store:", err);
    return json(localStore.getDashboardOverview(session));
  }
}

export const runtime = "nodejs";
