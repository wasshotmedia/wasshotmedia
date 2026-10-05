"use client";

import React from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useAnimationFrame,
  useMotionValue,
} from "motion/react";

interface RibbonProps {
  items: string[];
  baseVelocity: number;
  bgColor: string;
  rotation: string;
  zIndex: number;
  shadowClass?: string;
}

function CrossIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function MarqueeTrack({
  items,
  baseVelocity = -0.06,
  bgColor,
  rotation,
  zIndex,
  shadowClass = "",
}: RibbonProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });

  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  // Duplicate items twice per track block
  const sequence = [...items, ...items];

  useAnimationFrame((_, delta) => {
    const factor = delta / 16;
    let moveBy = baseVelocity * factor;
    const v = velocityFactor.get();
    if (v) {
      moveBy += (baseVelocity < 0 ? -1 : 1) * Math.abs(v) * 0.035 * factor;
    }

    let nextX = baseX.get() + moveBy;
    if (nextX <= -50) {
      nextX += 50;
    } else if (nextX >= 0) {
      nextX -= 50;
    }
    baseX.set(nextX);
  });

  const xTransform = useTransform(baseX, (v) => `${v}%`);

  return (
    <div
      className={`absolute left-[-20vw] w-[140vw] flex items-center overflow-hidden py-3.5 sm:py-4 md:py-5 border-y select-none pointer-events-none ${bgColor} ${shadowClass}`}
      style={{
        transform: `rotate(${rotation})`,
        transformOrigin: "center center",
        zIndex,
      }}
    >
      <motion.div
        className="flex shrink-0 items-center whitespace-nowrap will-change-transform"
        style={{ x: xTransform }}
      >
        {/* First Half */}
        <div className="flex shrink-0 items-center">
          {sequence.map((item, idx) => (
            <div key={`a-${idx}`} className="flex items-center">
              <span className="font-cal text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-bold tracking-tight text-white px-2">
                {item}
              </span>
              <span className="mx-3 sm:mx-5 md:mx-6 inline-flex items-center text-white/80">
                <CrossIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              </span>
            </div>
          ))}
        </div>

        {/* Second Half (Exact Mirror for 100% Seamless Infinite Loop) */}
        <div className="flex shrink-0 items-center">
          {sequence.map((item, idx) => (
            <div key={`b-${idx}`} className="flex items-center">
              <span className="font-cal text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-bold tracking-tight text-white px-2">
                {item}
              </span>
              <span className="mx-3 sm:mx-5 md:mx-6 inline-flex items-center text-white/80">
                <CrossIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function ServicesRibbonMarquee() {
  const ORANGE_SERVICES = [
    "Cinematic Shooting",
    "Video Editing",
    "Website Design",
    "Brand Campaigns",
    "SEO & Digital Growth",
    "Creative Strategy",
  ];

  const BLACK_SERVICES = [
    "Commercial Video Production",
    "Custom Web Engineering",
    "Hollywood Color Science",
    "High-Impact Social Ads",
    "Interactive Web Experiences",
    "Creative Direction",
  ];

  return (
    <section className="relative w-full overflow-hidden py-24 sm:py-32 md:py-36 flex items-center justify-center">
      {/* Tape 2: Black Ribbon (Bottom Layer: Rotated -5.5deg, Moving Left) */}
      <MarqueeTrack
        items={BLACK_SERVICES}
        baseVelocity={-0.05}
        bgColor="bg-[#0f0f0f] border-white/10"
        rotation="-5.5deg"
        zIndex={1}
        shadowClass="shadow-2xl"
      />

      {/* Tape 1: Orange Ribbon (Top Layer: Rotated +5.5deg, Overlapping with Drop Shadow) */}
      <MarqueeTrack
        items={ORANGE_SERVICES}
        baseVelocity={-0.07}
        bgColor="bg-[#ff4d00] border-white/20"
        rotation="5.5deg"
        zIndex={2}
        shadowClass="shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
      />
    </section>
  );
}
