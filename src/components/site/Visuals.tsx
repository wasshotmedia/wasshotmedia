"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const scenes = {
  shooting: {
    bg: "linear-gradient(160deg,#1a1a1a 0%,#3a2418 50%,#111 100%)",
    label: "01 · PRODUCTION",
    title: "SHOOTING",
  },
  websites: {
    bg: "linear-gradient(180deg,#161616 0%,#2b2118 100%)",
    label: "02 · DIGITAL",
    title: "WEBSITES",
  },
  promotions: {
    bg: "linear-gradient(145deg,#1c1210 0%,#4a2414 100%)",
    label: "03 · CAMPAIGNS",
    title: "PROMOTIONS",
  },
  editing: {
    bg: "linear-gradient(135deg,#141414 0%,#2a1c14 40%,#0d0d0d 100%)",
    label: "04 · POST PRODUCTION",
    title: "EDITING",
  },
  seo: {
    bg: "linear-gradient(200deg,#101010 0%,#1f2a22 100%)",
    label: "05 · DISCOVERY",
    title: "SEO",
  },
  strategy: {
    bg: "linear-gradient(160deg,#121212 0%,#2a261c 100%)",
    label: "06 · STRATEGY",
    title: "STRATEGY",
  },
} as const;

export type VisualKey = keyof typeof scenes;

export function VisualScene({
  kind,
  className,
}: {
  kind: VisualKey | string;
  className?: string;
}) {
  const scene = scenes[(kind as VisualKey) in scenes ? (kind as VisualKey) : "shooting"];
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[24px] text-white border border-white/5 transition-all duration-500 hover:-translate-y-1.5 hover:border-orange/40 hover:shadow-[0_20px_50px_rgba(255,77,20,0.18)]",
        className
      )}
      style={{ background: scene.bg }}
    >
      <div className="absolute inset-0 opacity-40 transition-opacity duration-700 group-hover:opacity-65" aria-hidden>
        <div className="absolute -right-10 top-8 h-40 w-40 rounded-full bg-orange/70 blur-2xl transition-transform duration-700 group-hover:scale-125" />
        <div className="absolute bottom-0 left-8 h-24 w-64 rounded-full bg-white/10 blur-2xl transition-transform duration-700 group-hover:scale-110" />
      </div>
      <div className="relative flex h-full min-h-[220px] flex-col justify-between p-6">
        <div className="flex items-center justify-between text-[10px] tracking-[0.22em] uppercase text-white/70">
          <span className="transition-colors group-hover:text-white">{scene.label}</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-orange animate-pulse" />
            <span>WasShot</span>
          </span>
        </div>
        {kind === "editing" ? <TimelineGraphic /> : null}
        {kind === "websites" ? <WebsiteGraphic /> : null}
        {kind === "seo" ? <SeoGraphic /> : null}
        {kind === "promotions" ? <PromoGraphic /> : null}
        {kind === "strategy" ? <StrategyGraphic /> : null}
        {kind === "shooting" ? <CameraGraphic /> : null}
        <p className="display text-3xl md:text-4xl transition-transform duration-300 group-hover:translate-x-1">{scene.title}</p>
      </div>
    </div>
  );
}

function CameraGraphic() {
  return (
    <div className="relative mx-auto my-6 flex h-24 w-36 items-center justify-center rounded-[18px] border border-white/20 bg-white/5 backdrop-blur-xs transition-colors group-hover:border-white/35">
      {/* Viewfinder corner framing brackets */}
      <div className="absolute top-1 left-1 h-2 w-2 border-t border-l border-white/40" />
      <div className="absolute top-1 right-1 h-2 w-2 border-t border-r border-white/40" />
      <div className="absolute bottom-1 left-1 h-2 w-2 border-b border-l border-white/40" />
      <div className="absolute bottom-1 right-1 h-2 w-2 border-b border-r border-white/40" />

      {/* Subtle REC / 4K indicator with live red ping */}
      <div className="absolute top-2 left-2.5 flex items-center gap-1 font-display text-[9px] text-white/90">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className="font-bold tracking-wider">REC</span>
      </div>
      <div className="absolute top-2 right-2.5 font-display text-[9px] font-bold tracking-wider text-white/70">
        6K RAW
      </div>

      {/* Lens with Orange Accent, breathing pulse & slow rotating crosshair */}
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-orange/80 animate-lens-pulse">
        {/* Subtle rotating crosshair reticle */}
        <div className="absolute inset-0 flex items-center justify-center animate-slow-rotate opacity-30">
          <div className="h-full w-[1px] bg-white" />
          <div className="w-full h-[1px] bg-white absolute" />
        </div>
        {/* Center lens iris with glass sheen */}
        <div className="relative h-6 w-6 rounded-full bg-white/90 shadow-inner transition-transform duration-500 group-hover:scale-110">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange/30 to-transparent" />
        </div>
      </div>

      {/* Frame 24 / Shutter indicator */}
      <div className="absolute bottom-2 left-2.5 font-display text-[9px] font-semibold tracking-wider text-white/70">
        FRAME 24
      </div>
      <div className="absolute bottom-2 right-2.5 font-display text-[9px] text-orange/90 font-bold tracking-wider">
        T1.5
      </div>
    </div>
  );
}

function TimelineGraphic() {
  const [frame, setFrame] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prev) => (prev >= 24 ? 1 : prev + 1));
    }, 120);
    return () => clearInterval(timer);
  }, []);

  const frameStr = frame < 10 ? `0${frame}` : `${frame}`;

  return (
    <div className="my-5 space-y-2">
      {/* Playhead progress & live timecode */}
      <div className="flex items-center justify-between font-display text-[9px] font-semibold tracking-wider text-white/70 mb-1 uppercase">
        <span>TC 00:14:28:{frameStr}</span>
        <span className="text-orange font-bold">4K CUTS · COLOR GRADE</span>
      </div>
      
      {/* Progress track with animated playhead needle */}
      <div className="relative h-2 w-full rounded-full bg-white/15 overflow-hidden">
        <div className="h-2 w-2/3 rounded-full bg-orange" />
        <div className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_#ffffff] rounded-full animate-playhead" />
      </div>

      {/* Video clip tracks */}
      <div className="flex gap-1">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-8 flex-1 rounded-sm bg-white/10 flex items-end p-0.5 transition-all duration-300 group-hover:bg-white/15"
            style={{
              opacity: i % 3 === 0 ? 1 : 0.5,
              borderTop: i % 4 === 0 ? "2px solid #ff4d14" : "none",
            }}
          >
            <span className="h-1 w-full rounded-xs bg-white/20" />
          </div>
        ))}
      </div>

      {/* Audio waveform track with animated dancing equalizer bars */}
      <div className="flex gap-0.5 h-3.5 items-end pt-0.5">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="flex-1 rounded-full bg-orange/70 animate-audio-eq group-hover:bg-orange transition-colors"
            style={{
              height: `${25 + ((i * 17) % 75)}%`,
              animationDelay: `${(i % 8) * 150}ms`,
              animationDuration: `${1.1 + (i % 5) * 0.25}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function WebsiteGraphic() {
  return (
    <div className="relative overflow-hidden my-4 rounded-xl border border-white/15 bg-black/40 backdrop-blur-xs p-3 transition-colors group-hover:border-white/25">
      {/* Browser chrome */}
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-orange animate-pulse" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 font-display text-[9px] font-semibold text-white/80 tracking-wide">
          <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
          <span>wasshotmedia.com</span>
        </div>
      </div>

      {/* Hero layout mock */}
      <div className="h-3 w-1/2 rounded bg-white/90" />
      <div className="mt-1.5 h-1.5 w-3/4 rounded bg-white/25" />

      {/* Two columns with animated shimmer CTA */}
      <div className="mt-3.5 grid grid-cols-2 gap-2">
        <div className="relative overflow-hidden h-12 rounded-lg bg-orange/85 p-2 flex flex-col justify-end shadow-[0_4px_16px_rgba(255,77,20,0.3)] transition-all duration-300 group-hover:shadow-[0_4px_24px_rgba(255,77,20,0.55)]">
          {/* Shimmer sweep effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-sweep" />
          <span className="relative z-10 h-1.5 w-8 rounded bg-white/90" />
        </div>
        <div className="h-12 rounded-lg bg-white/10 p-2 flex flex-col justify-end transition-colors group-hover:bg-white/15">
          <span className="h-1.5 w-12 rounded bg-white/40" />
        </div>
      </div>
    </div>
  );
}

function SeoGraphic() {
  return (
    <div className="my-2.5 space-y-2 rounded-xl bg-white/95 p-3 text-ink border border-black/10 shadow-xs">
      <div className="flex items-center justify-between text-[9px] font-display font-bold uppercase tracking-wider text-muted">
        <span className="flex items-center gap-1.5 text-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Google Search</span>
        </span>
        <span className="rounded bg-orange/10 px-1.5 py-0.5 text-[8px] font-bold text-orange">
          Rank #1 Verified
        </span>
      </div>
      <div className="rounded-lg bg-[#fafaf8] border border-black/5 p-2 space-y-0.5">
        <span className="text-[8px] text-muted block">wasshotmedia.com › services</span>
        <span className="text-[11px] font-cal font-bold text-[#1a0dab] block line-clamp-1">
          WasShot Media — Commercial Video &amp; Digital Studio
        </span>
        <span className="text-[9px] text-[#4d5156] block line-clamp-1">
          High-converting brand films, custom websites, and organic growth.
        </span>
      </div>
    </div>
  );
}

function PromoGraphic() {
  return (
    <div className="my-5 grid grid-cols-2 gap-2">
      <div className="relative overflow-hidden h-16 rounded-xl bg-orange/85 p-2.5 flex flex-col justify-between shadow-[0_4px_18px_rgba(255,77,20,0.3)] transition-transform duration-300 group-hover:scale-[1.02]">
        {/* Shimmer sweep effect */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer-sweep" />
        <div className="relative z-10 flex items-center justify-between">
          <span className="font-display text-[9px] uppercase tracking-wider text-white/85 font-bold">REACH</span>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
          </span>
        </div>
        <span className="relative z-10 font-bold text-base text-white leading-none font-display">4.8M+</span>
      </div>
      <div className="h-16 rounded-xl bg-white/10 p-2.5 flex flex-col justify-between transition-colors group-hover:bg-white/15">
        <span className="font-display text-[9px] uppercase tracking-wider text-white/70 font-bold">ENGAGE</span>
        <span className="font-bold text-base text-orange leading-none shadow-[0_0_12px_rgba(255,77,20,0.3)] font-display">8.4%</span>
      </div>
      <div className="col-span-2 h-7 rounded-xl bg-white/10 px-2.5 flex items-center justify-between text-[9px] font-display font-semibold tracking-wider text-white/80 border border-white/5 uppercase">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          <span>CAMPAIGN // LIVE</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-orange font-bold">VIRAL FEED</span>
          <div className="flex items-end gap-0.5 h-2.5">
            <span className="w-0.5 bg-orange rounded-full animate-audio-eq" style={{ height: "40%", animationDelay: "0ms" }} />
            <span className="w-0.5 bg-orange rounded-full animate-audio-eq" style={{ height: "80%", animationDelay: "200ms" }} />
            <span className="w-0.5 bg-orange rounded-full animate-audio-eq" style={{ height: "60%", animationDelay: "400ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StrategyGraphic() {
  const steps = ["IDEA", "PLAN", "CONTENT", "EXECUTE", "GROW"];
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 1500);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="my-4 flex flex-col justify-center gap-1.5 font-display text-[9px] font-bold tracking-wider">
      {steps.map((step, i) => {
        const isActive = i === activeStep;
        const isGrow = i === steps.length - 1;
        return (
          <div
            key={step}
            className={cn(
              "flex items-center justify-between rounded-md border px-2 py-1 transition-all duration-300",
              isActive
                ? "border-orange/80 bg-orange/20 text-orange shadow-[0_0_12px_rgba(255,77,20,0.3)] scale-[1.02]"
                : "border-white/10 bg-white/5 text-white/70"
            )}
          >
            <span className={cn("font-semibold", isActive ? "text-orange" : isGrow ? "text-orange/90" : "text-white/80")}>
              {step}
            </span>
            <span
              className={cn(
                "transition-transform duration-300",
                isActive ? "text-orange translate-x-0.5 font-bold" : "text-white/30"
              )}
            >
              {isGrow ? "★" : "→"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function HeroCollage() {
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-[#141414] p-3 md:rounded-[40px] md:p-4">
      <div className="grid grid-cols-6 gap-3 md:grid-cols-12 md:gap-4">
        <VisualScene kind="shooting" className="col-span-6 min-h-[220px] md:col-span-4 md:min-h-[280px]" />
        <VisualScene kind="websites" className="col-span-6 min-h-[220px] md:col-span-5 md:min-h-[280px]" />
        <VisualScene kind="promotions" className="col-span-6 min-h-[180px] md:col-span-3 md:min-h-[280px]" />
        <VisualScene kind="editing" className="col-span-6 min-h-[180px] md:col-span-7" />
        <VisualScene kind="seo" className="col-span-3 min-h-[160px] md:col-span-3" />
        <VisualScene kind="strategy" className="col-span-3 min-h-[160px] md:col-span-2" />
      </div>
    </div>
  );
}

export function RoundChip({ kind, className }: { kind: VisualKey; className?: string }) {
  const scene = scenes[kind];
  return (
    <span
      className={cn(
        "inline-flex h-[0.85em] w-[0.85em] translate-y-[0.08em] overflow-hidden rounded-full align-baseline",
        className,
      )}
      style={{ background: scene.bg }}
      aria-hidden
    />
  );
}
