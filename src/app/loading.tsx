import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-between p-6 sm:p-10 md:p-12 select-none bg-[#f5f4ef] text-ink">
      {/* Soft warm studio background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[380px] w-[380px] rounded-full bg-orange/10 blur-[100px]" />
      </div>

      {/* Top Studio Header */}
      <div className="relative z-10 flex items-center justify-between text-xs sm:text-sm text-muted font-medium">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange" />
          <span className="font-semibold text-ink">WasShot Media</span>
          <span className="text-black/20">·</span>
          <span className="hidden sm:inline text-muted">Creative Studio</span>
        </div>
        <div className="text-xs text-muted">
          <span>Vijayawada, India</span>
        </div>
      </div>

      {/* Center Studio Stage */}
      <div className="relative z-10 mx-auto my-auto flex flex-col items-center text-center max-w-lg px-4">
        {/* Clean Crafted Emblem */}
        <div className="relative mb-6">
          <div className="relative h-20 w-20 md:h-24 md:w-24 overflow-hidden rounded-full border border-black/10 bg-white p-1 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            <Image
              src="/brand/wasshotlogo.png"
              alt="WasShot Logo"
              width={96}
              height={96}
              priority
              className="h-full w-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* Display Headline */}
        <h1 className="display text-6xl sm:text-7xl md:text-8xl tracking-[-0.04em] text-ink leading-none">
          WasShot<span className="text-orange">.</span>
        </h1>

        {/* Studio Tagline */}
        <p className="mt-4 text-base sm:text-lg font-medium text-muted max-w-md">
          Stories that look good. <span className="text-ink font-semibold">Experiences that work.</span>
        </p>

        {/* Sleek Progress Bar */}
        <div className="mt-9 w-64 sm:w-72 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-muted font-medium">
            <span>Loading studio</span>
            <span className="h-1.5 w-1.5 rounded-full bg-orange animate-pulse" />
          </div>

          {/* Minimal 2px Progress Line */}
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-black/10">
            <div className="h-full w-2/3 bg-orange rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Bottom Editorial Footer */}
      <div className="relative z-10 flex items-center justify-between text-xs sm:text-sm text-muted font-medium">
        <div className="hidden sm:block text-muted">
          <span>Film · Production · Digital</span>
        </div>
        <div className="ml-auto text-muted text-xs">
          <span>WasShot Creative Production</span>
        </div>
      </div>
    </div>
  );
}
