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

const DEFAULT_DASHBOARD_DATA: DashboardData = {
  user: { name: "Praneeth Badugu", role: "owner" },
  metrics: {
    leads: 0,
    clients: 0,
    projects: 0,
    shoots: 0,
    tasksToday: 0,
    tasksOverdue: 0,
    pendingInvoices: 0,
    outstandingAmount: 0,
  },
  todayEvents: [],
  upcomingShoots: [],
  leadsAttention: [],
  tasks: [],
  activityLogs: [],
};

function safeTime(val?: any): string {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function safeDateTime(val?: any): { date: string; time: string } {
  if (!val) return { date: "", time: "" };
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return { date: "", time: "" };
    return {
      date: d.toLocaleDateString([], { month: "short", day: "numeric" }),
      time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  } catch {
    return { date: "", time: "" };
  }
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>(DEFAULT_DASHBOARD_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const singleRes = await fetch("/api/admin/dashboard-overview");
      if (singleRes.ok) {
        const payload = await singleRes.json();
        if (payload && payload.metrics) {
          setData({
            user: payload.user || DEFAULT_DASHBOARD_DATA.user,
            metrics: { ...DEFAULT_DASHBOARD_DATA.metrics, ...payload.metrics },
            todayEvents: Array.isArray(payload.todayEvents) ? payload.todayEvents : [],
            upcomingShoots: Array.isArray(payload.upcomingShoots) ? payload.upcomingShoots : [],
            leadsAttention: Array.isArray(payload.leadsAttention) ? payload.leadsAttention : [],
            tasks: Array.isArray(payload.tasks) ? payload.tasks : [],
            activityLogs: Array.isArray(payload.activityLogs) ? payload.activityLogs : [],
          });
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

      const allEvents = Array.isArray(eventsRes?.items) ? eventsRes.items : [];
      const todayEvents = allEvents.filter((ev: any) =>
        ev && ev.start && String(ev.start).startsWith(todayStr)
      );
      const upcomingShoots = allEvents.filter(
        (ev: any) =>
          ev &&
          ev.type === "shoot" &&
          ev.status !== "cancelled" &&
          ev.start &&
          new Date(ev.start).getTime() >= now.getTime()
      );

      const allLeads = Array.isArray(leadsRes?.items) ? leadsRes.items : [];
      const leadsAttention = allLeads.filter(
        (l: any) =>
          l &&
          (l.stage === "new" ||
            l.stage === "proposal_sent" ||
            (l.followUpAt && new Date(l.followUpAt).getTime() <= now.getTime()))
      );

      const allTasks = Array.isArray(tasksRes?.items) ? tasksRes.items : [];
      const tasksToday = allTasks.filter(
        (t: any) =>
          t &&
          t.status !== "done" &&
          t.dueDate &&
          String(t.dueDate).startsWith(todayStr)
      );
      const tasksOverdue = allTasks.filter(
        (t: any) =>
          t &&
          t.status !== "done" &&
          t.dueDate &&
          new Date(t.dueDate).getTime() < now.getTime() &&
          !String(t.dueDate).startsWith(todayStr)
      );

      const allInvoices = Array.isArray(invoicesRes?.items) ? invoicesRes.items : [];
      const pendingInvoices = allInvoices.filter(
        (inv: any) => inv && inv.status !== "paid" && inv.status !== "cancelled"
      );
      const outstandingAmount = pendingInvoices.reduce(
        (sum: number, inv: any) => sum + (Number(inv.balance ?? inv.total) || 0),
        0
      );

      setData({
        user: meRes?.user || DEFAULT_DASHBOARD_DATA.user,
        metrics: {
          leads: Number(analyticsRes?.leads ?? allLeads.length) || 0,
          clients: Number(analyticsRes?.clients) || 0,
          projects: Number(analyticsRes?.projects) || 0,
          shoots: upcomingShoots.length,
          tasksToday: tasksToday.length,
          tasksOverdue: tasksOverdue.length,
          pendingInvoices: pendingInvoices.length,
          outstandingAmount,
        },
        todayEvents,
        upcomingShoots: upcomingShoots.slice(0, 5),
        leadsAttention: leadsAttention.slice(0, 5),
        tasks: allTasks.filter((t: any) => t && t.status !== "done").slice(0, 6),
        activityLogs: Array.isArray(activityRes?.items) ? activityRes.items.slice(0, 8) : [],
      });
    } catch (err) {
      console.error("Failed to load dashboard overview", err);
      setData((prev) => prev || DEFAULT_DASHBOARD_DATA);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="font-display text-xs uppercase tracking-widest text-muted">
          Loading Studio Dashboard...
        </p>
      </div>
    );
  }

  const current = data || DEFAULT_DASHBOARD_DATA;
  const metrics = current.metrics || DEFAULT_DASHBOARD_DATA.metrics;
  const todayEvents = current.todayEvents || [];
  const upcomingShoots = current.upcomingShoots || [];
  const leadsAttention = current.leadsAttention || [];
  const tasks = current.tasks || [];
  const activityLogs = current.activityLogs || [];

  const userFirstName = current.user?.name ? current.user.name.split(" ")[0] : "Praneeth";
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
          <span className="font-display text-[10px] uppercase tracking-widest text-orange font-bold">
            Studio Overview · Vijayawada HQ
          </span>
          <h1 className="display mt-1 text-2xl sm:text-3xl font-extrabold text-ink md:text-4xl">
            Good morning, {userFirstName}
          </h1>
          <p className="mt-1 text-xs text-muted font-medium">
            {currentDateFormatted}
          </p>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap">
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

      {/* 2. REAL OPERATIONAL METRICS (Safe Defaults Guaranteed) */}
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
            {metrics.leads}
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
            {metrics.clients}
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
            {metrics.projects}
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
            {metrics.shoots}
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
            {metrics.tasksToday}
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
            {metrics.tasksOverdue}
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
            {metrics.pendingInvoices}
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
            {metrics.outstandingAmount ? formatMoney(metrics.outstandingAmount) : "₹0"}
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
            {todayEvents && todayEvents.length > 0 ? (
              <div className="divide-y divide-[#f0f0eb]">
                {todayEvents.map((ev: any) => (
                  <div
                    key={ev._id || ev.id}
                    className="flex flex-col justify-between gap-3 py-3.5 sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-orange/10 px-2 py-0.5 font-display text-[10px] font-bold text-orange">
                          {safeTime(ev.start)}
                        </span>
                        <p className="text-sm font-bold text-ink">{ev.title}</p>
                        <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] font-medium text-muted uppercase">
                          {ev.type || "event"}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                        {ev.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {ev.location}
                          </span>
                        )}
                        <span>· {ev.status || "confirmed"}</span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/calendar?event=${ev._id || ev.id}`}
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
            {leadsAttention && leadsAttention.length > 0 ? (
              <div className="divide-y divide-[#f0f0eb]">
                {leadsAttention.map((lead: any) => (
                  <div key={lead._id || lead.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-ink">{lead.name}</p>
                      <span className="rounded-full bg-orange/10 px-2 py-0.5 text-[10px] font-bold text-orange uppercase">
                        {(lead.stage || "new").replace("_", " ")}
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
            {upcomingShoots && upcomingShoots.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#f0f0eb] font-display text-[10px] uppercase font-bold text-muted">
                    <th className="py-2">Date & Time</th>
                    <th className="py-2">Shoot Title</th>
                    <th className="py-2">Location</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0eb]">
                  {upcomingShoots.map((shoot: any) => {
                    const dt = safeDateTime(shoot.start);
                    return (
                      <tr key={shoot._id || shoot.id} className="hover:bg-[#fbfbfa]">
                        <td className="py-3 font-medium text-ink">
                          {dt.date} · {dt.time}
                        </td>
                        <td className="py-3 font-bold text-ink">{shoot.title}</td>
                        <td className="py-3 text-muted">{shoot.location || "Vijayawada"}</td>
                        <td className="py-3">
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 border border-emerald-200 text-[10px]">
                            {shoot.status || "Confirmed"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
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
            {tasks && tasks.length > 0 ? (
              <div className="divide-y divide-[#f0f0eb]">
                {tasks.map((task: any) => (
                  <div key={task._id || task.id} className="flex items-center justify-between py-2.5">
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
          <span className="font-display text-[10px] text-muted uppercase font-bold">
            Audit Trail
          </span>
        </div>

        <div className="mt-4">
          {activityLogs && activityLogs.length > 0 ? (
            <div className="space-y-3">
              {activityLogs.map((log: any) => (
                <div key={log._id || log.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange" />
                    <span className="font-semibold text-ink">{log.action}</span>
                    {log.entityType && (
                      <span className="rounded bg-black/[0.04] px-1.5 py-0.5 text-[10px] text-muted">
                        {log.entityType}
                      </span>
                    )}
                  </div>
                  <span className="font-display text-[10px] text-muted font-medium">
                    {safeTime(log.createdAt)}
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
