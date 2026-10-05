"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUp,
  ArrowUpRight,
  Clock,
  Copy,
  Check,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { Logo, BrandEmblem } from "./Logo";
import { LiquidMetalButton } from "./LiquidMetalButton";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function SiteFooter({
  tagline = "WE CREATE. YOU GROW.",
  email,
  phone,
  whatsapp,
  instagram,
  linkedin,
}: {
  tagline?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  linkedin?: string;
}) {
  const year = new Date().getFullYear();
  const [copied, setCopied] = useState(false);
  const [istTime, setIstTime] = useState<string>("");

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setIstTime(new Intl.DateTimeFormat("en-US", options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const displayEmail = email || "wasshotmedia@gmail.com";
  const displayPhone = phone || "+91 7396986817";
  const displayPhone2 = "+91 7330820239";
  const displayWhatsapp = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}`
    : "https://wa.me/917396986817";
  const displayInstagram = instagram || "https://instagram.com/wasshotmedia";
  const displayLinkedin = linkedin || "https://linkedin.com/company/wasshotmedia";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(displayEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative mt-24 border-t border-black/[0.08] bg-[#efeee9] text-ink selection:bg-orange selection:text-white">
      {/* Top CTA Callout Card matching website cream palette */}
      <div className="site-grid pt-16 md:pt-24">
        <div className="rounded-[32px] border border-black/[0.08] bg-white p-8 shadow-[0_20px_50px_rgba(17,17,17,0.04)] md:p-14">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-600/20 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-800">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
                </span>
                <span>AVAILABLE FOR NEW COMMISSIONS & PROJECTS</span>
              </div>

              <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
                <BrandEmblem size={96} className="hidden sm:block shadow-[0_12px_40px_rgba(255,77,20,0.35)]" />
                <h2 className="display text-4xl leading-[1.04] md:text-5xl lg:text-6xl">
                  Ready to build work that <span className="text-orange">commands attention?</span>
                </h2>
              </div>

              <p className="mt-5 max-w-xl text-base text-muted md:text-lg">
                Whether you need cinematic video production, a custom high-performance website, or complete brand strategy — let&apos;s make it memorable.
              </p>
            </div>

            <div className="flex flex-col gap-3.5 sm:flex-row lg:flex-col xl:flex-row">
              <LiquidMetalButton
                label="Start a Project →"
                href="/contact"
                size="lg"
              />

              <a
                href={displayWhatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-full border border-black/10 bg-[#efeee9] px-7 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:border-black/25 hover:bg-white"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Studio Pulse / Info Row */}
          <div className="mt-12 grid gap-4 border-t border-black/[0.08] pt-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#efeee9] text-orange">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted">Studio Location</p>
                <p className="text-sm font-semibold text-ink">Vijayawada, India</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#efeee9] text-orange">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted">Studio Local Time</p>
                <p className="font-display text-sm font-bold text-ink tracking-wide">
                  {istTime ? `${istTime} IST` : "10:30 AM IST (UTC+5:30)"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#efeee9] text-orange">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted">Direct Mail</p>
                <button
                  onClick={handleCopyEmail}
                  suppressHydrationWarning
                  className="flex items-center gap-1.5 text-sm font-semibold text-ink transition hover:text-orange"
                  title="Click to copy email address"
                >
                  <span className="truncate">{displayEmail}</span>
                  {copied ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 shrink-0 text-muted" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#efeee9] text-orange">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted">Response Time</p>
                <p className="text-sm font-semibold text-ink">Within 24 Hours Guaranteed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Directory Navigation Grid */}
        <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-2">
            <Logo iconSize={48} className="mb-2" />
            <p className="mt-4 font-display text-xs uppercase tracking-[0.2em] text-orange font-bold">
              {tagline}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              An independent creative media and digital engineering studio. We unite cinematic visuals, bespoke web software, and organic growth distribution under one roof.
            </p>

            {/* Social Channels */}
            <div className="mt-8 flex flex-wrap gap-2.5">
              <a
                href={displayInstagram}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-ink transition hover:border-orange hover:bg-orange hover:text-white"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href={displayWhatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-ink transition hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href={displayLinkedin}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-ink transition hover:border-orange hover:bg-orange hover:text-white"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
              <a
                href={`mailto:${displayEmail}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-ink transition hover:border-orange hover:bg-orange hover:text-white"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Navigation Col */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Explore
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/" className="text-ink/80 transition hover:text-orange">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-ink/80 transition hover:text-orange">
                  About Studio
                </Link>
              </li>
              <li>
                <Link href="/work" className="text-ink/80 transition hover:text-orange">
                  Selected Work
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-ink/80 transition hover:text-orange">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-ink/80 transition hover:text-orange">
                  Contact & Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Col */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Capabilities
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/services/shooting" className="text-ink/80 transition hover:text-orange">
                  Cinematic Production
                </Link>
              </li>
              <li>
                <Link href="/services/video-editing" className="text-ink/80 transition hover:text-orange">
                  Video Post & Color
                </Link>
              </li>
              <li>
                <Link href="/services/website-development" className="text-ink/80 transition hover:text-orange">
                  Custom Web Engineering
                </Link>
              </li>
              <li>
                <Link href="/services/seo" className="text-ink/80 transition hover:text-orange">
                  SEO & Search Strategy
                </Link>
              </li>
              <li>
                <Link href="/services/promotions" className="text-ink/80 transition hover:text-orange">
                  Promotions & Distribution
                </Link>
              </li>
              <li>
                <Link href="/services/strategy" className="text-ink/80 transition hover:text-orange">
                  Creative Brand Strategy
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust Col */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Legals & Trust
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="text-ink/80 transition hover:text-orange">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-ink/80 transition hover:text-orange">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href={`tel:${displayPhone.replace(/\s+/g, "")}`}
                  className="text-ink/80 transition hover:text-orange"
                >
                  {displayPhone}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${displayPhone2.replace(/\s+/g, "")}`}
                  className="text-ink/80 transition hover:text-orange"
                >
                  {displayPhone2}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${displayEmail}`}
                  className="text-ink/80 transition hover:text-orange"
                >
                  {displayEmail}
                </a>
              </li>
              <li>
                <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-medium text-muted border border-black/[0.08]">
                  AP, India & Global Remote
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Massive Infinite Smooth Scrolling WASSHOT MEDIA Ticker */}
      <div className="relative mt-20 overflow-hidden border-y border-black/[0.08] bg-[#e7e6e0]/60 py-6 select-none">
        <div className="flex w-max animate-ticker whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-4">
              <span className="display text-6xl font-black uppercase tracking-tight text-ink/20 md:text-8xl lg:text-9xl transition hover:text-orange">
                WASSHOT MEDIA
              </span>
              <span className="text-2xl font-bold text-orange md:text-4xl">★</span>
              <span className="display text-6xl font-black uppercase tracking-tight text-orange/30 md:text-8xl lg:text-9xl">
                WE CREATE. YOU GROW.
              </span>
              <span className="text-2xl font-bold text-orange md:text-4xl">★</span>
              <span className="display text-6xl font-black uppercase tracking-tight text-ink/20 md:text-8xl lg:text-9xl">
                CINEMATIC × DIGITAL
              </span>
              <span className="text-2xl font-bold text-orange md:text-4xl">★</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-Footer Bottom Bar */}
      <div className="site-grid flex flex-col items-center justify-between gap-4 py-8 text-xs text-muted sm:flex-row">
        <p>© {year} WasShot Media. All Rights Reserved.</p>
        <p className="hidden md:block">
          Crafted with precision for bold brands.
        </p>
        <button
          onClick={scrollToTop}
          suppressHydrationWarning
          className="group inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 font-medium text-ink transition-all duration-300 hover:border-orange hover:bg-orange hover:text-white"
        >
          <span>Back to top</span>
          <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </button>
      </div>

      {/* Marquee Animation Keyframes */}
      <style>{`
        @keyframes footerTicker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-ticker {
          animation: footerTicker 32s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-ticker {
            animation: none !important;
          }
        }
      `}</style>
    </footer>
  );
}
