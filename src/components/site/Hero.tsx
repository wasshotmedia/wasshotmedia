"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Link from "next/link";
import {
  Video,
  Film,
  Globe,
  TrendingUp,
  Megaphone,
  Compass,
} from "lucide-react";
import { ArrowLink } from "./Logo";
import { LiquidMetalButton } from "./LiquidMetalButton";
import { BlurSlideText } from "./Reveal";
import { HeroCollage } from "./Visuals";

const SERVICES = [
  { title: "Cinematic Shooting", slug: "shooting", icon: Video },
  { title: "Video Editing & Post", slug: "video-editing", icon: Film },
  { title: "Custom Websites", slug: "website-development", icon: Globe },
  { title: "SEO & Search Growth", slug: "seo", icon: TrendingUp },
  { title: "Brand Campaigns", slug: "promotions", icon: Megaphone },
  { title: "Creative Strategy", slug: "strategy", icon: Compass },
];

export function Hero({
  label,
  message,
  support,
}: {
  label: string;
  message: string;
  support: string;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (reduce || isPaused) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % SERVICES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [reduce, isPaused]);

  const delay = (i: number) => (reduce ? 0 : 0.08 * i);
  const currentService = SERVICES[index];

  return (
    <section className="relative px-0 pb-8 pt-32 md:pt-40">
      <div className="site-grid text-center">
        {/* Eyebrow Label */}
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: delay(1) }}
          className="mb-8 text-[11px] uppercase tracking-[0.28em] text-muted font-medium"
        >
          {label}
        </motion.p>

        {/* Headline Matching Template (Cal Sans, Right-to-Left Blur Motion, No Circles) */}
        <h1 className="font-cal mx-auto max-w-5xl text-5xl sm:text-7xl md:text-8xl lg:text-[96px] xl:text-[104px] font-bold leading-[1.06] tracking-[-0.03em] text-ink">
          <div className="flex flex-wrap items-center justify-center gap-x-[0.25em]">
            <BlurSlideText text="We Create" trigger="mount" delay={0.1} />
          </div>
          <div className="mt-1.5 sm:mt-2.5 flex flex-wrap items-center justify-center gap-x-[0.25em]">
            <BlurSlideText text="You" trigger="mount" delay={0.28} />
            <span className="text-orange">
              <BlurSlideText text="Grow" trigger="mount" delay={0.44} />
            </span>
          </div>
        </h1>

        {/* Narrative / Support text - WasShot's Original Copy */}
        <motion.div
          className="mx-auto mt-7 max-w-xl text-center"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
        >
          <p className="text-base sm:text-lg font-bold text-ink tracking-tight">
            Stories that look good.{" "}
            <span className="text-orange">Digital experiences that work.</span>
          </p>
          <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-muted">
            WasShot Media helps brands turn ideas into powerful visuals, websites and digital experiences that people remember.
          </p>
        </motion.div>

        {/* Actions with LiquidMetalButton */}
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <LiquidMetalButton label="Start a Project →" href="/contact" size="md" />
          <ArrowLink href="/work" variant="ghost">
            View our work
          </ArrowLink>
        </motion.div>

        {/* Flowing Service Navigator */}
        <motion.div
          className="mt-8 flex justify-center"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.95 }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative min-h-[44px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentService.slug}
                initial={{ y: 14, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -14, opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={`/services#${currentService.slug}`}
                  className="group inline-flex items-center gap-2.5 rounded-full border border-black/10 bg-white/90 px-5 py-2 shadow-2xs backdrop-blur-md transition-all duration-300 hover:border-orange/40 hover:bg-white hover:shadow-[0_6px_24px_rgba(255,77,20,0.15)]"
                >
                  <currentService.icon className="h-4 w-4 text-orange transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-xs sm:text-sm font-bold text-ink transition-colors group-hover:text-orange">
                    Explore: {currentService.title}
                  </span>
                  <span className="text-orange text-xs font-semibold transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Visual scenes showcase */}
      <motion.div
        className="site-grid mt-16"
        initial={reduce ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay(7), duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <HeroCollage />
      </motion.div>
    </section>
  );
}
