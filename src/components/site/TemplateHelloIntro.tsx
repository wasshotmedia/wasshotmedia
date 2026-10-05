"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";

function PaletteIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

function GlobeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function PenIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 2 4 4-14 14H4v-4L18 2z" />
      <path d="m14.5 5.5 4 4" />
    </svg>
  );
}

function InterfaceIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="14" x="3" y="5" rx="2" />
      <path d="M7 9h10" />
    </svg>
  );
}

function StrategyIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.25" />
    </svg>
  );
}

const ROW_1_CHIPS = [
  { label: "Branding", icon: PaletteIcon, href: "/services" },
  { label: "Logo", icon: GlobeIcon, href: "/services" },
  { label: "Website", icon: GlobeIcon, href: "/services/website-development" },
];

const ROW_2_CHIPS = [
  { label: "Illustration", icon: PenIcon, href: "/services" },
  { label: "Interface", icon: InterfaceIcon, href: "/services/website-development" },
  { label: "Strategy", icon: StrategyIcon, href: "/services" },
];

interface TemplateHelloIntroProps {
  lines?: string[];
  support?: string;
}

export function TemplateHelloIntro({ lines, support }: TemplateHelloIntroProps) {
  // Check if user provided custom headline in CMS
  const hasCustomLines =
    lines &&
    lines.length > 0 &&
    lines.join(" ") !== "We help brands look better, tell better stories, and grow online.";

  return (
    <section className="relative w-full overflow-hidden py-16 sm:py-28 md:py-36 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl text-center">
        {/* (hello) Eyebrow in Orange Cursive Script */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 sm:mb-7 flex justify-center"
        >
          <span className="font-handwriting text-2xl sm:text-4xl text-[#ff4d00] select-none tracking-wide">
            (hello)
          </span>
        </motion.div>

        {/* Big Headline with Two-Tone Black & Slate-Grey Typography */}
        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-cal mx-auto max-w-4xl text-2xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[58px] font-bold tracking-tight leading-[1.22] sm:leading-[1.16]"
        >
          {hasCustomLines ? (
            <span className="text-[#111111]">{lines.join(" ")}</span>
          ) : (
            <>
              <span className="text-[#111111]">
                We help fast moving digital startups launch sharper brands{" "}
              </span>
              <span className="text-[#717171] font-normal">
                and websites — with clarity , speed, and no drama.
              </span>
            </>
          )}
        </motion.h2>

        {/* 6 Dark Interactive Pill Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 sm:mt-12 flex flex-col items-center gap-2 sm:gap-3"
        >
          {/* Row 1 */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {ROW_1_CHIPS.map((chip) => {
              const Icon = chip.icon;
              return (
                <Link
                  key={chip.label}
                  href={chip.href}
                  className="group inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#52565b] px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-base font-medium text-white shadow-sm transition-all duration-300 hover:bg-[#ff4d00] hover:shadow-[0_8px_20px_rgba(255,77,0,0.35)] hover:-translate-y-0.5 active:translate-y-0 select-none"
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/90 transition-transform duration-300 group-hover:scale-110" />
                  <span>{chip.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {ROW_2_CHIPS.map((chip) => {
              const Icon = chip.icon;
              return (
                <Link
                  key={chip.label}
                  href={chip.href}
                  className="group inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#52565b] px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-base font-medium text-white shadow-sm transition-all duration-300 hover:bg-[#ff4d00] hover:shadow-[0_8px_20px_rgba(255,77,0,0.35)] hover:-translate-y-0.5 active:translate-y-0 select-none"
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/90 transition-transform duration-300 group-hover:scale-110" />
                  <span>{chip.label}</span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
