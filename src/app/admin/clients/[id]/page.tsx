"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Briefcase,
  Calendar,
  CheckSquare,
  Receipt,
  Mail,
  Activity,
  ArrowLeft,
  Phone,
  MapPin,
  MessageCircle,
  ExternalLink,
  Edit2,
  Trash2,
  Plus,
  Globe,
  Building,
  User,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import { formatMoney } from "@/lib/utils";

export default function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [client, setClient] = useState<any | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "projects" | "shoots" | "tasks" | "invoices"
  >("overview");

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    company: "",
    contactPerson: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    business: "",
    website: "",
    status: "active",
    notes: "",
  });

  useEffect(() => {
    loadClientData();
  }, [id]);

  const loadClientData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clients/${id}`);
      if (!res.ok) {
        setClient(null);
        return;
      }
      const data = await res.json();
      if (data && data.item) {
        setClient(data.item);
        setProjects(data.projects || []);
        setEvents(data.events || []);
        setTasks(data.tasks || []);
        setInvoices(data.invoices || []);
        setEditForm({
          name: data.item.name || "",
          company: data.item.company || "",
          contactPerson: data.item.contactPerson || "",
          email: data.item.email || "",
          phone: data.item.phone || "",
          city: data.item.city || (data.item.address ? data.item.address.split(",").pop()?.trim() : "Hyderabad"),
          address: data.item.address || "",
          business: data.item.business || "",
          website: data.item.website || "",
          status: data.item.status || "active",
          notes: data.item.notes || "",
        });
      }
    } catch (err) {
      console.error("Failed to load client details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to update client");
        return;
      }

      const updated = await res.json();
      setClient(updated.item || { ...client, ...editForm });
      setShowEditModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to update client");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteClient = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${client.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to delete client");
        setDeleting(false);
        return;
      }

      router.push("/admin/clients");
    } catch (err: any) {
      alert(err.message || "Failed to delete client");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange border-r-transparent mb-3" />
        <p className="font-display text-xs font-bold uppercase tracking-widest text-muted">
          Loading client profile...
        </p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="py-24 text-center">
        <p className="text-base font-bold text-ink">Client not found</p>
        <Link
          href="/admin/clients"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-orange hover:underline font-semibold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Return to Clients
        </Link>
      </div>
    );
  }

  const rawPhone = client.phone ? client.phone.replace(/\D/g, "") : "";
  const displayStatus = client.status || "active";
  const displayCity = client.city || (client.address ? client.address.split(",").pop()?.trim() : "Hyderabad");

  return (
    <div suppressHydrationWarning className="space-y-6">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e8e8e3] pb-5 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/admin/clients"
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-ink mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to All Clients
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight">
              {client.name}
            </h1>
            {client.company && (
              <span className="rounded-lg bg-black/[0.05] px-2.5 py-1 text-xs font-bold text-muted">
                {client.company}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
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
              {displayStatus}
            </span>
          </div>
        </div>

        {/* Quick Contact & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {client.phone && (
            <a
              href={`tel:${client.phone}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e8e3] bg-white px-3.5 py-2 text-xs font-semibold text-ink hover:bg-black/[0.04]"
            >
              <Phone className="h-3.5 w-3.5 text-orange" />
              <span>Call</span>
            </a>
          )}
          {rawPhone && (
            <a
              href={`https://wa.me/${rawPhone}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-600 hover:text-white"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </a>
          )}
          {client.email && (
            <a
              href={`mailto:${client.email}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e8e3] bg-white px-3.5 py-2 text-xs font-semibold text-ink hover:bg-black/[0.04]"
            >
              <Mail className="h-3.5 w-3.5 text-orange" />
              <span>Email</span>
            </a>
          )}
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white hover:bg-orange transition"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={handleDeleteClient}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-600 hover:text-white transition disabled:opacity-50"
            title="Delete this client"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{deleting ? "Deleting..." : "Delete"}</span>
          </button>
        </div>
      </div>

      {/* 2. TABS */}
      <div className="flex border-b border-[#e8e8e3] gap-2 overflow-x-auto no-scrollbar">
        {[
          { key: "overview", label: "Overview", count: null },
          { key: "projects", label: "Projects", count: projects.length },
          { key: "shoots", label: "Shoots & Calendar", count: events.length },
          { key: "tasks", label: "Tasks", count: tasks.length },
          { key: "invoices", label: "Invoices", count: invoices.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition whitespace-nowrap ${
              activeTab === tab.key
                ? "border-orange text-orange font-bold"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {tab.label} {tab.count !== null ? `(${tab.count})` : ""}
          </button>
        ))}
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 rounded-2xl sm:rounded-3xl border border-[#e8e8e3] bg-white p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
                Account Dossier
              </h3>
              <button
                onClick={() => setShowEditModal(true)}
                className="text-xs font-semibold text-orange hover:underline flex items-center gap-1"
              >
                <Edit2 className="h-3 w-3" /> Edit
              </button>
            </div>
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="font-display text-[10px] font-bold text-muted uppercase tracking-wider">
                  Contact Person
                </span>
                <p className="font-semibold text-ink">
                  {client.contactPerson || client.name}
                </p>
              </div>
              {client.company && (
                <div>
                  <span className="font-display text-[10px] font-bold text-muted uppercase tracking-wider">
                    Company
                  </span>
                  <p className="font-semibold text-ink">{client.company}</p>
                </div>
              )}
              <div>
                <span className="font-display text-[10px] font-bold text-muted uppercase tracking-wider">
                  Email
                </span>
                <p className="font-semibold text-ink">
                  <a href={`mailto:${client.email}`} className="hover:text-orange">
                    {client.email}
                  </a>
                </p>
              </div>
              <div>
                <span className="font-display text-[10px] font-bold text-muted uppercase tracking-wider">
                  Phone
                </span>
                <p className="font-semibold text-ink">
                  {client.phone ? (
                    <a href={`tel:${client.phone}`} className="hover:text-orange">
                      {client.phone}
                    </a>
                  ) : (
                    "Not specified"
                  )}
                </p>
              </div>
              <div>
                <span className="font-display text-[10px] font-bold text-muted uppercase tracking-wider">
                  City / Location
                </span>
                <p className="font-semibold text-ink flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-orange" />
                  <span>{displayCity}</span>
                </p>
              </div>
              {client.business && (
                <div>
                  <span className="font-display text-[10px] font-bold text-muted uppercase tracking-wider">
                    Industry / Business
                  </span>
                  <p className="font-semibold text-ink">{client.business}</p>
                </div>
              )}
              {client.website && (
                <div>
                  <span className="font-display text-[10px] font-bold text-muted uppercase tracking-wider">
                    Website
                  </span>
                  <p className="font-semibold text-ink">
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-orange hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-3 w-3" />
                      <span>{client.website.replace(/^https?:\/\//, "")}</span>
                    </a>
                  </p>
                </div>
              )}
              <div>
                <span className="font-display text-[10px] font-bold text-muted uppercase tracking-wider">
                  Notes
                </span>
                <p className="text-muted leading-relaxed whitespace-pre-wrap bg-[#fafaf8] p-3 rounded-xl border border-[#ecece8]">
                  {client.notes || "No notes entered yet."}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl sm:rounded-3xl border border-[#e8e8e3] bg-white p-4 sm:p-6 shadow-xs lg:col-span-2">
            <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
                Active Productions & Deliverables
              </h3>
              <Link
                href="/admin/projects"
                className="text-xs font-semibold text-orange hover:underline"
              >
                + New Project →
              </Link>
            </div>
            {projects.length > 0 ? (
              <div className="divide-y divide-[#f0f0eb]">
                {projects.map((p) => {
                  const projName = p.name || p.title || "Untitled Project";
                  const projStage = p.stage || p.status || "production";
                  const projType = p.type || (p.services ? p.services[0] : "Production");
                  return (
                    <div key={p._id} className="py-3.5 flex items-center justify-between text-xs hover:bg-[#fafaf8] px-2 rounded-xl transition">
                      <div>
                        <p className="font-bold text-ink text-sm">{projName}</p>
                        <span className="text-[11px] text-muted capitalize">
                          {projType} · Due: {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "Flexible"}
                        </span>
                      </div>
                      <span className="rounded-full bg-orange/10 px-2.5 py-1 text-[10px] font-bold text-orange uppercase tracking-wider">
                        {projStage}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted">
                <Briefcase className="h-8 w-8 text-muted/40 mx-auto mb-2" />
                <p>No projects created yet for this client.</p>
                <Link
                  href="/admin/projects"
                  className="mt-2 inline-block text-orange font-bold hover:underline"
                >
                  Create first project
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "projects" && (
        <div className="rounded-2xl sm:rounded-3xl border border-[#e8e8e3] bg-white p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-4">
            <h3 className="font-display text-sm font-bold text-ink uppercase tracking-wider">
              Client Projects ({projects.length})
            </h3>
            <Link
              href="/admin/projects"
              className="text-xs font-semibold text-orange hover:underline"
            >
              + Create Project in Projects Module →
            </Link>
          </div>
          <div className="mt-4">
            {projects.length > 0 ? (
              <div className="divide-y divide-[#f0f0eb]">
                {projects.map((p) => {
                  const projName = p.name || p.title || "Untitled Project";
                  const projStage = p.stage || p.status || "production";
                  return (
                    <div key={p._id} className="py-3.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-ink text-sm">{projName}</p>
                        <p className="text-muted text-[11px] mt-0.5">{p.description || "No description provided."}</p>
                        {p.services && p.services.length > 0 && (
                          <div className="flex gap-1.5 mt-1.5">
                            {p.services.map((s: string, idx: number) => (
                              <span key={idx} className="bg-black/[0.04] text-muted px-2 py-0.5 rounded text-[10px] font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="rounded-full bg-black/[0.05] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink">
                        {projStage}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted py-8 text-center">No projects found for this client.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "shoots" && (
        <div className="rounded-2xl sm:rounded-3xl border border-[#e8e8e3] bg-white p-4 sm:p-6 shadow-xs">
          <h3 className="font-display text-sm font-bold text-ink uppercase tracking-wider border-b border-[#e8e8e3] pb-4">
            Scheduled Shoots & Calendar Events ({events.length})
          </h3>
          <div className="mt-4">
            {events.length > 0 ? (
              <div className="divide-y divide-[#f0f0eb]">
                {events.map((ev) => (
                  <div key={ev._id} className="py-3.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-ink text-sm">{ev.title}</p>
                      <p className="text-muted text-[11px] mt-0.5">
                        {new Date(ev.start).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                        {ev.location ? ` · ${ev.location}` : ""}
                      </p>
                      {ev.equipmentNeeded && ev.equipmentNeeded.length > 0 && (
                        <p className="text-muted text-[10px] mt-1">
                          Gear: {ev.equipmentNeeded.join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="rounded-full bg-orange/10 px-2.5 py-1 text-[10px] font-bold text-orange uppercase tracking-wider">
                      {ev.status || "scheduled"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted py-8 text-center">No shoots or calendar events recorded.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="rounded-2xl sm:rounded-3xl border border-[#e8e8e3] bg-white p-4 sm:p-6 shadow-xs">
          <h3 className="font-display text-sm font-bold text-ink uppercase tracking-wider border-b border-[#e8e8e3] pb-4">
            Client Tasks ({tasks.length})
          </h3>
          <div className="mt-4">
            {tasks.length > 0 ? (
              <div className="divide-y divide-[#f0f0eb]">
                {tasks.map((t) => (
                  <div key={t._id} className="py-3.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-ink">{t.title}</p>
                      {t.description && <p className="text-muted text-[11px] mt-0.5">{t.description}</p>}
                    </div>
                    <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                      {t.status || "todo"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted py-8 text-center">No tasks linked to this client.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "invoices" && (
        <div className="rounded-2xl sm:rounded-3xl border border-[#e8e8e3] bg-white p-4 sm:p-6 shadow-xs">
          <h3 className="font-display text-sm font-bold text-ink uppercase tracking-wider border-b border-[#e8e8e3] pb-4">
            Client Invoices & Billings ({invoices.length})
          </h3>
          <div className="mt-4">
            {invoices.length > 0 ? (
              <div className="divide-y divide-[#f0f0eb]">
                {invoices.map((inv) => (
                  <div key={inv._id} className="py-3.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-ink">Invoice #{inv.invoiceNumber}</p>
                      <p className="text-muted text-[11px]">Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "Immediate"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-ink">{formatMoney(inv.total || 0)}</p>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted py-8 text-center">No invoices generated yet.</p>
            )}
          </div>
        </div>
      )}

      {/* EDIT CLIENT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-[#e8e8e3] bg-white p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-3">
              <h2 className="font-display text-lg font-bold text-ink">
                Edit Client Profile
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-full p-1 text-muted hover:bg-black/[0.04] hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateClient} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full rounded-xl border border-[#e8e8e3] px-3 py-2 text-xs text-ink focus:border-orange focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    className="w-full rounded-xl border border-[#e8e8e3] px-3 py-2 text-xs text-ink focus:border-orange focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={editForm.contactPerson}
                    onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })}
                    className="w-full rounded-xl border border-[#e8e8e3] px-3 py-2 text-xs text-ink focus:border-orange focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full rounded-xl border border-[#e8e8e3] px-3 py-2 text-xs text-ink focus:border-orange focus:outline-hidden"
                  >
                    <option value="active">Active</option>
                    <option value="retainer">Retainer</option>
                    <option value="lead">Lead</option>
                    <option value="completed">Completed</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full rounded-xl border border-[#e8e8e3] px-3 py-2 text-xs text-ink focus:border-orange focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-[#e8e8e3] px-3 py-2 text-xs text-ink focus:border-orange focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full rounded-xl border border-[#e8e8e3] px-3 py-2 text-xs text-ink focus:border-orange focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                    Industry / Business
                  </label>
                  <input
                    type="text"
                    value={editForm.business}
                    onChange={(e) => setEditForm({ ...editForm, business: e.target.value })}
                    className="w-full rounded-xl border border-[#e8e8e3] px-3 py-2 text-xs text-ink focus:border-orange focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                  Website
                </label>
                <input
                  type="text"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  placeholder="https://clientwebsite.com"
                  className="w-full rounded-xl border border-[#e8e8e3] px-3 py-2 text-xs text-ink focus:border-orange focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-[#e8e8e3] px-3 py-2 text-xs text-ink focus:border-orange focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e8e8e3]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-full border border-[#e8e8e3] px-4 py-2 text-xs font-semibold text-ink hover:bg-black/[0.04]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-full bg-orange px-5 py-2 text-xs font-semibold text-white hover:bg-orange/90 transition disabled:opacity-50"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
