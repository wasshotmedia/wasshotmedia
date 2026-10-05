"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function ShootingVisual() {
  return (
    <div className="relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden bg-[#e8e5df] border border-black/[0.08] group/img select-none">
      {/* Real Cinematic Shoot Still */}
      <Image
        src="/services/shooting.jpg"
        alt="Cinematic Shooting Studio Set"
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out group-hover/img:scale-105"
      />

      {/* Subtle Cinematic Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30" />

      {/* Viewfinder Framing Guides */}
      <div className="pointer-events-none absolute inset-3 border border-white/20 rounded-sm">
        <div className="absolute -top-1 -left-1 h-2.5 w-2.5 border-t-2 border-l-2 border-white/80" />
        <div className="absolute -top-1 -right-1 h-2.5 w-2.5 border-t-2 border-r-2 border-white/80" />
        <div className="absolute -bottom-1 -left-1 h-2.5 w-2.5 border-b-2 border-l-2 border-white/80" />
        <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 border-b-2 border-r-2 border-white/80" />
      </div>

      {/* Top Camera Status Tag */}
      <div className="relative z-10 p-3 flex items-center justify-between text-[11px] font-sans font-medium text-white/90">
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/15">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="font-bold text-red-400">REC</span>
          <span className="text-white/40">·</span>
          <span>01:24:08</span>
        </div>
        <span className="bg-black/60 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/15 text-[10px] tracking-wider text-white/80 uppercase">
          4K Anamorphic
        </span>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-[10px] font-sans font-medium text-white/80">
        <span className="bg-black/60 backdrop-blur-xs px-2.5 py-0.5 rounded border border-white/15">
          ISO 800 · 24 FPS
        </span>
        <span className="bg-orange/90 text-white font-sans font-bold px-2.5 py-0.5 rounded-full text-[10px] tracking-wide">
          Directorial Vision
        </span>
      </div>
    </div>
  );
}

function WebsitesVisual() {
  return (
    <div className="relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden bg-[#f6f5f2] border border-black/[0.08] p-3.5 flex flex-col justify-between select-none">
      {/* Light Browser Window Title Bar */}
      <div className="flex items-center justify-between border-b border-black/[0.06] pb-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex items-center gap-1.5 bg-white px-3 py-0.5 rounded-full border border-black/[0.06] text-[10px] font-sans font-medium text-muted shadow-2xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>wasshotmedia.com</span>
        </div>
        <span className="text-[10px] font-display font-bold text-orange">Live</span>
      </div>

      {/* Clean Editorial Website Mockup Content */}
      <div className="my-auto rounded-xl bg-white p-3 border border-black/[0.06] shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-2 w-16 rounded-full bg-black/70" />
          <div className="flex gap-2">
            <div className="h-1.5 w-8 rounded-full bg-black/20" />
            <div className="h-1.5 w-8 rounded-full bg-black/20" />
          </div>
        </div>

        <div className="pt-1">
          <div className="h-3.5 w-3/4 rounded bg-black/85" />
          <div className="mt-1 h-2 w-1/2 rounded bg-black/30" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="inline-flex items-center gap-1 bg-orange text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
            Explore Experience →
          </span>
          <span className="text-[9px] font-display text-emerald-600 font-bold bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded">
            99.9% Vitals
          </span>
        </div>
      </div>

      {/* Footer Feature Note */}
      <div className="flex items-center justify-between text-[10px] text-muted border-t border-black/[0.06] pt-2 font-display font-medium">
        <span>Bespoke Design Systems</span>
        <span className="text-ink font-semibold">Fluid Responsive UX</span>
      </div>
    </div>
  );
}

function GrowthVisual() {
  return (
    <div className="relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden bg-[#f6f5f2] border border-black/[0.08] p-3.5 flex flex-col justify-between select-none">
      {/* Analytics Header */}
      <div className="flex items-center justify-between border-b border-black/[0.06] pb-2">
        <span className="text-[10px] font-display font-bold tracking-wider text-muted uppercase">
          Campaign Reach &amp; Visibility
        </span>
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-display">
          +320% VISIBILITY
        </span>
      </div>

      {/* Smooth Minimalist Growth Curve Chart */}
      <div className="my-auto h-20 w-full flex items-center">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 280 80" fill="none">
          {/* Subtle Horizontal Reference Guidelines */}
          <line x1="0" y1="20" x2="280" y2="20" stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />
          <line x1="0" y1="50" x2="280" y2="50" stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />

          {/* Area Gradient Fill */}
          <defs>
            <linearGradient id="growthAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff4d00" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ff4d00" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d="M 0 65 Q 45 60 75 48 T 145 38 T 215 20 T 280 8 L 280 80 L 0 80 Z"
            fill="url(#growthAreaGradient)"
          />

          {/* Glowing Orange Trajectory Line */}
          <path
            d="M 0 65 Q 45 60 75 48 T 145 38 T 215 20 T 280 8"
            stroke="#ff4d00"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Milestone Node Points */}
          <circle cx="75" cy="48" r="3.5" fill="#ffffff" stroke="#ff4d00" strokeWidth="2" />
          <circle cx="145" cy="38" r="3.5" fill="#ffffff" stroke="#ff4d00" strokeWidth="2" />
          <circle cx="215" cy="20" r="3.5" fill="#ffffff" stroke="#ff4d00" strokeWidth="2" />
          <circle cx="280" cy="8" r="4" fill="#ff4d00" />
        </svg>
      </div>

      {/* Bottom KPI Metrics */}
      <div className="flex items-center justify-between text-[10px] text-muted border-t border-black/[0.06] pt-2 font-display">
        <div className="flex items-center gap-1">
          <span>Search Rank:</span>
          <span className="font-bold text-ink font-display">Top 3</span>
        </div>
        <div className="flex items-center gap-1">
          <span>High-Intent Leads:</span>
          <span className="font-bold text-emerald-600 font-display">+185%</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Target Reach:</span>
          <span className="font-bold text-orange font-display">Omnichannel</span>
        </div>
      </div>
    </div>
  );
}

export function HighLevelPillars() {
  const PILLARS = [
    {
      id: "01",
      eyebrow: "01 / PRODUCTION",
      title: "Cinematic Shooting",
      tagline: "Stories captured with purpose.",
      description:
        "From brand films and social content to promotional shoots, we create visually powerful footage designed to make your brand stand out.",
      visual: <ShootingVisual />,
      chips: [
        "🎥 Brand & Commercial Shoots",
        "📸 Photography",
        "🎬 Reels & Social Content",
        "💡 Creative Direction",
      ],
      href: "/services#shooting",
    },
    {
      id: "02",
      eyebrow: "02 / DIGITAL",
      title: "Websites & Digital Experiences",
      tagline: "Websites that look good and work hard.",
      description:
        "We design and build modern websites that turn your brand identity into a powerful digital experience — from concept to launch.",
      visual: <WebsitesVisual />,
      chips: [
        "🌐 Custom Website Development",
        "🎨 UI/UX Design Systems",
        "⚡ Fluid Responsive Code",
        "🚀 High-Performance Deployment",
      ],
      href: "/services#website-development",
    },
    {
      id: "03",
      eyebrow: "03 / GROWTH",
      title: "SEO & Promotions",
      tagline: "Creative built to reach the right people.",
      description:
        "We combine content, SEO and digital promotion to help brands increase visibility, attract audiences and turn attention into growth.",
      visual: <GrowthVisual />,
      chips: [
        "📈 Search Engine Optimization",
        "📱 Social Media Promotions",
        "🎯 Digital Campaigns",
        "📊 Performance Tracking",
      ],
      href: "/services#seo",
    },
  ];

  return (
    <section className="site-grid py-16 sm:py-20 md:py-28">
      {/* Refined Section Header */}
      <div className="mb-12 sm:mb-14 md:mb-16 text-center max-w-3xl mx-auto">
        <p className="font-display text-xs uppercase tracking-widest text-orange font-bold">
          What We Do
        </p>
        <h2 className="font-cal mt-3 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-ink">
          Crafted for Impact. Engineered to Scale.
        </h2>
        <p className="mt-3.5 text-sm sm:text-base text-muted leading-relaxed max-w-xl mx-auto">
          From the first frame to the final click, explore how WasShot Media turns bold ideas into measurable results.
        </p>
      </div>

      {/* 3 Premium Light Luxury Cards */}
      <div className="grid gap-7 lg:grid-cols-3">
        {PILLARS.map((pillar) => (
          <article
            key={pillar.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] sm:rounded-[32px] bg-white border border-black/[0.08] p-6 sm:p-7 md:p-8 text-ink shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.07)] hover:border-black/15"
          >
            <div>
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
                <span className="font-display text-xs font-bold tracking-widest uppercase text-orange">
                  {pillar.eyebrow}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[#f4f2ee] text-ink/70 px-2.5 py-0.5 rounded-full text-[11px] font-display font-medium border border-black/[0.05]">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange" />
                  <span>WASSHOT</span>
                </span>
              </div>

              {/* Visual Preview Box */}
              <div className="my-5">{pillar.visual}</div>

              {/* Title & Tagline */}
              <h3 className="font-cal text-2xl sm:text-[26px] md:text-3xl font-bold tracking-tight text-ink group-hover:text-orange transition-colors duration-200">
                {pillar.title}
              </h3>
              <p className="font-display mt-1.5 text-xs sm:text-sm font-semibold text-orange">
                {pillar.tagline}
              </p>

              {/* Description */}
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted">
                {pillar.description}
              </p>

              {/* Requested Chips */}
              <div className="mt-6 flex flex-wrap gap-2">
                {pillar.chips.map((chip, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-full bg-[#f4f2ee] hover:bg-[#eae7e1] border border-black/[0.06] px-3 py-1 font-display text-[11px] font-medium text-ink transition-colors duration-200 select-none"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* Clean Footer Link */}
            <div className="mt-8 pt-4 border-t border-black/[0.06] flex items-center justify-between">
              <Link
                href={pillar.href}
                className="inline-flex items-center gap-2 font-display text-xs sm:text-sm font-semibold text-ink group-hover:text-orange transition-colors duration-200"
              >
                <span>Learn More</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 text-orange" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
