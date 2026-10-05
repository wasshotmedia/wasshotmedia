"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Lightbulb,
  Layers,
  Target,
  Zap,
  ArrowUpRight,
  CheckCircle2,
  Users,
  ShieldCheck,
} from "lucide-react";
import type { PublicContent } from "@/lib/content";

const BENTO_FEATURES = [
  {
    num: "01",
    phase: "01 / THINKING",
    icon: Lightbulb,
    title: "Creative Thinking",
    punchline: "We don't just execute briefs — we challenge them.",
    text: "Every concept is pressure-tested against audience psychology, cultural relevance, and visual distinction before a single frame is shot.",
    tags: ["Directorial Vision", "Cultural Relevance", "Brand Distinction"],
    metric: "98.6% Brand Recall",
    highlight: "ORIGINALITY FIRST · ZERO COOKIE-CUTTER",
  },
  {
    num: "02",
    phase: "02 / PIPELINE",
    icon: Layers,
    title: "One Connected Team",
    punchline: "Creative and digital work under one single roof.",
    text: "No outsourced handoffs. The cinematography team shooting your brand films collaborates side-by-side with the engineers building your website.",
    tags: ["Unified Direction", "Shared Vision", "Zero Miscommunication"],
    metric: "100% In-House Craft",
    highlight: "FILM PRODUCTION ⇄ WEB ENGINEERING",
  },
  {
    num: "03",
    phase: "03 / PURPOSE",
    icon: Target,
    title: "Built for Real Brands",
    punchline: "Every project starts with the commercial objective.",
    text: "Visuals must look breathtaking, but they must also convert. We engineer every cut, color curve, and responsive layout to drive authentic growth.",
    tags: ["High Conversion", "Market Position", "Measurable ROI"],
    metric: "3.4x Engagement Surge",
    highlight: "AESTHETIC CRAFT × COMMERCIAL VELOCITY",
  },
  {
    num: "04",
    phase: "04 / SPEED",
    icon: Zap,
    title: "Fast + Personal",
    punchline: "Direct founder communication without agency bloat.",
    text: "You collaborate directly with the people doing the work. Rapid communication, weekly milestone drops, and zero bureaucratic account manager layers.",
    tags: ["Direct Line Access", "Rapid Turnaround", "Zero Delays"],
    metric: "2–3x Faster Delivery",
    highlight: "NO BLOAT · NO LAYERS · PURE EXECUTION",
  },
];

export function WhySection({ items }: { items?: PublicContent["why"] }) {
  return (
    <section className="site-grid py-24 sm:py-32 md:py-36 overflow-hidden">
      {/* Section Header */}
      <div className="mb-12 sm:mb-16 max-w-4xl">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-handwriting text-3xl sm:text-4xl text-[#ff4d00] tracking-wide block"
        >
          (the wasshot edge)
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-cal text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-ink mt-2 leading-[1.05]"
        >
          Why <span className="text-[#ff4d00]">WasShot?</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-base sm:text-lg text-muted max-w-2xl leading-relaxed"
        >
          We reject cookie-cutter agency bloat. Built for ambitious founders and brands that demand cinema-grade storytelling, high-performance web engineering, and direct personal collaboration.
        </motion.p>
      </div>

      {/* 4 Huge Bento Feature Cards with High-End Visual Effects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {BENTO_FEATURES.map((feature, idx) => {
          const Icon = feature.icon;

          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.55,
                delay: idx * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -6 }}
              className="group relative flex flex-col justify-between rounded-[32px] sm:rounded-[36px] border border-black/[0.08] bg-white p-8 sm:p-10 shadow-[0_12px_36px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-[#ff4d00]/40 hover:shadow-[0_24px_60px_rgba(255,77,20,0.12)] overflow-hidden"
            >
              {/* Warm Ambient Hover Glow in Corner */}
              <div className="absolute -top-20 -right-20 h-52 w-52 rounded-full bg-[#ff4d00]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div>
                {/* Header: Number Badge, Phase, Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-cal text-xs font-bold text-[#ff4d00] bg-[#ff4d00]/10 px-3 py-1 rounded-full border border-[#ff4d00]/20 tracking-wider">
                      {feature.num}
                    </span>
                    <span className="font-display text-[10px] sm:text-[11px] uppercase tracking-wider text-muted font-bold">
                      {feature.phase}
                    </span>
                  </div>

                  <div className="h-11 w-11 rounded-2xl bg-[#fafaf8] border border-black/5 flex items-center justify-center text-ink/70 group-hover:text-[#ff4d00] group-hover:bg-[#ff4d00]/10 group-hover:border-[#ff4d00]/20 transition-all duration-300 shadow-2xs">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                {/* Big Display Title */}
                <h3 className="font-cal text-3xl sm:text-4xl font-bold text-ink mt-6 sm:mt-8 group-hover:text-[#ff4d00] transition-colors duration-300 tracking-tight">
                  {feature.title}
                </h3>

                {/* Punchline */}
                <p className="font-cal text-base sm:text-lg text-ink/90 font-medium mt-2.5 leading-snug">
                  {feature.punchline}
                </p>

                {/* Body Text */}
                <p className="text-sm text-muted leading-relaxed mt-3 max-w-lg">
                  {feature.text}
                </p>
              </div>

              {/* Lower Section: Highlight Badge, Metric, & Deliverable Tags */}
              <div className="mt-8 pt-6 border-t border-black/[0.06] space-y-4">
                {/* Visual Highlight Ribbon */}
                <div className="flex items-center justify-between">
                  <span className="font-display text-[11px] sm:text-xs font-bold text-[#ff4d00] tracking-wider uppercase">
                    {feature.highlight}
                  </span>
                  <span className="font-display rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                    {feature.metric}
                  </span>
                </div>

                {/* Deliverable Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  {feature.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#f4f4f0] px-3.5 py-1 text-xs font-medium text-ink/85 border border-black/5 transition-colors group-hover:border-[#ff4d00]/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
