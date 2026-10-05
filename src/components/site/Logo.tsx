import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showIcon = true,
  iconSize = 46,
  compact = false,
}: {
  className?: string;
  showIcon?: boolean;
  iconSize?: number;
  compact?: boolean;
}) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-3.5", className)}>
      {showIcon ? (
        <div
          className="relative shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-white p-0.5 shadow-[0_3px_14px_rgba(0,0,0,0.08)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_8px_26px_rgba(255,77,20,0.32)]"
          style={{ width: iconSize, height: iconSize }}
        >
          <Image
            src="/brand/wasshoticon.png"
            alt="WasShot Media Icon"
            width={iconSize}
            height={iconSize}
            priority
            className="h-full w-full object-cover rounded-[13px]"
          />
        </div>
      ) : null}
      <div className="flex flex-col text-left">
        <span className="display text-2xl sm:text-[1.72rem] font-black tracking-[-0.035em] text-ink transition-colors group-hover:text-orange leading-none">
          WasShot<span className="text-orange">.</span>
        </span>
        {!compact ? (
          <span className="text-[10px] uppercase tracking-[0.26em] font-extrabold text-muted/90 leading-none mt-1.5">
            Media
          </span>
        ) : null}
      </div>
    </Link>
  );
}

export function BrandEmblem({
  size = 120,
  className,
  showGlow = true,
}: {
  size?: number;
  className?: string;
  showGlow?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative shrink-0 overflow-hidden rounded-full border border-orange/40 bg-black transition-all duration-500 hover:scale-105",
        showGlow && "shadow-[0_8px_32px_rgba(255,77,20,0.28)] hover:shadow-[0_12px_48px_rgba(255,77,20,0.45)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand/wasshotlogo.png"
        alt="WasShot Media Official Emblem"
        width={size}
        height={size}
        priority
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
    </div>
  );
}

export function BrandIconBadge({
  size = 48,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-white p-0.5 shadow-sm transition-transform duration-300 hover:scale-105",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand/wasshoticon.png"
        alt="WasShot Icon"
        width={size}
        height={size}
        className="h-full w-full object-cover rounded-xl"
      />
    </div>
  );
}

export function ArrowLink({
  href,
  children,
  variant = "dark",
  className,
}: {
  href: string;
  children: string;
  variant?: "dark" | "light" | "ghost";
  className?: string;
}) {
  const styles = {
    dark: "bg-ink text-white hover:bg-orange",
    light: "bg-white text-ink hover:bg-orange hover:text-white",
    ghost: "bg-transparent text-ink hover:text-orange",
  };
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-colors duration-300",
        styles[variant],
        className,
      )}
    >
      {children}
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}
