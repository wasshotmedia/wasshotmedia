"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: { opacity: 0, y: 28 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}

export function BlurSlideText({
  text,
  className,
  delay = 0,
  stagger,
  duration,
  distance = 70,
  by = "word",
  trigger = "inView",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  distance?: number;
  by?: "word" | "character";
  trigger?: "inView" | "mount";
}) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;

  if (by === "character") {
    const chars = Array.from(text);
    const itemStagger = stagger ?? 0.03;
    const itemDuration = duration ?? 0.75;
    return (
      <span className={className}>
        {chars.map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, x: distance, filter: "blur(14px)" }}
            {...(trigger === "mount"
              ? { animate: { opacity: 1, x: 0, filter: "blur(0px)" } }
              : {
                  whileInView: { opacity: 1, x: 0, filter: "blur(0px)" },
                  viewport: { once: true, amount: 0.05 },
                })}
            transition={{
              duration: itemDuration,
              delay: delay + i * itemStagger,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block will-change-transform will-change-filter"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </span>
    );
  }

  const words = text.split(" ");
  const itemStagger = stagger ?? 0.07;
  const itemDuration = duration ?? 0.85;
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, x: distance, filter: "blur(16px)" }}
          {...(trigger === "mount"
            ? { animate: { opacity: 1, x: 0, filter: "blur(0px)" } }
            : {
                whileInView: { opacity: 1, x: 0, filter: "blur(0px)" },
                viewport: { once: true, amount: 0.05 },
              })}
          transition={{
            duration: itemDuration,
            delay: delay + i * itemStagger,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block mr-[0.28em] last:mr-0 will-change-transform will-change-filter"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
