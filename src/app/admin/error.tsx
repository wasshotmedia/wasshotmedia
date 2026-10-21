"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LogIn, ArrowLeft } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Studio Admin Error Boundary Caught]:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md rounded-3xl border border-[#e8e8e3] bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 text-orange">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <span className="mt-4 inline-block font-display text-[10px] uppercase tracking-widest text-orange font-bold">
          Studio Administration
        </span>

        <h2 className="mt-2 text-xl font-extrabold text-ink">
          Dashboard Session Notice
        </h2>

        <p className="mt-2 text-xs text-muted leading-relaxed">
          The studio management panel encountered an unexpected state. You can reload the view or re-authenticate your session.
        </p>

        {process.env.NODE_ENV !== "production" && error?.message && (
          <div className="mt-3 rounded-xl bg-black/[0.04] p-3 text-left font-mono text-[11px] text-red-600 break-words">
            {error.message}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <button
            onClick={() => {
              try {
                reset();
              } catch {
                window.location.reload();
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#e03d07]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reload Dashboard</span>
          </button>

          <button
            onClick={() => {
              window.location.href = "/admin/login";
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e8e8e3] bg-white px-5 py-2.5 text-xs font-bold text-ink transition hover:bg-black/[0.04]"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In Again</span>
          </button>
        </div>

        <div className="mt-6 border-t border-[#f0f0eb] pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
