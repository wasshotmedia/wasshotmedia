"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  MessageCircle,
  Briefcase,
  TrendingUp,
  X,
  ShieldCheck,
  ChevronRight,
  Trash2,
  Calendar,
  Receipt,
} from "lucide-react";
import { formatMoney } from "@/lib/utils";

interface Client {
  _id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  status?: "lead" | "active" | "retainer" | "completed" | "inactive";
  health?: "good" | "at_risk" | "needs_attention";
  city?: string;
  address?: string;
  notes?: string;
  totalRevenue?: number;
  activeProjectsCount?: number;
  createdAt: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formStatus, setFormStatus] = useState<NonNullable<Client["status"]>>("active");
  const [formCity, setFormCity] = useState("Hyderabad");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    loadClients();
  }, []);

  const handleDeleteClient = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete client "${name}"? This action cannot be undone.`)) {
      return;
    }
    setClients((prev) => prev.filter((c) => c._id !== id));
    try {
      const res = await fetch(`/api/admin/clients/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "Failed to delete client");
        await loadClients();
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete client");
      await loadClients();
    }
  };

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load clients", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Please enter the contact person's name.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          company: formCompany.trim(),
          business: formCompany.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          status: formStatus,
          city: formCity.trim(),
          notes: formNotes.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.error || (data.issues ? JSON.stringify(data.issues) : "Failed to create client");
        alert(`Failed to create client: ${msg}`);
        return;
      }

      await loadClients();
      setShowModal(false);
      setFormName("");
      setFormCompany("");
      setFormEmail("");
      setFormPhone("");
      setFormNotes("");
    } catch (err: any) {
      alert(err.message || "Failed to create client");
    } finally {
      setSaving(false);
    }
  };

  const filtered = clients.filter((c) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchComp = c.company?.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      const matchPhone = c.phone?.toLowerCase().includes(q);
      if (!matchName && !matchComp && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div suppressHydrationWarning className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e8e8e3] pb-5 sm:flex-row sm:items-center">
        <div>
          <span className="font-display text-[10px] font-bold uppercase tracking-widest text-orange">
            Studio CRM · Client Directory
          </span>
          <h1 className="display text-3xl font-extrabold text-ink">
            Clients ({clients.length})
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Manage agency brand accounts, contacts, shoots, and receivables.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#e03d07]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>+ New Client</span>
        </button>
      </div>

      {/* 2. SEARCH & FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e8e8e3] bg-white p-3 text-xs">
        <div className="flex flex-1 items-center gap-2">
          <Search className="h-4 w-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, company, email, or phone..."
            className="w-full bg-transparent text-xs text-ink placeholder-muted focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-orange" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-[#e8e8e3] bg-[#fbfbfa] px-2.5 py-1 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-orange"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="retainer">Retainer</option>
            <option value="lead">Lead</option>
            <option value="completed">Completed</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* 3. CLIENTS TABLE */}
      <div className="rounded-2xl sm:rounded-3xl border border-[#e8e8e3] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="border-b border-[#e8e8e3] bg-[#fafaf8] font-display text-[10px] font-bold uppercase text-muted">
                <th className="px-5 py-3">Client & Company</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0eb]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-muted">
                    Loading client records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-muted">
                    No clients found. Click &quot;+ New Client&quot; to add your first studio client.
                  </td>
                </tr>
              ) : (
                filtered.map((client) => {
                  const rawPhone = client.phone ? client.phone.replace(/\D/g, "") : "";
                  const displayStatus = client.status || "active";
                  const displayCity = client.city || (client.address ? client.address.split(",").pop()?.trim() : "Hyderabad");

                  return (
                    <tr key={client._id} className="hover:bg-[#fbfbfa] transition">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/clients/${client._id}`}
                          className="font-bold text-ink hover:text-orange"
                        >
                          {client.name}
                        </Link>
                        {client.company && (
                          <span className="block text-[11px] text-muted font-medium">
                            {client.company}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <a
                            href={`mailto:${client.email}`}
                            className="text-muted hover:text-ink flex items-center gap-1.5"
                          >
                            <Mail className="h-3 w-3 text-orange" />
                            <span>{client.email}</span>
                          </a>
                          {client.phone && (
                            <div className="flex items-center gap-2">
                              <a
                                href={`tel:${client.phone}`}
                                className="text-muted hover:text-ink flex items-center gap-1"
                              >
                                <Phone className="h-3 w-3 text-orange" />
                                <span>{client.phone}</span>
                              </a>
                              {rawPhone && (
                                <a
                                  href={`https://wa.me/${rawPhone}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700"
                                  title="Open WhatsApp"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            displayStatus === "retainer"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : displayStatus === "lead"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : displayStatus === "inactive"
                              ? "bg-red-50 text-red-600 border border-red-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              displayStatus === "retainer"
                                ? "bg-purple-500"
                                : displayStatus === "lead"
                                ? "bg-blue-500"
                                : displayStatus === "inactive"
                                ? "bg-red-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          <span>{displayStatus}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-ink/80">
                        {displayCity}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/clients/${client._id}`}
                            className="inline-flex items-center gap-1 rounded-full border border-orange/30 bg-orange/5 px-2.5 py-1 text-xs font-bold text-orange hover:bg-orange hover:text-white transition"
                            title="Schedule shoot or view sessions"
                          >
                            <Calendar className="h-3 w-3" />
                            <span>Shoot</span>
                          </Link>
                          <Link
                            href={`/admin/clients/${client._id}`}
                            className="inline-flex items-center gap-1 rounded-full border border-[#e8e8e3] bg-white px-2.5 py-1 text-xs font-bold text-ink hover:border-black/40 hover:bg-[#fafaf8] transition"
                            title="Generate invoice or view billings"
                          >
                            <Receipt className="h-3 w-3" />
                            <span>Invoice</span>
                          </Link>
                          <Link
                            href={`/admin/clients/${client._id}`}
                            className="inline-flex items-center gap-1 rounded-full border border-[#e8e8e3] bg-white px-3 py-1 font-semibold text-ink hover:border-black/30 hover:bg-[#fafaf8] transition"
                          >
                            <span>Profile</span>
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteClient(client._id, client.name)}
                            className="rounded-full p-1.5 text-muted hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200 transition"
                            title="Delete Client"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. NEW CLIENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="relative flex flex-col w-full max-w-lg max-h-[92vh] rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-[#e8e8e3] overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header (Sticky at top) */}
            <div className="flex items-center justify-between border-b border-[#e8e8e3] px-5 py-4 bg-white shrink-0">
              <div>
                <h3 className="display text-xl font-bold text-ink">Add New Client</h3>
                <p className="text-xs text-muted">Create a new client CRM profile</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full p-1.5 text-muted hover:bg-black/[0.05]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="createClientForm" onSubmit={handleCreateClient} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Ramesh Varma"
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">
                    Company / Brand Name
                  </label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. ABC Media / Varma Jewels"
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                  >
                    <option value="active">Active Client</option>
                    <option value="retainer">Retainer Client</option>
                    <option value="lead">Lead</option>
                    <option value="completed">Completed</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">City / Location</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Vijayawada"
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Client Notes</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Key brand preferences, deliverables, special requirements..."
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] p-2.5 text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>
            </form>

            {/* Sticky Action Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-[#e8e8e3] px-5 py-3.5 bg-[#fafaf8] shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full border border-[#e8e8e3] bg-white px-5 py-2 font-semibold text-muted hover:text-ink transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="createClientForm"
                disabled={saving}
                className="rounded-full bg-orange px-6 py-2 font-bold text-white shadow-xs hover:bg-[#e03d07] disabled:opacity-50 transition"
              >
                {saving ? "Creating..." : "Create Client →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
