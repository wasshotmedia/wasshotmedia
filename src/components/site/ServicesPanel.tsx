"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import type { PublicContent } from "@/lib/content";
import { cn } from "@/lib/utils";

function getServiceImage(slug: string): string {
  switch (slug) {
    case "shooting":
      return "/services/shooting.jpg";
    case "video-editing":
    case "editing":
      return "/services/editing.jpg";
    case "website-development":
    case "websites":
      return "/services/website.jpg";
    case "seo":
      return "/services/seo.jpg";
    case "promotions":
      return "/services/promotions.jpg";
    case "strategy":
      return "/services/strategy.jpg";
    default:
      return "/services/shooting.jpg";
  }
}

export function ServicesPanel({ services }: { services: PublicContent["services"] }) {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-cycle through services every 3.8s so each service gets showcased
  useEffect(() => {
    if (isPaused || services.length <= 1) return;

    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % services.length);
    }, 3800);

    return () => clearInterval(interval);
  }, [isPaused, services.length]);

  const activeService = services[active] ?? services[0];
  if (!activeService) return null;

  const currentImage = getServiceImage(activeService.slug);

  return (
    <section id="services" className="relative w-full overflow-hidden py-20 sm:py-28 md:py-32 bg-[#efeee9]">
      {/* Section Header */}
      <div className="site-grid mb-6 sm:mb-8">
        <h2 className="font-cal text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-ink">
          What we do
        </h2>
      </div>

      {/* Horizontal Service Tabs Bar */}
      <div className="site-grid border-t border-black/10 py-3 sm:py-5">
        <div className="flex items-center justify-start md:justify-between gap-4 sm:gap-8 overflow-x-auto no-scrollbar py-1">
          {services.map((service, idx) => {
            const isActive = active === idx;
            return (
              <button
                key={service.slug}
                onClick={() => {
                  setActive(idx);
                }}
                className={cn(
                  "group flex items-center gap-2 font-display text-sm sm:text-base md:text-lg transition-all duration-300 cursor-pointer select-none whitespace-nowrap",
                  isActive ? "text-[#ff4d00] font-bold" : "text-muted hover:text-ink font-medium"
                )}
              >
                {isActive && (
                  <span className="h-2 w-2 rounded-full bg-[#ff4d00] animate-pulse" />
                )}
                <span>{service.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Center Stage with Background Marquee & Center Floating Card */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full py-8 sm:py-12 md:py-16 flex items-center justify-center overflow-hidden"
      >
        {/* Background Scrolling Marquee of Current Active Service - Smaller & Balanced */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden pointer-events-none select-none z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeService.slug + "-marquee"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex shrink-0 items-center whitespace-nowrap"
            >
              <motion.div
                className="flex shrink-0 items-center whitespace-nowrap will-change-transform font-cal text-5xl sm:text-6xl md:text-7xl lg:text-[84px] xl:text-[92px] font-bold text-[#ff4d00] tracking-tight leading-none"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  duration: 20,
                  ease: "linear",
                  repeat: Infinity,
                }}
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center shrink-0">
                    <span className="px-3 sm:px-4">{activeService.title}</span>
                    <span className="mx-4 sm:mx-6 md:mx-8 text-[0.6em] opacity-80 leading-none">
                      ✖
                    </span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Center Floating Card with that Service's Specific Image (Foreground, High z-index) */}
        <div className="relative z-10 mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeService.slug + "-card"}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={`/services/${activeService.slug}`}
                className="group relative block w-[calc(100vw-48px)] sm:w-[420px] md:w-[500px] lg:w-[560px] aspect-[16/10] rounded-2xl sm:rounded-[32px] overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.22)] border border-white/20 bg-black"
              >
                <Image
                  src={currentImage}
                  alt={activeService.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 560px"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Description & Deliverables Chips Below Card */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="site-grid"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeService.slug + "-details"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="mx-auto max-w-2xl text-center space-y-4 sm:space-y-5"
          >
            <p className="font-display text-sm sm:text-base text-muted font-normal leading-relaxed">
              {activeService.description}
            </p>

            {activeService.deliverables && activeService.deliverables.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                {activeService.deliverables.map((item: string) => (
                  <Link
                    key={item}
                    href={`/services/${activeService.slug}`}
                    className="rounded-full bg-[#52565b] px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-medium text-white shadow-xs transition-all duration-300 hover:bg-[#ff4d00] hover:shadow-[0_6px_20px_rgba(255,77,0,0.35)] hover:-translate-y-0.5 active:translate-y-0 select-none"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
