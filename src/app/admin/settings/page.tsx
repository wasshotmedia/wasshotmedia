"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Users,
  Calendar,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Save,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export default function SettingsPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");

  // Studio Settings
  const [studioName, setStudioName] = useState("WasShot Media");
  const [tagline, setTagline] = useState("WE CREATE. YOU GROW.");
  const [email, setEmail] = useState("wasshotmedia@gmail.com");
  const [phones, setPhones] = useState("+91 7396986817, +91 7330820239");
  const [city, setCity] = useState("Vijayawada, Andhra Pradesh, India");
  const [instagram, setInstagram] = useState("https://instagram.com/wasshot.media");

  // Operational Preferences
  const [conflictDetection, setConflictDetection] = useState(true);
  const [reminder24h, setReminder24h] = useState(true);
  const [reminder2h, setReminder2h] = useState(true);
  const [defaultDuration, setDefaultDuration] = useState("2");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [teamRes, setRes] = await Promise.all([
        fetch("/api/admin/team").then((r) => r.json()).catch(() => ({ items: [] })),
        fetch("/api/admin/settings").then((r) => r.json()).catch(() => ({})),
      ]);

      setTeam(teamRes.items || []);
      if (setRes.settings) {
        if (setRes.settings.agencyName) setStudioName(setRes.settings.agencyName);
        if (setRes.settings.tagline) setTagline(setRes.settings.tagline);
        if (setRes.settings.primaryEmail) setEmail(setRes.settings.primaryEmail);
        if (setRes.settings.phones) setPhones(setRes.settings.phones.join(", "));
        if (setRes.settings.city) setCity(setRes.settings.city);
        if (setRes.settings.instagram) setInstagram(setRes.settings.instagram);
      }
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName: studioName,
          tagline,
          primaryEmail: email,
          phones: phones.split(",").map((s) => s.trim()).filter(Boolean),
          city,
          instagram,
        }),
      });

      if (res.ok) {
        setSavedMessage("Settings saved successfully.");
        setTimeout(() => setSavedMessage(""), 4000);
      }
    } catch (err) {
      console.error("Failed to save settings", err);
    }
  };

  return (
    <div suppressHydrationWarning className="space-y-8">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e8e8e3] pb-5 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-orange">
            Studio Configuration · Agency Operations
          </span>
          <h1 className="display text-3xl font-extrabold text-ink">
            Studio Settings
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Configure studio credentials, verified owners (Praneeth & Wasim), and automated reminder preferences.
          </p>
        </div>
      </div>

      {savedMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* 2. TEAM MEMBERS (PRANEETH & WASIM) */}
      <div className="rounded-2xl sm:rounded-3xl border border-[#e8e8e3] bg-white p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-orange" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
              Studio Owners & Executive Team
            </h2>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Active Accounts
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {team.map((member) => (
            <div
              key={member._id}
              className="rounded-2xl border border-[#e8e8e3] bg-[#fafaf8] p-4 sm:p-5 shadow-xs flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-ink text-sm">{member.name}</h3>
                  <span className="rounded-full bg-orange/10 px-2 py-0.5 text-[9px] font-bold uppercase text-orange">
                    {member.role}
                  </span>
                </div>
                <div className="mt-2 space-y-0.5 text-xs text-muted">
                  <p className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-orange" /> {member.email}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" /> Studio Executive Access
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. STUDIO VERIFIED CONTACT & HQ SETTINGS FORM */}
      <form onSubmit={handleSaveSettings} className="rounded-2xl sm:rounded-3xl border border-[#e8e8e3] bg-white p-4 sm:p-6 shadow-xs space-y-5 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e3] pb-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-orange" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
              Studio Identity & Verified Details
            </h2>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 font-bold text-white shadow-xs hover:bg-[#e03d07]"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Settings</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-ink mb-1">Agency Name</label>
            <input
              type="text"
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
              className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-ink mb-1">Official Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-ink mb-1">Primary Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-ink mb-1">Official Phone Numbers</label>
            <input
              type="text"
              value={phones}
              onChange={(e) => setPhones(e.target.value)}
              className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-ink mb-1">Location / HQ City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-ink mb-1">Official Instagram</label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/wasshot.media"
              className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </form>

      {/* 4. CALENDAR & CONFLICT DETECTION POLICIES */}
      <div className="rounded-2xl sm:rounded-3xl border border-[#e8e8e3] bg-white p-4 sm:p-6 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2 border-b border-[#e8e8e3] pb-4">
          <Calendar className="h-4 w-4 text-orange" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
            Scheduling & Conflict Engine Policies
          </h2>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-[#fafaf8] border border-[#e8e8e3]">
            <div>
              <p className="font-bold text-ink">Server-Side Double-Booking Conflict Detection</p>
              <p className="text-muted text-[11px]">
                Checks for overlapping shoots across assigned team members (Praneeth and Wasim) before saving.
              </p>
            </div>
            <span className="self-start sm:self-auto rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-700 border border-emerald-200">
              Active & Enforced
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-[#fafaf8] border border-[#e8e8e3]">
            <div>
              <p className="font-bold text-ink">Persistent Automatic Shoot Reminders</p>
              <p className="text-muted text-[11px]">
                Default reminders at 24 hours and 2 hours before every scheduled shoot with automatic sync on reschedule.
              </p>
            </div>
            <span className="self-start sm:self-auto rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-700 border border-emerald-200">
              Enabled (24h & 2h)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
