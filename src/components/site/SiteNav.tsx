"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Logo } from "./Logo";
import { LiquidMetalButton } from "./LiquidMetalButton";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteNav({
  available,
  availabilityLabel,
}: {
  available?: boolean;
  availabilityLabel?: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setHoveredHref(null);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Main Navbar Header */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-[#efeee9]/90 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl border-b border-black/[0.06]"
            : "bg-transparent py-5 pt-6",
        )}
      >
        <div className="site-grid flex items-center justify-between">
          {/* Logo with official 3D ribbon emblem */}
          <div className="flex items-center">
            <Logo iconSize={46} />
          </div>

          {/* Center Navigation Dock with Sliding Spring Indicators */}
          <nav
            className="hidden items-center gap-1 rounded-full border border-black/[0.08] bg-white/80 p-1.5 shadow-[0_6px_28px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-2xl ring-1 ring-white/80 ring-inset md:flex relative transition-all duration-300"
            onMouseLeave={() => setHoveredHref(null)}
            aria-label="Primary"
          >
            {links.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(link.href + "/");

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHoveredHref(link.href)}
                  className="relative group rounded-full px-4 py-1.5 text-xs font-semibold select-none outline-none focus-visible:ring-2 focus-visible:ring-orange"
                >
                  {/* Sliding Hover Indicator */}
                  {hoveredHref === link.href && !isActive && (
                    <motion.span
                      layoutId="navHoverPill"
                      className="absolute inset-0 rounded-full bg-black/[0.05] border border-black/[0.04]"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}

                  {/* Sliding Active Pill with Luxury Satin Highlight */}
                  {isActive && (
                    <motion.span
                      layoutId="navActivePill"
                      className="absolute inset-0 rounded-full bg-[#121212] shadow-[0_2px_10px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.15)]"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    >
                      {/* Top Satin Rim Highlight */}
                      <span className="absolute inset-x-2.5 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />
                    </motion.span>
                  )}

                  {/* Label with Spring Tap Feedback */}
                  <motion.span
                    className={cn(
                      "relative z-10 block transition-colors duration-200",
                      isActive
                        ? "text-white font-semibold"
                        : "text-ink/75 group-hover:text-ink font-medium",
                    )}
                    whileTap={{ scale: 0.94 }}
                  >
                    {link.label}
                  </motion.span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Special Liquid Metal Shader Button */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <LiquidMetalButton label="Let's Talk" href="/contact" />
            </div>

            {/* Mobile Hamburger Trigger */}
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/90 backdrop-blur-md md:hidden"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">Menu</span>
              <span className="flex flex-col gap-1.5">
                <span
                  className={cn(
                    "block h-0.5 w-4 bg-ink transition-all duration-300",
                    open && "translate-y-[4px] rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "block h-0.5 w-4 bg-ink transition-all duration-300",
                    open && "-translate-y-[4px] -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-30 flex flex-col justify-between overflow-y-auto max-h-[100dvh] bg-[#efeee9] px-6 sm:px-8 pb-10 pt-24 transition-transform duration-500 md:hidden",
          open ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <div>
          <div className="mb-6 border-b border-black/[0.08] pb-5">
            <Logo iconSize={40} />
          </div>

          <nav className="flex flex-col gap-4 sm:gap-5" aria-label="Mobile">
            {links.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(link.href + "/");

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "display text-3xl sm:text-4xl py-1 transition-colors flex items-center justify-between",
                    isActive ? "text-orange" : "text-ink hover:text-orange",
                  )}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-orange animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-8 mt-auto">
          <LiquidMetalButton
            label="Let's Talk →"
            href="/contact"
            className="w-full"
          />
        </div>
      </div>
    </>
  );
}
