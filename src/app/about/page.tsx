import type { Metadata } from "next";
import { getPublicContent } from "@/lib/content";
import { PublicShell } from "@/components/site/HomePage";
import { HighLevelPillars } from "@/components/site/HighLevelPillars";
import { LiquidMetalButton } from "@/components/site/LiquidMetalButton";
import { BrandEmblem } from "@/components/site/Logo";
import { BlurSlideText, Reveal } from "@/components/site/Reveal";
import { ServicesRibbonMarquee } from "@/components/site/ServicesRibbonMarquee";
import {
  Camera,
  Film,
  Code2,
  Megaphone,
  TrendingUp,
  Compass,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About — Creative Media + Digital Agency",
  description:
    "Shaping next-gen experiences through cinema-grade visuals, web engineering, and commercial purpose. Meet WasShot Media.",
};

export default async function AboutPage() {
  const content = await getPublicContent();
  return (
    <PublicShell content={content}>
      {/* Hero Header (Matching Template Image 2: Cal Sans, Compact Elegant Sizing) */}
      <section className="relative overflow-hidden pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="site-grid text-center max-w-4xl mx-auto">
          <h1 className="font-cal text-3xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[60px] font-bold leading-[1.12] tracking-[-0.025em] text-ink">
            <div className="flex flex-wrap items-center justify-center gap-x-[0.25em]">
              <BlurSlideText text="Meet WasShot" trigger="mount" delay={0.1} />
              <span className="text-orange">
                <BlurSlideText text="Bold Ideas" trigger="mount" delay={0.28} />
              </span>
            </div>
            <div className="mt-1.5 sm:mt-2.5 flex flex-wrap items-center justify-center gap-x-[0.25em]">
              <BlurSlideText text="Real Impact Driven" trigger="mount" delay={0.46} />
            </div>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-muted">
            Shaping next-gen experiences through cinema-grade visuals, engineering, and commercial purpose. At WasShot Media, innovation isn&apos;t just a buzzword — it&apos;s our foundation.
          </p>

          {/* View Projects Button */}
          <div className="mt-7 flex justify-center">
            <LiquidMetalButton
              label="View Projects →"
              href="/work"
              size="md"
            />
          </div>
        </div>
      </section>

      {/* Intro Manifesto & Services Pills Section (Matching Template Image 1 & 2) */}
      <section className="site-grid py-14 sm:py-20 md:py-24 text-center border-t border-black/[0.08]">
        {/* (hello) badge */}
        <p className="font-handwriting text-2xl sm:text-3xl md:text-4xl text-orange mb-4 select-none tracking-wide">
          <BlurSlideText text="(hello)" trigger="inView" delay={0.05} />
        </p>

        {/* Big Bold Headline Statement (Exact Cal Sans Font & Sizing from Template with Motion Blur Slide Effect) */}
        <h2 className="font-cal mx-auto max-w-5xl text-3xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[58px] font-bold leading-[1.15] tracking-[-0.025em] text-ink">
          <BlurSlideText
            text="We turn ideas into scroll-stopping visuals, powerful websites, and digital experiences that help brands get seen, remembered, and grow."
            trigger="inView"
            stagger={0.035}
            duration={0.75}
            delay={0.15}
          />{" "}
          <span className="text-black/40">
            <BlurSlideText
              text="From the first frame to the final click, we create everything your brand needs to move forward."
              trigger="inView"
              stagger={0.035}
              duration={0.75}
              delay={0.65}
            />
          </span>
        </h2>

        {/* 6 Services Capsule Pill Boxes (Matching Image 2) */}
        <Reveal delay={0.85} className="mt-10 sm:mt-12 flex flex-col items-center gap-3">
          {/* Row 1 */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2.5 rounded-full bg-[#424242] hover:bg-[#333333] text-white px-5 py-2.5 font-display text-xs sm:text-sm font-semibold shadow-sm border border-white/10 transition-all duration-300 hover:scale-105 select-none">
              <Camera className="h-4 w-4 text-orange" />
              <span>Shooting</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-full bg-[#424242] hover:bg-[#333333] text-white px-5 py-2.5 font-display text-xs sm:text-sm font-semibold shadow-sm border border-white/10 transition-all duration-300 hover:scale-105 select-none">
              <Film className="h-4 w-4 text-orange" />
              <span>Video Editing</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-full bg-[#424242] hover:bg-[#333333] text-white px-5 py-2.5 font-display text-xs sm:text-sm font-semibold shadow-sm border border-white/10 transition-all duration-300 hover:scale-105 select-none">
              <Code2 className="h-4 w-4 text-orange" />
              <span>Website</span>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2.5 rounded-full bg-[#424242] hover:bg-[#333333] text-white px-5 py-2.5 font-display text-xs sm:text-sm font-semibold shadow-sm border border-white/10 transition-all duration-300 hover:scale-105 select-none">
              <Megaphone className="h-4 w-4 text-orange" />
              <span>Promotions</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-full bg-[#424242] hover:bg-[#333333] text-white px-5 py-2.5 font-display text-xs sm:text-sm font-semibold shadow-sm border border-white/10 transition-all duration-300 hover:scale-105 select-none">
              <TrendingUp className="h-4 w-4 text-orange" />
              <span>SEO &amp; Growth</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-full bg-[#424242] hover:bg-[#333333] text-white px-5 py-2.5 font-display text-xs sm:text-sm font-semibold shadow-sm border border-white/10 transition-all duration-300 hover:scale-105 select-none">
              <Compass className="h-4 w-4 text-orange" />
              <span>Strategy</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Crossed Scrolling Services Ribbons (Template Marquee Ticker) */}
      <ServicesRibbonMarquee />

      {/* High-Level Foundational Pillars */}
      <HighLevelPillars />

      {/* Studio Ethos */}
      <section className="site-grid pb-24">
        <div className="mt-20 flex flex-col items-start justify-between gap-10 rounded-[32px] bg-ink p-8 text-white md:p-14 lg:flex-row lg:items-center">
          <div className="max-w-3xl">
            <p className="font-display text-xs uppercase tracking-widest text-orange font-bold">Our Approach</p>
            <h2 className="display mt-3 text-3xl md:text-5xl">
              One team. Zero handoffs. Built for real business results.
            </h2>
            <p className="mt-6 max-w-2xl text-base text-white/70">
              We eliminated the disconnect between creative production and digital development. When you work with WasShot Media, your visual identity and your digital platform are built together with unified intent.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <LiquidMetalButton
                label="Explore Our Work →"
                href="/work"
                size="md"
              />
              <LiquidMetalButton
                label="Start a Conversation →"
                href="/contact"
                size="md"
              />
            </div>
          </div>
          <BrandEmblem size={160} className="hidden shrink-0 shadow-[0_16px_60px_rgba(255,77,20,0.4)] lg:block" />
        </div>
      </section>
    </PublicShell>
  );
}
