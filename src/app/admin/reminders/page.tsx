"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCw,
  Mail,
  MessageCircle,
  Calendar,
} from "lucide-react";

interface Reminder {
  _id: string;
  type: string;
  channel: "in_app" | "email" | "whatsapp";
  sendAt: string;
  status: "scheduled" | "sent" | "cancelled" | "failed";
  payload: {
    title: string;
    body?: string;
    eventTitle?: string;
    recipientName?: string;
  };
  sentAt?: string;
  error?: string;
  createdAt: string;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<any | null>(null);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reminders");
      if (res.ok) {
        const data = await res.json();
        setReminders(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load reminders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunProcessor = async () => {
    setProcessing(true);
    setProcessResult(null);
    try {
      const res = await fetch("/api/admin/process-reminders", { method: "POST" });
      const data = await res.json();
      setProcessResult(data);
      await loadReminders();
    } catch (err: any) {
      setProcessResult({ error: err.message || "Failed to process reminders" });
    } finally {
      setProcessing(false);
    }
  };

  const scheduledCount = reminders.filter((r) => r.status === "scheduled").length;
  const sentCount = reminders.filter((r) => r.status === "sent").length;
  const cancelledCount = reminders.filter((r) => r.status === "cancelled").length;

  return (
    <div suppressHydrationWarning className="space-y-6">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e8e8e3] pb-5 sm:flex-row sm:items-center">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-orange">
            Studio Automations · Persistent Queue
          </span>
          <h1 className="display text-3xl font-extrabold text-ink">
            Reminders & Queue ({reminders.length})
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Automated notifications scheduled 24 hours & 2 hours before every shoot for Praneeth and Wasim.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadReminders}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e8e3] bg-white px-3.5 py-2 text-xs font-semibold text-ink hover:bg-black/[0.04]"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleRunProcessor}
            disabled={processing}
            className="inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#e03d07] disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{processing ? "Processing..." : "Run Reminder Processor"}</span>
          </button>
        </div>
      </div>

      {processResult && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs text-emerald-800">
          <p className="font-bold">Reminder Processor Finished:</p>
          <p className="mt-0.5 font-mono">
            Processed: {processResult.processed ?? 0} · Sent: {processResult.sent ?? 0} · Failed: {processResult.failed ?? 0}
          </p>
        </div>
      )}

      {/* 2. STATS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#e8e8e3] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider">Scheduled in Queue</span>
            <Clock className="h-4 w-4 text-orange" />
          </div>
          <p className="display mt-2 text-2xl font-extrabold text-ink">
            {scheduledCount}
          </p>
          <span className="text-[10px] text-muted">Awaiting trigger time</span>
        </div>

        <div className="rounded-2xl border border-[#e8e8e3] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider">Dispatched / Sent</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="display mt-2 text-2xl font-extrabold text-emerald-600">
            {sentCount}
          </p>
          <span className="text-[10px] text-muted">Notifications delivered</span>
        </div>

        <div className="rounded-2xl border border-[#e8e8e3] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider">Cancelled / Synced</span>
            <AlertCircle className="h-4 w-4 text-muted" />
          </div>
          <p className="display mt-2 text-2xl font-extrabold text-ink">
            {cancelledCount}
          </p>
          <span className="text-[10px] text-muted">On shoot reschedule/cancellation</span>
        </div>
      </div>

      {/* 3. REMINDER QUEUE TABLE */}
      <div className="rounded-3xl border border-[#e8e8e3] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e8e8e3] bg-[#fafaf8] font-mono text-[10px] font-bold uppercase text-muted">
                <th className="px-5 py-3">Notification Title</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Scheduled Delivery Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0eb]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-muted">
                    Loading reminder queue...
                  </td>
                </tr>
              ) : reminders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-muted">
                    No reminder jobs currently in queue. Schedule a shoot to create automatic 24h & 2h reminders.
                  </td>
                </tr>
              ) : (
                reminders.map((r) => (
                  <tr key={r._id} className="hover:bg-[#fbfbfa]">
                    <td className="px-5 py-3.5 font-bold text-ink">
                      {r.payload?.title || "Shoot Reminder"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded bg-black/[0.04] px-2 py-0.5 font-mono text-[10px] uppercase font-bold text-ink">
                        {r.channel === "in_app" && <Bell className="h-3 w-3 text-orange" />}
                        {r.channel === "email" && <Mail className="h-3 w-3 text-orange" />}
                        {r.channel === "whatsapp" && <MessageCircle className="h-3 w-3 text-emerald-600" />}
                        {r.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-ink">
                      {new Date(r.sendAt).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          r.status === "sent"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : r.status === "cancelled"
                            ? "bg-zinc-100 text-muted"
                            : r.status === "failed"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-orange/10 text-orange border border-orange/20"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted text-[11px]">
                      {r.payload?.body || "Automated shoot reminder"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
