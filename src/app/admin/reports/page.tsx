"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Receipt,
  Users,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  PieChart,
} from "lucide-react";
import { formatMoney } from "@/lib/utils";

export default function ReportsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [analyticsRes, invoicesRes, eventsRes, leadsRes, projectsRes] =
        await Promise.all([
          fetch("/api/admin/analytics").then((r) => r.json()).catch(() => ({})),
          fetch("/api/admin/invoices").then((r) => r.json()).catch(() => ({ items: [] })),
          fetch("/api/admin/events").then((r) => r.json()).catch(() => ({ items: [] })),
          fetch("/api/admin/leads").then((r) => r.json()).catch(() => ({ items: [] })),
          fetch("/api/admin/projects").then((r) => r.json()).catch(() => ({ items: [] })),
        ]);

      const invoices = invoicesRes.items || [];
      const events = eventsRes.items || [];
      const leads = leadsRes.items || [];
      const projects = projectsRes.items || [];

      const totalInvoiced = invoices.reduce((s: number, i: any) => s + (i.total || 0), 0);
      const totalCollected = invoices.reduce((s: number, i: any) => s + (i.amountPaid || 0), 0);
      const outstanding = invoices.reduce((s: number, i: any) => s + (i.balance ?? i.total ?? 0), 0);

      const completedShoots = events.filter((e: any) => e.type === "shoot" && e.status === "completed").length;
      const scheduledShoots = events.filter((e: any) => e.type === "shoot" && e.status === "scheduled").length;

      const wonLeads = leads.filter((l: any) => l.stage === "won").length;
      const conversionRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0;

      // Group projects by service
      const serviceCounts: Record<string, number> = {};
      projects.forEach((p: any) => {
        const srv = p.service || "other";
        serviceCounts[srv] = (serviceCounts[srv] || 0) + 1;
      });

      setData({
        totalInvoiced,
        totalCollected,
        outstanding,
        completedShoots,
        scheduledShoots,
        totalProjects: projects.length,
        totalLeads: leads.length,
        wonLeads,
        conversionRate,
        serviceCounts,
      });
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Aggregating studio intelligence & financial reports...
        </p>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning className="space-y-8">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e8e8e3] pb-5 sm:flex-row sm:items-center">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-orange">
            Executive Analytics · Live Studio Intelligence
          </span>
          <h1 className="display text-3xl font-extrabold text-ink">
            Reports & Analytics
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Real-time financial performance, production volume, and lead conversion rates.
          </p>
        </div>
      </div>

      {/* 2. REVENUE INTELLIGENCE */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-orange" />
          <span>Financial Revenue Performance (Real Database)</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#e8e8e3] bg-white p-6 shadow-xs">
            <span className="font-mono text-[10px] font-bold uppercase text-muted">
              Total Invoiced Billing
            </span>
            <p className="display mt-2 text-3xl font-extrabold text-ink">
              {formatMoney(data?.totalInvoiced ?? 0)}
            </p>
            <p className="mt-1 text-xs text-muted">Contracted studio revenue</p>
          </div>

          <div className="rounded-3xl border border-[#e8e8e3] bg-white p-6 shadow-xs">
            <span className="font-mono text-[10px] font-bold uppercase text-muted">
              Total Realized Collections
            </span>
            <p className="display mt-2 text-3xl font-extrabold text-emerald-600">
              {formatMoney(data?.totalCollected ?? 0)}
            </p>
            <p className="mt-1 text-xs text-muted">Settled into bank/UPI accounts</p>
          </div>

          <div className="rounded-3xl border border-[#e8e8e3] bg-white p-6 shadow-xs">
            <span className="font-mono text-[10px] font-bold uppercase text-muted">
              Current Outstanding Balance
            </span>
            <p className="display mt-2 text-3xl font-extrabold text-ink">
              {formatMoney(data?.outstanding ?? 0)}
            </p>
            <p className="mt-1 text-xs text-muted">Uncollected receivables</p>
          </div>
        </div>
      </div>

      {/* 3. PRODUCTION & PIPELINE INTELLIGENCE */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Production Metrics */}
        <div className="rounded-3xl border border-[#e8e8e3] bg-white p-6 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-ink border-b border-[#e8e8e3] pb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange" />
            <span>Cinematography & Shoots Delivery</span>
          </h3>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#e8e8e3] bg-[#fafaf8] p-4 text-center">
              <span className="text-xs font-semibold text-muted">Shoots Completed</span>
              <p className="display mt-2 text-3xl font-extrabold text-ink">
                {data?.completedShoots ?? 0}
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8e8e3] bg-[#fafaf8] p-4 text-center">
              <span className="text-xs font-semibold text-muted">Shoots Scheduled</span>
              <p className="display mt-2 text-3xl font-extrabold text-orange">
                {data?.scheduledShoots ?? 0}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <span className="font-mono text-[10px] uppercase font-bold text-muted">
              Active Productions by Service Discipline:
            </span>
            <div className="space-y-1.5 pt-1 text-xs">
              {Object.keys(data?.serviceCounts || {}).length > 0 ? (
                Object.entries(data?.serviceCounts || {}).map(([srv, count]) => (
                  <div key={srv} className="flex justify-between items-center py-1">
                    <span className="capitalize font-semibold text-ink">{srv}</span>
                    <span className="font-mono font-bold text-orange">{count as number} Projects</span>
                  </div>
                ))
              ) : (
                <p className="text-muted text-xs">No active service breakdowns recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* CRM Pipeline Conversion */}
        <div className="rounded-3xl border border-[#e8e8e3] bg-white p-6 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-ink border-b border-[#e8e8e3] pb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-orange" />
            <span>Sales Pipeline & Lead Conversion</span>
          </h3>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-[#e8e8e3] bg-[#fafaf8] p-3">
              <span className="text-[11px] font-semibold text-muted">Total Leads</span>
              <p className="display mt-1 text-2xl font-extrabold text-ink">
                {data?.totalLeads ?? 0}
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8e8e3] bg-[#fafaf8] p-3">
              <span className="text-[11px] font-semibold text-muted">Won Deals</span>
              <p className="display mt-1 text-2xl font-extrabold text-emerald-600">
                {data?.wonLeads ?? 0}
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8e8e3] bg-[#fafaf8] p-3">
              <span className="text-[11px] font-semibold text-muted">Win Rate</span>
              <p className="display mt-1 text-2xl font-extrabold text-orange">
                {data?.conversionRate ?? 0}%
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-orange/20 bg-orange/[0.03] p-4 text-xs">
            <p className="font-bold text-ink">Agency Studio Metric Summary:</p>
            <p className="mt-1 text-muted leading-relaxed">
              Every data point on this dashboard is computed directly from live MongoDB records without simulated numbers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
