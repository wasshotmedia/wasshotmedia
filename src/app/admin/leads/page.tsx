"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Target,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  UserCheck,
  Calendar,
  MessageSquare,
  ArrowRight,
  X,
  LayoutGrid,
  List,
} from "lucide-react";

interface Lead {
  _id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  service?: string;
  budget?: string;
  timeline?: string;
  source?: string;
  stage:
    | "new"
    | "contacted"
    | "qualified"
    | "proposal_sent"
    | "negotiation"
    | "won"
    | "lost";
  assignedTo?: { _id: string; name: string };
  followUpAt?: string;
  notes?: string;
  message?: string;
  createdAt: string;
}

const STAGES = [
  { key: "new", label: "New Inquiry", color: "bg-blue-500" },
  { key: "contacted", label: "Contacted", color: "bg-amber-500" },
  { key: "qualified", label: "Qualified", color: "bg-indigo-500" },
  { key: "proposal_sent", label: "Proposal Sent", color: "bg-orange" },
  { key: "negotiation", label: "Negotiation", color: "bg-purple-500" },
  { key: "won", label: "Won / Converted", color: "bg-emerald-500" },
  { key: "lost", label: "Lost", color: "bg-zinc-400" },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState("all");

  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formService, setFormService] = useState("Cinematic Shooting");
  const [formBudget, setFormBudget] = useState("");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load leads", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          company: formCompany,
          email: formEmail,
          phone: formPhone,
          service: formService,
          budget: formBudget,
          message: formNotes,
          stage: "new",
        }),
      });
      if (res.ok) {
        await loadLeads();
        setShowModal(false);
        setFormName("");
        setFormCompany("");
        setFormEmail("");
        setFormPhone("");
        setFormNotes("");
      }
    } catch (err) {
      console.error("Failed to create lead", err);
    } finally {
      setSaving(false);
    }
  };

  // Convert Lead to Client
  const handleConvertToClient = async (leadId: string) => {
    if (!confirm("Convert this lead into an official Agency Client?")) return;
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/convert`, {
        method: "POST",
      });
      if (res.ok) {
        alert("Lead successfully converted to Client!");
        await loadLeads();
      }
    } catch (err) {
      console.error("Failed to convert lead", err);
    }
  };

  // Move Lead Stage
  const handleStageChange = async (leadId: string, newStage: Lead["stage"]) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (res.ok) {
        setLeads(
          leads.map((l) => (l._id === leadId ? { ...l, stage: newStage } : l))
        );
      }
    } catch (err) {
      console.error("Failed to update lead stage", err);
    }
  };

  const filtered = leads.filter((l) => {
    if (filterStage !== "all" && l.stage !== filterStage) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = l.name?.toLowerCase().includes(q);
      const matchCompany = l.company?.toLowerCase().includes(q);
      const matchEmail = l.email?.toLowerCase().includes(q);
      if (!matchName && !matchCompany && !matchEmail) return false;
    }
    return true;
  });

  return (
    <div suppressHydrationWarning className="space-y-6">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e8e8e3] pb-5 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-orange">
            Sales Pipeline · Opportunity Tracking
          </span>
          <h1 className="display text-3xl font-extrabold text-ink">
            Leads & CRM ({leads.length})
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Track inquiries, discovery calls, proposals, and convert leads to clients.
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
              title="Kanban Pipeline"
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
            <span>+ New Lead</span>
          </button>
        </div>
      </div>

      {/* 2. FILTER & SEARCH */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e8e8e3] bg-white p-3 text-xs">
        <div className="flex flex-1 items-center gap-2">
          <Search className="h-4 w-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by name, company, email..."
            className="w-full bg-transparent text-xs text-ink placeholder-muted focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-orange" />
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="rounded-lg border border-[#e8e8e3] bg-[#fbfbfa] px-2.5 py-1 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-orange"
          >
            <option value="all">All Stages</option>
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. KANBAN OR TABLE VIEW */}
      {viewMode === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = filtered.filter((l) => l.stage === stage.key);
            return (
              <div
                key={stage.key}
                className="w-72 shrink-0 rounded-3xl border border-[#e8e8e3] bg-[#fafaf8] p-3 shadow-xs"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#e8e8e3] pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                    <span className="font-bold text-ink text-xs uppercase tracking-wider">
                      {stage.label}
                    </span>
                  </div>
                  <span className="rounded-full bg-black/[0.06] px-2 py-0.5 font-mono text-[10px] font-bold text-muted">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="mt-3 space-y-3">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead._id}
                      className="rounded-2xl border border-[#e8e8e3] bg-white p-3.5 shadow-xs transition hover:border-black/20"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-ink text-xs">{lead.name}</p>
                          {lead.company && (
                            <p className="text-[11px] text-muted">{lead.company}</p>
                          )}
                        </div>
                        {lead.stage !== "won" && (
                          <button
                            onClick={() => handleConvertToClient(lead._id)}
                            className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            title="Convert to Studio Client"
                          >
                            + Client
                          </button>
                        )}
                      </div>

                      {lead.service && (
                        <span className="mt-2 inline-block rounded bg-orange/10 px-2 py-0.5 font-mono text-[9px] font-bold text-orange">
                          {lead.service}
                        </span>
                      )}

                      {lead.message && (
                        <p className="mt-2 text-[11px] text-muted line-clamp-2 leading-relaxed">
                          {lead.message}
                        </p>
                      )}

                      {/* Quick stage selector */}
                      <div className="mt-3 pt-2 border-t border-[#f0f0eb] flex items-center justify-between text-[10px]">
                        <span className="font-mono text-muted">Move to:</span>
                        <select
                          value={lead.stage}
                          onChange={(e) =>
                            handleStageChange(lead._id, e.target.value as any)
                          }
                          className="rounded bg-[#fafaf8] border border-[#e8e8e3] px-1.5 py-0.5 text-[10px] font-semibold text-ink"
                        >
                          {STAGES.map((s) => (
                            <option key={s.key} value={s.key}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="py-8 text-center text-xs text-muted/50">
                      Empty stage
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
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead>
                <tr className="border-b border-[#e8e8e3] bg-[#fafaf8] text-[10px] font-bold uppercase tracking-wider text-muted">
                  <th className="px-5 py-3">Lead & Company</th>
                  <th className="px-4 py-3">Service & Budget</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-[#f0f0eb]">
              {filtered.map((lead) => (
                <tr key={lead._id} className="hover:bg-[#fbfbfa]">
                  <td className="px-5 py-3 font-medium text-ink">
                    <p className="font-bold">{lead.name}</p>
                    <p className="text-muted text-[11px]">{lead.company || "Direct"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-ink">{lead.service || "General"}</p>
                    <p className="text-muted text-[11px]">{lead.budget || "Budget not specified"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-orange/10 px-2.5 py-0.5 text-[10px] font-bold text-orange uppercase">
                      {lead.stage.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <p>{lead.email}</p>
                    <p>{lead.phone || ""}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {lead.stage !== "won" && (
                      <button
                        onClick={() => handleConvertToClient(lead._id)}
                        className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      >
                        Convert to Client →
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* 4. NEW LEAD MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border border-[#e8e8e3]">
            <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-4">
              <div>
                <h3 className="display text-xl font-bold text-ink">Create New Lead</h3>
                <p className="text-xs text-muted">Record a new prospective project opportunity</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-1.5 text-muted hover:bg-black/[0.05]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Lead Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Anand Kumar"
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink mb-1">Company / Brand</label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Brand X"
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="lead@company.com"
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink mb-1">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 99999 88888"
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Service</label>
                  <select
                    value={formService}
                    onChange={(e) => setFormService(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                  >
                    <option value="Cinematic Shooting">Cinematic Shooting</option>
                    <option value="Video Editing & Post">Video Editing & Post</option>
                    <option value="Custom Websites">Custom Websites</option>
                    <option value="SEO & Search Growth">SEO & Search Growth</option>
                    <option value="Brand Campaigns">Brand Campaigns</option>
                    <option value="Creative Strategy">Creative Strategy</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-ink mb-1">Estimated Budget</label>
                  <input
                    type="text"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    placeholder="e.g. ₹50,000 - ₹1,00,000"
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Project Brief / Inquiry Notes</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Goals, shoot requirements, deliverables needed..."
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
                  {saving ? "Saving..." : "Create Lead →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
