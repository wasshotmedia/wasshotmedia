"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  Calendar,
  CheckSquare,
  Target,
  Receipt,
  Clock,
  MapPin,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";
import { formatMoney } from "@/lib/utils";

interface DashboardData {
  user: { name: string; role: string };
  metrics: {
    leads: number;
    clients: number;
    projects: number;
    shoots: number;
    tasksToday: number;
    tasksOverdue: number;
    pendingInvoices: number;
    outstandingAmount: number;
  };
  todayEvents: any[];
  upcomingShoots: any[];
  leadsAttention: any[];
  tasks: any[];
  activityLogs: any[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const singleRes = await fetch("/api/admin/dashboard-overview");
      if (singleRes.ok) {
        const payload = await singleRes.json();
        if (payload?.metrics) {
          setData(payload);
          setLoading(false);
          return;
        }
      }
    } catch {
      // fallback to multi-fetch
    }

    try {
      const [
        meRes,
        analyticsRes,
        eventsRes,
        leadsRes,
        tasksRes,
        invoicesRes,
        activityRes,
      ] = await Promise.all([
        fetch("/api/auth/me").then((r) => r.json()).catch(() => ({})),
        fetch("/api/admin/analytics").then((r) => r.json()).catch(() => ({})),
        fetch("/api/admin/events").then((r) => r.json()).catch(() => ({ items: [] })),
        fetch("/api/admin/leads").then((r) => r.json()).catch(() => ({ items: [] })),
        fetch("/api/admin/tasks").then((r) => r.json()).catch(() => ({ items: [] })),
        fetch("/api/admin/invoices").then((r) => r.json()).catch(() => ({ items: [] })),
        fetch("/api/admin/activity").then((r) => r.json()).catch(() => ({ items: [] })),
      ]);

      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];

      const allEvents = eventsRes.items || [];
      const todayEvents = allEvents.filter((ev: any) =>
        ev.start && ev.start.startsWith(todayStr),
      );
      const upcomingShoots = allEvents.filter(
        (ev: any) =>
          ev.type === "shoot" &&
          ev.status !== "cancelled" &&
          new Date(ev.start) >= now,
      );

      const allLeads = leadsRes.items || [];
      const leadsAttention = allLeads.filter(
        (l: any) =>
          l.stage === "new" ||
          l.stage === "proposal_sent" ||
          (l.followUpAt && new Date(l.followUpAt) <= now),
      );

      const allTasks = tasksRes.items || [];
      const tasksToday = allTasks.filter(
        (t: any) =>
          t.status !== "done" &&
          t.dueDate &&
          t.dueDate.startsWith(todayStr),
      );
      const tasksOverdue = allTasks.filter(
        (t: any) =>
          t.status !== "done" &&
          t.dueDate &&
          new Date(t.dueDate) < now &&
          !t.dueDate.startsWith(todayStr),
      );

      const allInvoices = invoicesRes.items || [];
      const pendingInvoices = allInvoices.filter(
        (inv: any) => inv.status !== "paid" && inv.status !== "cancelled",
      );
      const outstandingAmount = pendingInvoices.reduce(
        (sum: number, inv: any) => sum + (inv.balance ?? inv.total ?? 0),
        0,
      );

      setData({
        user: meRes.user || { name: "Praneeth", role: "owner" },
        metrics: {
          leads: analyticsRes.leads ?? allLeads.length,
          clients: analyticsRes.clients ?? 0,
          projects: analyticsRes.projects ?? 0,
          shoots: upcomingShoots.length,
          tasksToday: tasksToday.length,
          tasksOverdue: tasksOverdue.length,
          pendingInvoices: pendingInvoices.length,
          outstandingAmount,
        },
        todayEvents,
        upcomingShoots: upcomingShoots.slice(0, 5),
        leadsAttention: leadsAttention.slice(0, 5),
        tasks: allTasks.filter((t: any) => t.status !== "done").slice(0, 6),
        activityLogs: (activityRes.items || []).slice(0, 8),
      });
    } catch (err) {
      console.error("Failed to load dashboard overview", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Loading Studio Dashboard...
        </p>
      </div>
    );
  }

  const userFirstName = data?.user?.name ? data.user.name.split(" ")[0] : "Praneeth";
  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div suppressHydrationWarning className="space-y-8">
      {/* 1. TOP HEADER & OPERATIONAL ACTIONS */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e8e8e3] pb-6 sm:flex-row sm:items-end">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-orange font-bold">
            Studio Overview · Vijayawada HQ
          </span>
          <h1 className="display mt-1 text-3xl font-extrabold text-ink md:text-4xl">
            Good morning, {userFirstName}
          </h1>
          <p className="mt-1 text-xs text-muted font-medium">
            {currentDateFormatted}
          </p>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/calendar"
            className="inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#e03d07]"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>+ Schedule Shoot</span>
          </Link>
          <Link
            href="/admin/clients"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e8e3] bg-white px-3.5 py-2 text-xs font-semibold text-ink transition hover:bg-black/[0.04]"
          >
            <Users className="h-3.5 w-3.5" />
            <span>+ New Client</span>
          </Link>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e8e3] bg-white px-3.5 py-2 text-xs font-semibold text-ink transition hover:bg-black/[0.04]"
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>+ New Project</span>
          </Link>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e8e3] bg-white px-3.5 py-2 text-xs font-semibold text-ink transition hover:bg-black/[0.04]"
          >
            <Target className="h-3.5 w-3.5" />
            <span>+ New Lead</span>
          </Link>
          <Link
            href="/admin/invoices"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e8e3] bg-white px-3.5 py-2 text-xs font-semibold text-ink transition hover:bg-black/[0.04]"
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>+ New Invoice</span>
          </Link>
        </div>
      </div>

      {/* 2. REAL OPERATIONAL METRICS (Zero Fake Data) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        <Link
          href="/admin/leads"
          className="group rounded-2xl border border-[#e8e8e3] bg-white p-4 shadow-xs transition hover:border-orange hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-muted group-hover:text-orange">
            <span className="text-[10px] font-bold uppercase tracking-wider">New Leads</span>
            <Target className="h-3.5 w-3.5" />
          </div>
          <p className="display mt-2 text-2xl font-extrabold text-ink">
            {data?.metrics.leads ?? 0}
          </p>
          <span className="mt-1 text-[10px] text-muted">Pipeline leads</span>
        </Link>

        <Link
          href="/admin/clients"
          className="group rounded-2xl border border-[#e8e8e3] bg-white p-4 shadow-xs transition hover:border-orange hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-muted group-hover:text-orange">
            <span className="text-[10px] font-bold uppercase tracking-wider">Clients</span>
            <Users className="h-3.5 w-3.5" />
          </div>
          <p className="display mt-2 text-2xl font-extrabold text-ink">
            {data?.metrics.clients ?? 0}
          </p>
          <span className="mt-1 text-[10px] text-muted">Active accounts</span>
        </Link>

        <Link
          href="/admin/projects"
          className="group rounded-2xl border border-[#e8e8e3] bg-white p-4 shadow-xs transition hover:border-orange hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-muted group-hover:text-orange">
            <span className="text-[10px] font-bold uppercase tracking-wider">Projects</span>
            <Briefcase className="h-3.5 w-3.5" />
          </div>
          <p className="display mt-2 text-2xl font-extrabold text-ink">
            {data?.metrics.projects ?? 0}
          </p>
          <span className="mt-1 text-[10px] text-muted">In production</span>
        </Link>

        <Link
          href="/admin/calendar"
          className="group rounded-2xl border border-[#e8e8e3] bg-white p-4 shadow-xs transition hover:border-orange hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-muted group-hover:text-orange">
            <span className="text-[10px] font-bold uppercase tracking-wider">Shoots</span>
            <Calendar className="h-3.5 w-3.5" />
          </div>
          <p className="display mt-2 text-2xl font-extrabold text-ink">
            {data?.metrics.shoots ?? 0}
          </p>
          <span className="mt-1 text-[10px] text-muted">Upcoming confirmed</span>
        </Link>

        <Link
          href="/admin/tasks"
          className="group rounded-2xl border border-[#e8e8e3] bg-white p-4 shadow-xs transition hover:border-orange hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-muted group-hover:text-orange">
            <span className="text-[10px] font-bold uppercase tracking-wider">Due Today</span>
            <Clock className="h-3.5 w-3.5" />
          </div>
          <p className="display mt-2 text-2xl font-extrabold text-ink">
            {data?.metrics.tasksToday ?? 0}
          </p>
          <span className="mt-1 text-[10px] text-muted">Tasks today</span>
        </Link>

        <Link
          href="/admin/tasks"
          className="group rounded-2xl border border-[#e8e8e3] bg-white p-4 shadow-xs transition hover:border-orange hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-muted group-hover:text-orange">
            <span className="text-[10px] font-bold uppercase tracking-wider">Overdue</span>
            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
          </div>
          <p className="display mt-2 text-2xl font-extrabold text-red-600">
            {data?.metrics.tasksOverdue ?? 0}
          </p>
          <span className="mt-1 text-[10px] text-muted">Action needed</span>
        </Link>

        <Link
          href="/admin/invoices"
          className="group rounded-2xl border border-[#e8e8e3] bg-white p-4 shadow-xs transition hover:border-orange hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-muted group-hover:text-orange">
            <span className="text-[10px] font-bold uppercase tracking-wider">Invoices</span>
            <Receipt className="h-3.5 w-3.5" />
          </div>
          <p className="display mt-2 text-2xl font-extrabold text-ink">
            {data?.metrics.pendingInvoices ?? 0}
          </p>
          <span className="mt-1 text-[10px] text-muted">Pending payment</span>
        </Link>

        <Link
          href="/admin/invoices"
          className="group rounded-2xl border border-[#e8e8e3] bg-white p-4 shadow-xs transition hover:border-orange hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-muted group-hover:text-orange">
            <span className="text-[10px] font-bold uppercase tracking-wider">Balance</span>
            <TrendingUp className="h-3.5 w-3.5 text-orange" />
          </div>
          <p className="display mt-2 text-lg font-extrabold text-ink truncate">
            {data?.metrics.outstandingAmount ? formatMoney(data.metrics.outstandingAmount) : "₹0"}
          </p>
          <span className="mt-1 text-[10px] text-muted">Receivable</span>
        </Link>
      </div>

      {/* 3. TODAY'S OPERATIONAL SCHEDULE & LEADS REQUIRING ATTENTION */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Today's Schedule (7 cols) */}
        <div className="rounded-3xl border border-[#e8e8e3] bg-white p-6 shadow-xs lg:col-span-7">
          <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-orange" />
              <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
                Today&apos;s Schedule
              </h2>
            </div>
            <Link
              href="/admin/calendar"
              className="text-xs font-semibold text-orange hover:underline inline-flex items-center gap-1"
            >
              Open Calendar <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-4">
            {data?.todayEvents && data.todayEvents.length > 0 ? (
              <div className="divide-y divide-[#f0f0eb]">
                {data.todayEvents.map((ev: any) => (
                  <div
                    key={ev._id}
                    className="flex flex-col justify-between gap-3 py-3.5 sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-orange/10 px-2 py-0.5 font-mono text-[10px] font-bold text-orange">
                          {new Date(ev.start).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <p className="text-sm font-bold text-ink">{ev.title}</p>
                        <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] font-medium text-muted uppercase">
                          {ev.type}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                        {ev.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {ev.location}
                          </span>
                        )}
                        <span>· {ev.status}</span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/calendar?event=${ev._id}`}
                      className="rounded-full border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-1 text-xs font-semibold text-ink hover:border-black/30"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Calendar className="mx-auto h-8 w-8 text-muted/30" />
                <p className="mt-2 text-xs font-bold text-ink">No shoots or events today</p>
                <p className="mt-0.5 text-xs text-muted">
                  Use the Schedule Shoot button above to book upcoming productions.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Leads Requiring Attention (5 cols) */}
        <div className="rounded-3xl border border-[#e8e8e3] bg-white p-6 shadow-xs lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange" />
              <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
                Leads Requiring Attention
              </h2>
            </div>
            <Link
              href="/admin/leads"
              className="text-xs font-semibold text-orange hover:underline inline-flex items-center gap-1"
            >
              CRM Pipeline <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-4">
            {data?.leadsAttention && data.leadsAttention.length > 0 ? (
              <div className="divide-y divide-[#f0f0eb]">
                {data.leadsAttention.map((lead: any) => (
                  <div key={lead._id} className="py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-ink">{lead.name}</p>
                      <span className="rounded-full bg-orange/10 px-2 py-0.5 text-[10px] font-bold text-orange uppercase">
                        {lead.stage.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted line-clamp-1">
                      {lead.message || lead.company || "New enquiry received"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500/40" />
                <p className="mt-2 text-xs font-bold text-ink">All leads up to date</p>
                <p className="mt-0.5 text-xs text-muted">
                  No pending proposals or overdue follow-ups.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. UPCOMING SHOOTS & TASK OVERVIEW */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Upcoming Shoots Table (7 cols) */}
        <div className="rounded-3xl border border-[#e8e8e3] bg-white p-6 shadow-xs lg:col-span-7">
          <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-4">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              Confirmed Upcoming Shoots
            </h2>
            <Link
              href="/admin/calendar"
              className="text-xs font-semibold text-orange hover:underline"
            >
              View Calendar →
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            {data?.upcomingShoots && data.upcomingShoots.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#f0f0eb] font-mono text-[10px] uppercase text-muted">
                    <th className="py-2">Date & Time</th>
                    <th className="py-2">Shoot Title</th>
                    <th className="py-2">Location</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0eb]">
                  {data.upcomingShoots.map((shoot: any) => (
                    <tr key={shoot._id} className="hover:bg-[#fbfbfa]">
                      <td className="py-3 font-medium text-ink">
                        {new Date(shoot.start).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        ·{" "}
                        {new Date(shoot.start).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 font-bold text-ink">{shoot.title}</td>
                      <td className="py-3 text-muted">{shoot.location || "Vijayawada"}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 border border-emerald-200 text-[10px]">
                          Confirmed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-xs text-muted">
                No upcoming confirmed shoots scheduled yet.
              </div>
            )}
          </div>
        </div>

        {/* Priority Tasks (5 cols) */}
        <div className="rounded-3xl border border-[#e8e8e3] bg-white p-6 shadow-xs lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-4">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              Priority Tasks
            </h2>
            <Link
              href="/admin/tasks"
              className="text-xs font-semibold text-orange hover:underline"
            >
              Task Board →
            </Link>
          </div>

          <div className="mt-4">
            {data?.tasks && data.tasks.length > 0 ? (
              <div className="divide-y divide-[#f0f0eb]">
                {data.tasks.map((task: any) => (
                  <div key={task._id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-orange" />
                      <p className="text-xs font-medium text-ink">{task.title}</p>
                    </div>
                    <span className="rounded-md bg-black/[0.04] px-2 py-0.5 text-[10px] uppercase font-bold text-muted">
                      {task.priority || "medium"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted">
                No open tasks. All deliverables on track!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. RECENT ACTIVITY TIMELINE */}
      <div className="rounded-3xl border border-[#e8e8e3] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange" />
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              Recent Studio Activity Log
            </h2>
          </div>
          <span className="font-mono text-[10px] text-muted uppercase">
            Audit Trail
          </span>
        </div>

        <div className="mt-4">
          {data?.activityLogs && data.activityLogs.length > 0 ? (
            <div className="space-y-3">
              {data.activityLogs.map((log: any) => (
                <div key={log._id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange" />
                    <span className="font-semibold text-ink">{log.action}</span>
                    {log.entityType && (
                      <span className="rounded bg-black/[0.04] px-1.5 py-0.5 text-[10px] text-muted">
                        {log.entityType}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-muted">
                    {new Date(log.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-muted">
              Activity log initialized. Real studio operations will record here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
