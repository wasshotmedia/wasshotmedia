"use client";

import { useState } from "react";
import {
  Video,
  Film,
  Globe,
  TrendingUp,
  Megaphone,
  Compass,
  CheckCircle2,
  Send,
  Loader2,
  MessageCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LiquidMetalButton } from "./LiquidMetalButton";

const SERVICES = [
  { id: "Shooting", label: "Shooting", icon: Video },
  { id: "Video Editing", label: "Editing", icon: Film },
  { id: "Website Development", label: "Websites", icon: Globe },
  { id: "SEO", label: "SEO Growth", icon: TrendingUp },
  { id: "Promotions", label: "Campaigns", icon: Megaphone },
  { id: "Strategy", label: "Strategy", icon: Compass },
];

const BUDGETS = [
  "Under ₹50k",
  "₹50k – ₹1.5L",
  "₹1.5L – ₹5L",
  "₹5L+",
  "Flexible",
];

const TIMELINES = [
  "Immediately",
  "Within 1 Month",
  "1–3 Months",
  "Exploring",
];

export function ContactForm({ whatsapp = "917396986817" }: { whatsapp?: string }) {
  const [selectedService, setSelectedService] = useState("Shooting");
  const [selectedBudget, setSelectedBudget] = useState("₹50k – ₹1.5L");
  const [selectedTimeline, setSelectedTimeline] = useState("Within 1 Month");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(json.error || "Could not send the message. Please try again.");
        return;
      }
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again or reach out on WhatsApp.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-[32px] border border-black/10 bg-white p-8 md:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.06)] text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50 mb-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h3 className="display text-4xl md:text-5xl text-ink">Project Brief Received.</h3>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted">
          Thank you! Our creative director reviews every brief personally and will get back to you within 2–4 hours with initial thoughts and next steps.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:border-orange hover:text-orange"
          >
            Send Another Brief
          </button>
          <a
            href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Chat on WhatsApp →</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[32px] border border-black/10 bg-white p-6 sm:p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
      {/* High-Level Studio Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-black/[0.08] pb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange">
            Project Brief
          </span>
          <h2 className="display mt-1 text-2xl sm:text-3xl text-ink">
            Tell us about your project
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 px-3.5 py-1.5 text-xs font-medium text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Available for New Projects</span>
        </div>
      </div>

      <form onSubmit={onSubmit} suppressHydrationWarning className="space-y-7">
        {/* Hidden inputs for interactive pill selections */}
        <input type="hidden" name="service" value={selectedService} />
        <input type="hidden" name="budget" value={selectedBudget} />
        <input type="hidden" name="timeline" value={selectedTimeline} />

        {/* 1. Interactive Service Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-3">
            What do you need help with? <span className="text-orange">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {SERVICES.map((s) => {
              const isSelected = selectedService === s.id;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedService(s.id)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-xs sm:text-sm font-semibold transition-all duration-200 text-left",
                    isSelected
                      ? "border-orange bg-orange text-white shadow-[0_6px_20px_rgba(255,77,20,0.3)] scale-[1.02]"
                      : "border-black/10 bg-[#faf9f6] text-ink/80 hover:border-black/25 hover:bg-white"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isSelected ? "text-white" : "text-orange")} />
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Contact Credentials */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
              Your Name <span className="text-orange">*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. John Doe"
              suppressHydrationWarning
              className="w-full rounded-2xl border border-black/10 bg-[#faf9f6] px-4 py-3.5 text-sm text-ink placeholder:text-muted/50 transition-all focus:border-orange focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange/10"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
              Email Address <span className="text-orange">*</span>
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="e.g. john@company.com"
              suppressHydrationWarning
              className="w-full rounded-2xl border border-black/10 bg-[#faf9f6] px-4 py-3.5 text-sm text-ink placeholder:text-muted/50 transition-all focus:border-orange focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange/10"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
              Phone Number <span className="text-muted/60 font-normal">(Optional)</span>
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              suppressHydrationWarning
              className="w-full rounded-2xl border border-black/10 bg-[#faf9f6] px-4 py-3.5 text-sm text-ink placeholder:text-muted/50 transition-all focus:border-orange focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange/10"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
              Company or Brand <span className="text-muted/60 font-normal">(Optional)</span>
            </label>
            <input
              name="company"
              type="text"
              placeholder="e.g. WasShot Media"
              suppressHydrationWarning
              className="w-full rounded-2xl border border-black/10 bg-[#faf9f6] px-4 py-3.5 text-sm text-ink placeholder:text-muted/50 transition-all focus:border-orange focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange/10"
            />
          </div>
        </div>

        {/* 3. Project Narrative */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
            Project Overview <span className="text-orange">*</span>
          </label>
          <textarea
            name="description"
            required
            minLength={10}
            rows={4}
            placeholder="Tell us about your vision, goals, target audience, deliverables, or reference links..."
            suppressHydrationWarning
            className="w-full rounded-2xl border border-black/10 bg-[#faf9f6] p-4 text-sm text-ink placeholder:text-muted/50 transition-all focus:border-orange focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange/10 resize-y"
          />
        </div>

        {/* 4. Interactive Budget Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2.5">
            Approximate Budget <span className="text-muted/60 font-normal">(INR)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {BUDGETS.map((b) => {
              const isSelected = selectedBudget === b;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBudget(b)}
                  className={cn(
                    "rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all duration-200",
                    isSelected
                      ? "border-orange bg-orange/10 text-orange ring-2 ring-orange/30 font-bold"
                      : "border-black/10 bg-[#faf9f6] text-ink/75 hover:border-black/25 hover:bg-white"
                  )}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Timeline Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2.5">
            Desired Timeline
          </label>
          <div className="flex flex-wrap gap-2">
            {TIMELINES.map((t) => {
              const isSelected = selectedTimeline === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTimeline(t)}
                  className={cn(
                    "rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all duration-200",
                    isSelected
                      ? "border-orange bg-orange/10 text-orange ring-2 ring-orange/30 font-bold"
                      : "border-black/10 bg-[#faf9f6] text-ink/75 hover:border-black/25 hover:bg-white"
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        {errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {/* 6. Actions & Studio Guarantee */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LiquidMetalButton
              type="submit"
              disabled={status === "sending"}
              label={status === "sending" ? "Submitting Brief…" : "Send Project Brief →"}
              size="lg"
            />

            {whatsapp ? (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3.5 text-xs font-bold text-ink transition hover:border-emerald-500 hover:text-emerald-700"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <span>Quick WhatsApp</span>
              </a>
            ) : null}
          </div>

          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Clock className="h-3.5 w-3.5 text-orange" />
            <span>Direct director reply within 2–4 hours</span>
          </p>
        </div>
      </form>
    </div>
  );
}
