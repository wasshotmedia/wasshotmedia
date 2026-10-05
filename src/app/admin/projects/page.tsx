"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  AlertTriangle,
  X,
  LayoutGrid,
  List,
  Layers,
} from "lucide-react";
import { formatMoney } from "@/lib/utils";

interface Project {
  _id: string;
  title: string;
  client?: { _id: string; name: string; company?: string };
  service: "video" | "website" | "seo" | "marketing" | "branding" | "other";
  stage: string;
  status: "active" | "completed" | "on_hold" | "cancelled";
  health?: "on_track" | "at_risk" | "delayed";
  budget?: number;
  deadline?: string;
  assignedTo?: Array<{ _id: string; name: string }>;
  deliverables?: Array<{ title: string; completed: boolean }>;
  notes?: string;
  createdAt: string;
}

const VIDEO_STAGES = [
  "Pre-Production",
  "Shooting",
  "Rough Cut",
  "Color & Audio",
  "Client Review",
  "Final Delivery",
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterService, setFilterService] = useState("all");

  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formClientId, setFormClientId] = useState("");
  const [formService, setFormService] = useState<Project["service"]>("video");
  const [formStage, setFormStage] = useState("Pre-Production");
  const [formBudget, setFormBudget] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formAssignedTo, setFormAssignedTo] = useState<string[]>([]);
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const [projRes, clientRes, teamRes] = await Promise.all([
        fetch("/api/admin/projects").then((r) => r.json()).catch(() => ({ items: [] })),
        fetch("/api/admin/clients").then((r) => r.json()).catch(() => ({ items: [] })),
        fetch("/api/admin/team").then((r) => r.json()).catch(() => ({ items: [] })),
      ]);

      setProjects(projRes.items || []);
      setClients(clientRes.items || []);
      setTeamMembers(teamRes.items || []);
      if (teamRes.items && teamRes.items.length > 0) {
        setFormAssignedTo(teamRes.items.map((m: any) => m._id));
      }
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formClientId) {
      alert("Please provide project title and select a client.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          clientId: formClientId,
          service: formService,
          stage: formStage,
          budget: formBudget ? parseFloat(formBudget) : undefined,
          deadline: formDeadline ? new Date(formDeadline).toISOString() : undefined,
          assignedTo: formAssignedTo,
          notes: formNotes,
        }),
      });

      if (res.ok) {
        await loadProjects();
        setShowModal(false);
        setFormTitle("");
        setFormBudget("");
        setFormNotes("");
      }
    } catch (err) {
      console.error("Failed to create project", err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStage = async (projectId: string, newStage: string) => {
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (res.ok) {
        setProjects(
          projects.map((p) => (p._id === projectId ? { ...p, stage: newStage } : p))
        );
      }
    } catch (err) {
      console.error("Failed to update project stage", err);
    }
  };

  const filtered = projects.filter((p) => {
    if (filterService !== "all" && p.service !== filterService) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchClient = p.client?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchClient) return false;
    }
    return true;
  });

  return (
    <div suppressHydrationWarning className="space-y-6">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e8e8e3] pb-5 sm:flex-row sm:items-center">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-orange">
            Production Management · Creative Delivery
          </span>
          <h1 className="display text-3xl font-extrabold text-ink">
            Projects ({projects.length})
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Track video productions, websites, SEO campaigns, and branding milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Switcher */}
          <div className="flex rounded-full border border-[#e8e8e3] bg-white p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`rounded-full p-1.5 transition ${
                viewMode === "kanban" ? "bg-ink text-white" : "text-muted hover:text-ink"
              }`}
              title="Kanban Board"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`rounded-full p-1.5 transition ${
                viewMode === "table" ? "bg-ink text-white" : "text-muted hover:text-ink"
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#e03d07]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ New Project</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e8e8e3] bg-white p-3 text-xs">
        <div className="flex flex-1 items-center gap-2">
          <Search className="h-4 w-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title or client..."
            className="w-full bg-transparent text-xs text-ink placeholder-muted focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-orange" />
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="rounded-lg border border-[#e8e8e3] bg-[#fbfbfa] px-2.5 py-1 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-orange"
          >
            <option value="all">All Services</option>
            <option value="video">Cinematic & Video</option>
            <option value="website">Custom Websites</option>
            <option value="seo">SEO & Growth</option>
            <option value="marketing">Brand Campaigns</option>
            <option value="branding">Brand Strategy</option>
          </select>
        </div>
      </div>

      {/* 3. KANBAN / TABLE VIEW */}
      {viewMode === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {VIDEO_STAGES.map((stg) => {
            const stageProjects = filtered.filter(
              (p) => (p.stage || "Pre-Production").toLowerCase() === stg.toLowerCase()
            );
            return (
              <div
                key={stg}
                className="w-72 shrink-0 rounded-3xl border border-[#e8e8e3] bg-[#fafaf8] p-3 shadow-xs"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#e8e8e3] pb-2">
                  <span className="font-bold text-ink text-xs uppercase tracking-wider">
                    {stg}
                  </span>
                  <span className="rounded-full bg-black/[0.06] px-2 py-0.5 font-mono text-[10px] font-bold text-muted">
                    {stageProjects.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="mt-3 space-y-3">
                  {stageProjects.map((p) => (
                    <div
                      key={p._id}
                      className="rounded-2xl border border-[#e8e8e3] bg-white p-3.5 shadow-xs transition hover:border-black/20"
                    >
                      <span className="rounded bg-orange/10 px-2 py-0.5 font-mono text-[9px] font-bold text-orange uppercase">
                        {p.service}
                      </span>
                      <h4 className="mt-1.5 font-bold text-ink text-xs">{p.title}</h4>
                      {p.client && (
                        <p className="text-[11px] text-muted font-medium">
                          {p.client.name} {p.client.company ? `· ${p.client.company}` : ""}
                        </p>
                      )}

                      {p.budget && (
                        <p className="mt-2 font-mono text-[11px] font-bold text-ink">
                          {formatMoney(p.budget)}
                        </p>
                      )}

                      {/* Stage Selector */}
                      <div className="mt-3 pt-2 border-t border-[#f0f0eb] flex items-center justify-between text-[10px]">
                        <span className="font-mono text-muted">Stage:</span>
                        <select
                          value={p.stage || "Pre-Production"}
                          onChange={(e) => handleUpdateStage(p._id, e.target.value)}
                          className="rounded bg-[#fafaf8] border border-[#e8e8e3] px-1.5 py-0.5 text-[10px] font-semibold text-ink"
                        >
                          {VIDEO_STAGES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

                  {stageProjects.length === 0 && (
                    <div className="py-8 text-center text-xs text-muted/50">
                      No active projects
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl sm:rounded-3xl border border-[#e8e8e3] bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead>
                <tr className="border-b border-[#e8e8e3] bg-[#fafaf8] text-[10px] font-bold uppercase tracking-wider text-muted">
                  <th className="px-5 py-3">Project Title</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0eb]">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-[#fbfbfa]">
                    <td className="px-5 py-3 font-bold text-ink">{p.title}</td>
                    <td className="px-4 py-3 text-muted">{p.client?.name || "—"}</td>
                    <td className="px-4 py-3 capitalize">{p.service}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-orange/10 px-2.5 py-0.5 text-[10px] font-bold text-orange">
                        {p.stage || "Pre-Production"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink">
                      {p.budget ? formatMoney(p.budget) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. NEW PROJECT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border border-[#e8e8e3]">
            <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-4">
              <div>
                <h3 className="display text-xl font-bold text-ink">New Studio Project</h3>
                <p className="text-xs text-muted">Initiate a creative production deliverable</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-1.5 text-muted hover:bg-black/[0.05]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-ink mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Brand Commercial Video 2026"
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Client *</label>
                  <select
                    required
                    value={formClientId}
                    onChange={(e) => setFormClientId(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                  >
                    <option value="">Select Client</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.company ? `(${c.company})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">Service Type</label>
                  <select
                    value={formService}
                    onChange={(e) => setFormService(e.target.value as any)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                  >
                    <option value="video">Cinematic & Video Production</option>
                    <option value="website">Custom Website</option>
                    <option value="seo">SEO & Growth</option>
                    <option value="marketing">Brand Campaigns</option>
                    <option value="branding">Creative Strategy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Budget (₹ INR)</label>
                  <input
                    type="number"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    placeholder="75000"
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">Deadline</label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Project Scope & Notes</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Creative deliverables, aspect ratios, target channels..."
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] p-2.5 text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#e8e8e3]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full border border-[#e8e8e3] px-4 py-2 font-semibold text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-orange px-5 py-2 font-bold text-white shadow-xs hover:bg-[#e03d07] disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Project →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
