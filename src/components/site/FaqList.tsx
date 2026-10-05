"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { BlurSlideText } from "./Reveal";
import type { PublicContent } from "@/lib/content";
import { cn } from "@/lib/utils";

export function FaqList({ faqs }: { faqs: PublicContent["faqs"] }) {
  // Allow independent toggling of questions, defaulting to second question expanded (matching template)
  const [openIndices, setOpenIndices] = useState<number[]>([1]);

  const toggle = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Distribute faqs into 2 columns for clean layout
  const col1 = faqs.filter((_, i) => i % 2 === 0);
  const col2 = faqs.filter((_, i) => i % 2 === 1);

  return (
    <section className="site-grid py-24 md:py-32">
      {/* Centered Header with Framer-style Right-to-Left Blur Motion Reveal */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">(FAQs)</p>
        <h2 className="display mt-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-[-0.04em] text-ink">
          <BlurSlideText text="Your Questions, Answered" />
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted max-w-xl mx-auto">
          Helping you understand our process and offerings at WasShot.
        </p>
      </div>

      {/* Two-Column Rounded FAQ Cards */}
      <div className="mt-14 grid gap-4 md:grid-cols-2 items-start">
        {/* Column 1 */}
        <div className="space-y-4">
          {col1.map((faq, originalIndex) => {
            const actualIndex = originalIndex * 2;
            const expanded = openIndices.includes(actualIndex);
            return (
              <FaqCard
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                expanded={expanded}
                onToggle={() => toggle(actualIndex)}
              />
            );
          })}
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          {col2.map((faq, originalIndex) => {
            const actualIndex = originalIndex * 2 + 1;
            const expanded = openIndices.includes(actualIndex);
            return (
              <FaqCard
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                expanded={expanded}
                onToggle={() => toggle(actualIndex)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FaqCard({
  question,
  answer,
  expanded,
  onToggle,
}: {
  question: string;
  answer: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "group rounded-[24px] bg-white p-6 sm:p-7 border transition-all duration-300",
        expanded
          ? "border-orange/30 shadow-[0_12px_36px_rgba(255,77,20,0.08)]"
          : "border-black/[0.08] shadow-xs hover:border-black/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
      )}
    >
      <h3>
        <button
          type="button"
          onClick={onToggle}
          suppressHydrationWarning
          className="flex w-full items-center justify-between gap-4 text-left font-bold text-base sm:text-lg text-ink transition-colors group-hover:text-orange"
          aria-expanded={expanded}
        >
          <span className="leading-snug">{question}</span>
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300",
              expanded
                ? "bg-orange text-white rotate-0"
                : "bg-black/5 text-ink/70 group-hover:bg-orange group-hover:text-white"
            )}
          >
            {expanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </span>
        </button>
      </h3>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pt-3.5 text-sm sm:text-[15px] leading-relaxed text-muted">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
