"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandEmblem } from "@/components/site/Logo";
import { ShieldCheck, ArrowRight, KeyRound, Mail, X, CheckCircle2, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("praneethbadugu7781@gmail.com");
  const [password, setPassword] = useState("WasShot@2026");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // OTP Forgot / Reset Password Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpStep, setOtpStep] = useState<"request" | "verify">("request");
  const [otpEmail, setOtpEmail] = useState("praneethbadugu7781@gmail.com");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
        // Hard redirect to ensure session cookie is committed and refreshed
        window.location.href = "/admin";
      }
    } catch (err: any) {
      setError(err.message || "Failed to communicate with authentication server.");
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setOtpMessage({ type: "error", text: data.error || "Failed to send OTP." });
      } else {
        setOtpMessage({ type: "success", text: data.message || "OTP code sent to your email!" });
        setOtpStep("verify");
      }
    } catch (err: any) {
      setOtpMessage({ type: "error", text: err.message || "Server error while requesting OTP." });
    } finally {
      setOtpLoading(false);
    }
  };

  // 2. Verify OTP & Reset Password
  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setOtpMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setOtpMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }

    setOtpLoading(true);
    setOtpMessage(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: otpEmail.trim(),
          otp: otpCode.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setOtpMessage({ type: "error", text: data.error || "Password reset failed." });
      } else {
        // Success
        alert("Password updated successfully! You can now sign in with your new password.");
        setEmail(otpEmail);
        setPassword(newPassword);
        setShowOtpModal(false);
        setOtpStep("request");
        setOtpCode("");
        setNewPassword("");
        setConfirmPassword("");
        setOtpMessage(null);
      }
    } catch (err: any) {
      setOtpMessage({ type: "error", text: err.message || "Server error resetting password." });
    } finally {
      setOtpLoading(false);
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

        {/* Account Switcher Pills */}
        <div className="mt-6 flex rounded-2xl bg-black/[0.04] p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setEmail("praneethbadugu7781@gmail.com");
              setPassword("WasShot@2026");
              setOtpEmail("praneethbadugu7781@gmail.com");
            }}
            className={`flex-1 rounded-xl py-2 font-bold transition text-center ${
              email === "praneethbadugu7781@gmail.com"
                ? "bg-white text-ink shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            Praneeth Badugu
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("wassemakram6114@gmail.com");
              setPassword("WasShot@2026");
              setOtpEmail("wassemakram6114@gmail.com");
            }}
            className={`flex-1 rounded-xl py-2 font-bold transition text-center ${
              email === "wassemakram6114@gmail.com"
                ? "bg-white text-ink shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            Waseem Akram
          </button>
        </div>

        {/* Login Card */}
        <div className="mt-4 rounded-3xl border border-black/[0.08] bg-white p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)]">
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
                placeholder="praneethbadugu7781@gmail.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                  Admin Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setOtpEmail(email);
                    setShowOtpModal(true);
                  }}
                  className="text-xs font-bold text-orange hover:underline flex items-center gap-1"
                >
                  <KeyRound className="h-3 w-3" />
                  <span>Reset via OTP</span>
                </button>
              </div>
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
              className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-white transition hover:bg-orange disabled:opacity-50 shadow-xs"
            >
              {submitting ? "Verifying..." : "Sign In to Studio Admin →"}
            </button>
          </form>

          <div className="mt-6 border-t border-black/[0.06] pt-4 text-center space-y-1">
            <p className="text-[11px] text-muted">
              Default password: <code className="font-mono font-bold text-ink">WasShot@2026</code>
            </p>
            <p className="text-[11px] text-muted">
              Forgot or changing password? Click{" "}
              <button
                type="button"
                onClick={() => {
                  setOtpEmail(email);
                  setShowOtpModal(true);
                }}
                className="font-bold text-orange hover:underline"
              >
                Reset via OTP
              </button>
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

      {/* ======================================================== */}
      {/* OTP RESET PASSWORD MODAL                                 */}
      {/* ======================================================== */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-[#e8e8e3] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange/10 text-orange">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-ink">
                    Admin Password Reset
                  </h3>
                  <p className="text-[11px] text-muted">6-digit email OTP verification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpMessage(null);
                }}
                className="rounded-full p-1 text-muted hover:bg-black/[0.05] hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {otpMessage && (
              <div
                className={`mt-4 rounded-xl p-3 text-xs ${
                  otpMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {otpMessage.text}
              </div>
            )}

            {otpStep === "request" ? (
              <form onSubmit={handleRequestOtp} className="mt-4 space-y-4">
                <p className="text-xs text-muted leading-relaxed">
                  Enter your registered administrator email address. We will send a secure 6-digit one-time password (OTP) valid for 10 minutes.
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                    Administrator Email
                  </label>
                  <input
                    type="email"
                    required
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] px-3.5 py-2.5 text-xs text-ink focus:border-orange focus:outline-none"
                    placeholder="praneethbadugu7781@gmail.com"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="rounded-full border border-[#e8e8e3] px-4 py-2 text-xs font-semibold text-muted hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="rounded-full bg-orange px-5 py-2 text-xs font-bold text-white hover:bg-[#e03d07] transition disabled:opacity-50 shadow-xs"
                  >
                    {otpLoading ? "Sending OTP..." : "Send Verification OTP →"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpAndReset} className="mt-4 space-y-4">
                <div className="rounded-xl bg-[#fafaf8] p-3 border border-[#ecece8] text-xs">
                  <span className="text-muted">OTP sent to: </span>
                  <strong className="text-ink">{otpEmail}</strong>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep("request");
                      setOtpMessage(null);
                    }}
                    className="ml-2 text-orange font-bold hover:underline text-[11px]"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                    6-Digit Verification Code (OTP) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full text-center tracking-[8px] font-mono font-bold text-xl rounded-xl border border-[#e8e8e3] py-2 text-ink focus:border-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                    New Admin Password * (min 8 chars)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] px-3.5 py-2 text-xs text-ink focus:border-orange focus:outline-none"
                    placeholder="Enter new strong password"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] px-3.5 py-2 text-xs text-ink focus:border-orange focus:outline-none"
                    placeholder="Re-enter new password"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOtpStep("request")}
                    className="rounded-full border border-[#e8e8e3] px-4 py-2 text-xs font-semibold text-muted hover:text-ink"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50 shadow-xs"
                  >
                    {otpLoading ? "Verifying..." : "Update Password & Sign In"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
