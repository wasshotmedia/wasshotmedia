"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandEmblem } from "@/components/site/Logo";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@wasshotmedia.com");
  const [password, setPassword] = useState("WasshotAdmin2026!");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed. Check your credentials.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to communicate with authentication server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#efeee9] px-4 py-12 text-ink selection:bg-orange selection:text-white">
      <div className="mx-auto w-full max-w-md">
        {/* Brand Emblem */}
        <div className="flex flex-col items-center text-center">
          <BrandEmblem size={96} className="shadow-[0_12px_36px_rgba(255,77,20,0.35)]" />
          <h1 className="display mt-6 text-3xl font-extrabold text-ink">
            WasShot Admin
          </h1>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted">
            Studio Command Center Login
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 rounded-3xl border border-black/[0.08] bg-white p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-black/10 bg-[#efeee9]/40 px-4 py-3 text-sm text-ink placeholder-muted focus:border-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange/20"
                placeholder="admin@wasshotmedia.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-black/10 bg-[#efeee9]/40 px-4 py-3 text-sm text-ink placeholder-muted focus:border-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange/20"
                placeholder="••••••••••••"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-white transition hover:bg-orange disabled:opacity-50"
            >
              {submitting ? "Verifying..." : "Sign In to Studio Admin →"}
            </button>
          </form>

          <div className="mt-6 border-t border-black/[0.06] pt-4 text-center">
            <p className="text-[11px] text-muted">
              Pre-configured Owner Account:{" "}
              <code className="rounded bg-black/[0.04] px-1.5 py-0.5 font-sans font-bold text-ink">
                admin@wasshotmedia.com
              </code>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"
          >
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
