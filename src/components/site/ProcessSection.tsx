"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Compass,
  Layers,
  Camera,
  Sliders,
  Rocket,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import type { PublicContent } from "@/lib/content";

const STEP_DETAILS: Record<
  string,
  {
    phase: string;
    icon: React.ElementType;
    detail: string;
    deliverables: string[];
  }
> = {
  "01": {
    phase: "01 · STRATEGY",
    icon: Compass,
    detail:
      "We deep-dive into your brand DNA, audience psychology, and commercial targets to shape a sharp, strategic creative brief.",
    deliverables: ["Brand Audit", "Audience Mapping", "Core Creative Thesis"],
  },
  "02": {
    phase: "02 · DIRECTION",
    icon: Layers,
    detail:
      "Translating strategy into visual treatments, scene storyboards, tech stack blueprints, and verified production schedules.",
    deliverables: ["Visual Storyboards", "Style Treatment", "Execution Schedule"],
  },
  "03": {
    phase: "03 · PRODUCTION",
    icon: Camera,
    detail:
      "On-set cinematography with high-end cinema camera packages, lighting mastery, and custom modern web engineering.",
    deliverables: ["Cinema Film Shoot", "Custom Web Code", "High-Res Imagery"],
  },
  "04": {
    phase: "04 · CRAFT",
    icon: Sliders,
    detail:
      "Hollywood-grade ACES color grading, spatial sound design, performance stress-testing, and collaborative review rounds.",
    deliverables: ["Color Science", "Sound Design", "Performance QC"],
  },
  "05": {
    phase: "05 · IMPACT",
    icon: Rocket,
    detail:
      "Broadcast 4K/6K master exports, live website deployment, distribution asset handoff, and real-world growth tracking.",
    deliverables: ["Broadcast Masters", "Platform Handover", "Growth Tracking"],
  },
};

export function ProcessSection({ steps }: { steps: PublicContent["process"] }) {
  const topSteps = steps.slice(0, 3);
  const bottomSteps = steps.slice(3, 5);

  return (
    <section className="site-grid py-24 sm:py-32 md:py-36">
      {/* Section Header */}
      <div className="mb-12 sm:mb-16 max-w-3xl">
        <span className="font-handwriting text-3xl sm:text-4xl text-orange tracking-wide block">
          (the process)
        </span>
        <h2 className="font-cal text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-ink mt-2">
          How We Bring Ideas to Life
        </h2>
        <p className="mt-3.5 text-sm sm:text-base text-muted leading-relaxed max-w-xl">
          From first concept to final delivery — an agile, transparent production pipeline with no guesswork, no delays, and no drama.
        </p>
      </div>

      {/* Row 1: 3 Process Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topSteps.map((step, idx) => {
          const meta = STEP_DETAILS[step.number] || {
            phase: `${step.number} · PHASE`,
            icon: Compass,
            detail: step.text,
            deliverables: ["Creative Craft", "Milestone Delivery"],
          };
          const Icon = meta.icon;

          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex flex-col justify-between rounded-[28px] border border-black/[0.08] bg-white p-7 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-orange/40 hover:shadow-[0_20px_45px_rgba(255,77,20,0.09)]"
            >
              <div>
                {/* Header: Number Badge, Phase Tag, Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-cal text-xs font-bold text-orange bg-orange/10 px-3 py-1 rounded-full border border-orange/20 tracking-wider">
                      {step.number}
                    </span>
                    <span className="font-display text-[10px] uppercase tracking-wider text-muted font-bold">
                      {meta.phase}
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-[#fafaf8] border border-black/5 flex items-center justify-center text-ink/70 group-hover:text-orange group-hover:bg-orange/10 group-hover:border-orange/20 transition-all duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                {/* Title & Core Meaning */}
                <h3 className="font-cal text-2xl sm:text-3xl font-bold text-ink mt-5 group-hover:text-orange transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm font-semibold text-ink/85 mt-2 leading-snug">
                  {step.text}
                </p>
                <p className="text-xs text-muted leading-relaxed mt-2.5">
                  {meta.detail}
                </p>
              </div>

              {/* Deliverable Pills */}
              <div className="mt-6 pt-5 border-t border-black/[0.06] flex flex-wrap gap-1.5">
                {meta.deliverables.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-[#f4f4f0] px-3 py-1 font-sans text-[11px] font-medium text-ink/80 border border-black/5 group-hover:border-orange/20 transition-colors"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Row 2: 2 Process Cards (Refine & Launch) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-5xl mx-auto">
        {bottomSteps.map((step, idx) => {
          const meta = STEP_DETAILS[step.number] || {
            phase: `${step.number} · PHASE`,
            icon: Rocket,
            detail: step.text,
            deliverables: ["Creative Craft", "Milestone Delivery"],
          };
          const Icon = meta.icon;

          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex flex-col justify-between rounded-[28px] border border-black/[0.08] bg-white p-7 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-orange/40 hover:shadow-[0_20px_45px_rgba(255,77,20,0.09)]"
            >
              <div>
                {/* Header: Number Badge, Phase Tag, Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-cal text-xs font-bold text-orange bg-orange/10 px-3 py-1 rounded-full border border-orange/20 tracking-wider">
                      {step.number}
                    </span>
                    <span className="font-display text-[10px] uppercase tracking-wider text-muted font-bold">
                      {meta.phase}
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-[#fafaf8] border border-black/5 flex items-center justify-center text-ink/70 group-hover:text-orange group-hover:bg-orange/10 group-hover:border-orange/20 transition-all duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                {/* Title & Core Meaning */}
                <h3 className="font-cal text-2xl sm:text-3xl font-bold text-ink mt-5 group-hover:text-orange transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm font-semibold text-ink/85 mt-2 leading-snug">
                  {step.text}
                </p>
                <p className="text-xs text-muted leading-relaxed mt-2.5">
                  {meta.detail}
                </p>
              </div>

              {/* Deliverable Pills */}
              <div className="mt-6 pt-5 border-t border-black/[0.06] flex flex-wrap gap-1.5">
                {meta.deliverables.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-[#f4f4f0] px-3 py-1 font-sans text-[11px] font-medium text-ink/80 border border-black/5 group-hover:border-orange/20 transition-colors"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
