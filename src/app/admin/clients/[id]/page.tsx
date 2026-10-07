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
  CreditCard,
  Download,
  Copy,
  Clock,
  CheckCircle2,
  Share2,
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
    "overview" | "shoots" | "invoices" | "projects" | "tasks"
  >("overview");

  // Copy Link State
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  // 1. Schedule Shoot Modal State
  const [showShootModal, setShowShootModal] = useState(false);
  const [savingShoot, setSavingShoot] = useState(false);
  const [shootTitle, setShootTitle] = useState("");
  const [shootStart, setShootStart] = useState("");
  const [shootEnd, setShootEnd] = useState("");
  const [shootLocation, setShootLocation] = useState("");
  const [shootEquipment, setShootEquipment] = useState("Sony FX3, 24-70mm GM II, DJI RS3 Pro, Godox SL200");
  const [shootNotes, setShootNotes] = useState("");

  // 2. Create Invoice Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [invIssueDate, setInvIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [invDueDate, setInvDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );
  const [invItems, setInvItems] = useState([
    { description: "Cinema 4K Commercial Shoot & Production", quantity: 1, unitPrice: 45000 },
  ]);
  const [invTaxRate, setInvTaxRate] = useState(18); // GST 18%
  const [invNotes, setInvNotes] = useState(
    "Bank: HDFC Bank · WasShot Media · A/C: 50200084920194 · IFSC: HDFC0001234 · UPI: 7396986817@upi"
  );

  // 3. Create Project Modal State
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [projTitle, setProjTitle] = useState("");
  const [projService, setProjService] = useState("Commercial Video");
  const [projDueDate, setProjDueDate] = useState(
    new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0]
  );
  const [projBudget, setProjBudget] = useState("50000");
  const [projDescription, setProjDescription] = useState("");

  // 4. Record Payment Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentRef, setPaymentRef] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);

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
        setShootLocation(data.item.city || "WasShot Media Studio, Hyderabad");
      }
    } catch (err) {
      console.error("Failed to load client details", err);
    } finally {
      setLoading(false);
    }
  };

  // HANDLER: Schedule Shoot for this Client
  const handleScheduleShoot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shootTitle.trim() || !shootStart) {
      alert("Please provide a shoot title and start time.");
      return;
    }
    setSavingShoot(true);
    try {
      const startDate = new Date(shootStart);
      const endDate = shootEnd ? new Date(shootEnd) : new Date(startDate.getTime() + 4 * 3600000); // default 4 hrs

      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: shootTitle.trim(),
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          clientId: id,
          location: shootLocation.trim(),
          equipmentNeeded: shootEquipment ? shootEquipment.split(",").map((s) => s.trim()).filter(Boolean) : [],
          notes: shootNotes.trim(),
          status: "confirmed",
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "Failed to schedule shoot");
        return;
      }

      await loadClientData();
      setShowShootModal(false);
      setShootTitle("");
      setActiveTab("shoots");
      alert(`Shoot successfully scheduled for ${client.name}!`);
    } catch (err: any) {
      alert(err.message || "Failed to schedule shoot");
    } finally {
      setSavingShoot(false);
    }
  };

  // HANDLER: Create Invoice for this Client
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (invItems.length === 0) {
      alert("Please add at least one line item.");
      return;
    }
    setSavingInvoice(true);
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: id,
          issueDate: new Date(invIssueDate).toISOString(),
          dueDate: new Date(invDueDate).toISOString(),
          items: invItems.map((item) => {
            const qty = Number(item.quantity) || 1;
            const rate = Number(item.unitPrice) || 0;
            return {
              description: item.description,
              quantity: qty,
              unitPrice: rate,
              price: rate,
              amount: qty * rate,
            };
          }),
          taxRate: invTaxRate,
          notes: invNotes,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "Failed to create invoice");
        return;
      }

      const created = await res.json();
      await loadClientData();
      setShowInvoiceModal(false);
      setActiveTab("invoices");

      const createdId = created.item?._id;
      if (createdId && window.confirm("Invoice created! Would you like to view the downloadable PDF now?")) {
        router.push(`/invoice/${createdId}`);
      }
    } catch (err: any) {
      alert(err.message || "Failed to create invoice");
    } finally {
      setSavingInvoice(false);
    }
  };

  // HANDLER: Create Project for this Client
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) {
      alert("Please enter a project title.");
      return;
    }
    setSavingProject(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projTitle.trim(),
          name: projTitle.trim(),
          clientId: id,
          services: [projService],
          dueDate: new Date(projDueDate).toISOString(),
          budget: parseFloat(projBudget) || 0,
          description: projDescription.trim(),
          stage: "production",
          status: "in_progress",
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "Failed to create project");
        return;
      }

      await loadClientData();
      setShowProjectModal(false);
      setProjTitle("");
      setActiveTab("projects");
      alert(`Project "${projTitle}" created!`);
    } catch (err: any) {
      alert(err.message || "Failed to create project");
    } finally {
      setSavingProject(false);
    }
  };

  // HANDLER: Record Payment for Invoice
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !paymentAmount) return;
    setSavingPayment(true);
    try {
      let res = await fetch(`/api/admin/invoices/${selectedInvoice._id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          paymentMethod,
          method: paymentMethod,
          reference: paymentRef,
        }),
      });

      if (!res.ok) {
        res = await fetch(`/api/admin/invoices/${selectedInvoice._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "payment",
            amount: parseFloat(paymentAmount),
            paymentMethod,
            method: paymentMethod,
            reference: paymentRef,
          }),
        });
      }

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "Failed to record payment");
        return;
      }

      await loadClientData();
      setSelectedInvoice(null);
      setPaymentAmount("");
      alert("Payment recorded successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to record payment");
    } finally {
      setSavingPayment(false);
    }
  };

  // HANDLER: Update Client Profile
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

  // HANDLER: Delete Client
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

  const handleCopyInvoiceLink = (invId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://wasshot.in";
    const link = `${origin}/invoice/${invId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedId(invId);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange border-r-transparent mb-3" />
        <p className="font-display text-xs font-bold uppercase tracking-widest text-muted">
          Loading client profile & records...
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

  // Summary financials
  const totalBilled = invoices.reduce((s, i) => s + (i.total || 0), 0);
  const totalBalance = invoices.reduce((s, i) => s + (i.balance !== undefined ? i.balance : i.total || 0), 0);

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
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
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

        {/* 1-TAP ACTION BUTTONS FOR THIS CLIENT */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Schedule Shoot Button */}
          <button
            onClick={() => {
              setShootTitle(`${client.name} - Commercial Shoot`);
              setShowShootModal(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-orange px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e03d07] transition"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>+ Schedule Shoot</span>
          </button>

          {/* New Invoice Button */}
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-orange transition"
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>+ New Invoice</span>
          </button>

          {/* New Project Button */}
          <button
            onClick={() => setShowProjectModal(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e8e3] bg-white px-3 py-2 text-xs font-bold text-ink hover:bg-black/[0.04] transition"
          >
            <Briefcase className="h-3.5 w-3.5 text-orange" />
            <span>+ Project</span>
          </button>

          {/* Quick WhatsApp */}
          {rawPhone && (
            <a
              href={`https://wa.me/${rawPhone}?text=${encodeURIComponent(`Hi ${client.name}, WasShot Media team here!`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-600 hover:text-white transition"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </a>
          )}

          {/* Quick Call */}
          {client.phone && (
            <a
              href={`tel:${client.phone}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e8e3] bg-white px-3 py-2 text-xs font-semibold text-ink hover:bg-black/[0.04]"
              title="Call client"
            >
              <Phone className="h-3.5 w-3.5 text-orange" />
              <span>Call</span>
            </a>
          )}

          {/* Quick Email */}
          {client.email && (
            <a
              href={`mailto:${client.email}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e8e3] bg-white px-3 py-2 text-xs font-semibold text-ink hover:bg-black/[0.04]"
              title="Send email"
            >
              <Mail className="h-3.5 w-3.5 text-orange" />
            </a>
          )}

          {/* Edit Profile */}
          <button
            onClick={() => setShowEditModal(true)}
            className="rounded-full border border-[#e8e8e3] bg-white p-2 text-muted hover:text-ink hover:bg-black/[0.04] transition"
            title="Edit Client Profile"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>

          {/* Delete Client */}
          <button
            onClick={handleDeleteClient}
            disabled={deleting}
            className="rounded-full border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-600 hover:text-white transition disabled:opacity-50"
            title="Delete Client"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* QUICK FINANCIAL METRICS CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-[#e8e8e3] bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Billed</span>
          <p className="mt-1 font-mono text-xl font-extrabold text-ink">{formatMoney(totalBilled)}</p>
          <span className="text-[10px] text-muted">{invoices.length} Invoices</span>
        </div>
        <div className="rounded-2xl border border-[#e8e8e3] bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Balance Due</span>
          <p className={`mt-1 font-mono text-xl font-extrabold ${totalBalance > 0 ? "text-red-600" : "text-emerald-600"}`}>
            {formatMoney(totalBalance)}
          </p>
          <span className="text-[10px] text-muted">{totalBalance > 0 ? "Pending collection" : "All cleared"}</span>
        </div>
        <div className="rounded-2xl border border-[#e8e8e3] bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Shoots Scheduled</span>
          <p className="mt-1 font-mono text-xl font-extrabold text-ink">{events.length}</p>
          <span className="text-[10px] text-muted">Calendar sessions</span>
        </div>
        <div className="rounded-2xl border border-[#e8e8e3] bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Projects</span>
          <p className="mt-1 font-mono text-xl font-extrabold text-ink">{projects.length}</p>
          <span className="text-[10px] text-muted">Deliverable suites</span>
        </div>
      </div>

      {/* 2. TABS */}
      <div className="flex border-b border-[#e8e8e3] gap-2 overflow-x-auto no-scrollbar">
        {[
          { key: "overview", label: "Overview", count: null },
          { key: "shoots", label: "Shoots & Calendar", count: events.length },
          { key: "invoices", label: "Invoices & Payments", count: invoices.length },
          { key: "projects", label: "Projects", count: projects.length },
          { key: "tasks", label: "Tasks", count: tasks.length },
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

      {/* OVERVIEW TAB */}
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

          <div className="space-y-6 lg:col-span-2">
            {/* Quick Actions Panel */}
            <div className="rounded-2xl border border-[#e8e8e3] bg-linear-to-r from-orange/5 to-transparent p-5">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-orange mb-3">
                Quick Studio Operations for {client.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    setShootTitle(`${client.name} - Studio Shoot`);
                    setShowShootModal(true);
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#e8e8e3] bg-white hover:border-orange hover:shadow-xs transition text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange/10 text-orange">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink">Schedule Shoot</p>
                    <p className="text-[10px] text-muted">Book camera & gear</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#e8e8e3] bg-white hover:border-orange hover:shadow-xs transition text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-white">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink">Create Invoice</p>
                    <p className="text-[10px] text-muted">Generate PDF bill</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowProjectModal(true)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#e8e8e3] bg-white hover:border-orange hover:shadow-xs transition text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/[0.05] text-ink">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink">Add Project</p>
                    <p className="text-[10px] text-muted">Track deliverables</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Upcoming Shoots Snippet */}
            <div className="rounded-2xl sm:rounded-3xl border border-[#e8e8e3] bg-white p-4 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-3">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
                  Upcoming Shoots ({events.length})
                </h3>
                <button
                  onClick={() => {
                    setShootTitle(`${client.name} - Commercial Shoot`);
                    setShowShootModal(true);
                  }}
                  className="text-xs font-bold text-orange hover:underline"
                >
                  + Schedule Shoot →
                </button>
              </div>
              <div className="mt-3 divide-y divide-[#f0f0eb]">
                {events.length > 0 ? (
                  events.slice(0, 3).map((ev) => (
                    <div key={ev._id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-ink">{ev.title}</p>
                        <p className="text-muted text-[11px] mt-0.5">
                          {new Date(ev.start).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                          {ev.location ? ` · ${ev.location}` : ""}
                        </p>
                      </div>
                      <span className="rounded-full bg-orange/10 px-2.5 py-1 text-[10px] font-bold text-orange uppercase">
                        {ev.status || "scheduled"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted py-6 text-center">No shoots scheduled yet.</p>
                )}
              </div>
            </div>

            {/* Invoices Snippet */}
            <div className="rounded-2xl sm:rounded-3xl border border-[#e8e8e3] bg-white p-4 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-3">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
                  Recent Invoices ({invoices.length})
                </h3>
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="text-xs font-bold text-orange hover:underline"
                >
                  + Generate Invoice →
                </button>
              </div>
              <div className="mt-3 divide-y divide-[#f0f0eb]">
                {invoices.length > 0 ? (
                  invoices.slice(0, 3).map((inv) => (
                    <div key={inv._id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-ink">#{inv.invoiceNumber || inv.number || "INV"}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                            inv.status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-orange/10 text-orange"
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                        <p className="text-muted text-[11px]">Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "Immediate"}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-mono font-bold text-ink">{formatMoney(inv.total || 0)}</p>
                        <Link
                          href={`/invoice/${inv._id}`}
                          className="rounded-full border border-[#e8e8e3] px-2.5 py-1 text-[11px] font-bold text-ink hover:bg-orange hover:text-white hover:border-orange transition"
                        >
                          View PDF
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted py-6 text-center">No invoices generated yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHOOTS & CALENDAR TAB */}
      {activeTab === "shoots" && (
        <div className="rounded-2xl sm:rounded-3xl border border-[#e8e8e3] bg-white p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e8e8e3] pb-4">
            <div>
              <h3 className="font-display text-base font-bold text-ink">
                Shoots & Studio Sessions ({events.length})
              </h3>
              <p className="text-xs text-muted">
                Calendar events, filming dates, and gear reservations for {client.name}
              </p>
            </div>
            <button
              onClick={() => {
                setShootTitle(`${client.name} - Commercial Shoot`);
                setShowShootModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e03d07] transition"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>+ Schedule Shoot for {client.name}</span>
            </button>
          </div>

          <div className="mt-4">
            {events.length > 0 ? (
              <div className="divide-y divide-[#f0f0eb]">
                {events.map((ev) => {
                  const evStart = new Date(ev.start);
                  const formattedDate = evStart.toLocaleDateString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const formattedTime = evStart.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  });

                  // WhatsApp Shoot Confirmation Message
                  const shootWaMsg = encodeURIComponent(
                    `Hi ${client.name},\n\nThis is WasShot Media confirming your upcoming shoot:\n\n` +
                    `🎬 Shoot: ${ev.title}\n` +
                    `📅 Date: ${formattedDate}\n` +
                    `⏰ Time: ${formattedTime}\n` +
                    `📍 Location: ${ev.location || "WasShot Media Studio, Hyderabad"}\n\n` +
                    `See you on set!`
                  );
                  const shootWaUrl = rawPhone
                    ? `https://wa.me/${rawPhone}?text=${shootWaMsg}`
                    : `https://wa.me/?text=${shootWaMsg}`;

                  return (
                    <div key={ev._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-ink text-sm">{ev.title}</p>
                          <span className="rounded-full bg-orange/10 px-2.5 py-0.5 text-[10px] font-bold text-orange uppercase tracking-wider">
                            {ev.status || "scheduled"}
                          </span>
                        </div>
                        <p className="text-muted flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-orange" />
                          <span>{formattedDate} at {formattedTime}</span>
                          {ev.location && (
                            <>
                              <span>·</span>
                              <MapPin className="h-3.5 w-3.5 text-muted" />
                              <span>{ev.location}</span>
                            </>
                          )}
                        </p>
                        {ev.equipmentNeeded && ev.equipmentNeeded.length > 0 && (
                          <p className="text-muted text-[11px]">
                            <strong>Gear:</strong> {ev.equipmentNeeded.join(", ")}
                          </p>
                        )}
                        {ev.notes && (
                          <p className="text-muted text-[11px] italic bg-[#fafaf8] p-2 rounded-lg border border-[#ecece8] mt-1">
                            {ev.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {rawPhone && (
                          <a
                            href={shootWaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-600 hover:text-white transition"
                            title="Send shoot confirmation to client on WhatsApp"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>WhatsApp Shoot Info</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted">
                <Calendar className="h-8 w-8 text-muted/40 mx-auto mb-2" />
                <p>No shoots or calendar events booked for this client yet.</p>
                <button
                  onClick={() => {
                    setShootTitle(`${client.name} - Commercial Shoot`);
                    setShowShootModal(true);
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e03d07]"
                >
                  <Plus className="h-3.5 w-3.5" /> Schedule First Shoot
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INVOICES TAB */}
      {activeTab === "invoices" && (
        <div className="rounded-2xl sm:rounded-3xl border border-[#e8e8e3] bg-white p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e8e8e3] pb-4">
            <div>
              <h3 className="font-display text-base font-bold text-ink">
                Client Invoices & Billings ({invoices.length})
              </h3>
              <p className="text-xs text-muted">
                Issue tax bills, share downloadable PDFs, record payments, and share on WhatsApp
              </p>
            </div>
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e03d07] transition"
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>+ Create Invoice for {client.name}</span>
            </button>
          </div>

          <div className="mt-4">
            {invoices.length > 0 ? (
              <div className="divide-y divide-[#f0f0eb]">
                {invoices.map((inv) => {
                  const invNum = inv.invoiceNumber || inv.number || `INV-${String(inv._id).slice(-6).toUpperCase()}`;
                  const invTotal = inv.total || 0;
                  const invBalance = inv.balance !== undefined ? inv.balance : Math.max(0, invTotal - (inv.paid || inv.amountPaid || 0));
                  const isPaid = inv.status === "paid" || invBalance === 0;

                  const origin = typeof window !== "undefined" ? window.location.origin : "https://wasshot.in";
                  const publicInvoiceUrl = `${origin}/invoice/${inv._id}`;

                  // Formatted WhatsApp message with direct invoice link & UPI details
                  const waMsg = encodeURIComponent(
                    `Hi ${client.name},\n\nHere is your official invoice #${invNum} from WasShot Media.\n\n` +
                    `Total Amount: ${formatMoney(invTotal)}\n` +
                    `Status: ${isPaid ? "PAID" : `Balance Due: ${formatMoney(invBalance)}`}\n\n` +
                    `View & Download your official PDF invoice here:\n${publicInvoiceUrl}\n\n` +
                    (!isPaid ? `UPI ID for direct settlement: 7396986817@upi\n\n` : "") +
                    `Thank you for working with WasShot Media!`
                  );

                  const waUrl = rawPhone
                    ? `https://wa.me/${rawPhone}?text=${waMsg}`
                    : `https://wa.me/?text=${waMsg}`;

                  const mailtoUrl = `mailto:${client.email || ""}?subject=${encodeURIComponent(
                    `Invoice #${invNum} from WasShot Media`
                  )}&body=${waMsg}`;

                  return (
                    <div key={inv._id} className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
                      {/* Left: Invoice info */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-ink text-sm">#{invNum}</span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : inv.status === "partially_paid"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-orange/10 text-orange border border-orange/20"
                            }`}
                          >
                            {isPaid ? "PAID" : inv.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-muted text-[11px]">
                          Issued: {inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : (inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "Recent")} ·
                          Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "Immediate"}
                        </p>
                        {inv.items && inv.items.length > 0 && (
                          <p className="text-muted text-[11px] truncate max-w-md">
                            {inv.items.map((it: any) => it.description).join(", ")}
                          </p>
                        )}
                      </div>

                      {/* Middle: Financials */}
                      <div className="lg:text-right shrink-0">
                        <p className="font-mono text-base font-extrabold text-ink">
                          {formatMoney(invTotal)}
                        </p>
                        <p className={`text-[11px] font-mono font-bold ${invBalance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                          {invBalance > 0 ? `Balance Due: ${formatMoney(invBalance)}` : "Settled"}
                        </p>
                      </div>

                      {/* Right: Actions (Download PDF, WhatsApp, Email, Record Payment) */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* 1. Download PDF / View */}
                        <Link
                          href={`/invoice/${inv._id}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-orange px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#e03d07] shadow-xs transition"
                          title="View and download printable A4 PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>PDF / View</span>
                        </Link>

                        {/* 2. Share WhatsApp */}
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-600 hover:text-white transition"
                          title="Share invoice with client via WhatsApp"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        {/* 3. Share Email */}
                        {client.email && (
                          <a
                            href={mailtoUrl}
                            className="inline-flex items-center gap-1 rounded-full border border-[#e8e8e3] bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-black/[0.04]"
                            title="Send invoice via email"
                          >
                            <Mail className="h-3.5 w-3.5 text-orange" />
                          </a>
                        )}

                        {/* 4. Copy Invoice Link */}
                        <button
                          type="button"
                          onClick={() => handleCopyInvoiceLink(inv._id)}
                          className="inline-flex items-center gap-1 rounded-full border border-[#e8e8e3] bg-white px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-black/[0.04]"
                          title="Copy direct shareable invoice link"
                        >
                          {copiedId === inv._id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* 5. Record Payment if balance > 0 */}
                        {!isPaid && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setPaymentAmount(invBalance.toString());
                            }}
                            className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50/70 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-600 hover:text-white transition"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>Record Payment</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted">
                <Receipt className="h-8 w-8 text-muted/40 mx-auto mb-2" />
                <p>No invoices generated yet for this client.</p>
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e03d07]"
                >
                  <Plus className="h-3.5 w-3.5" /> Create First Invoice
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROJECTS TAB */}
      {activeTab === "projects" && (
        <div className="rounded-2xl sm:rounded-3xl border border-[#e8e8e3] bg-white p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e8e8e3] pb-4">
            <div>
              <h3 className="font-display text-base font-bold text-ink">
                Client Projects ({projects.length})
              </h3>
              <p className="text-xs text-muted">Media deliverables and production phases for {client.name}</p>
            </div>
            <button
              onClick={() => setShowProjectModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e03d07] transition"
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>+ Create Project for {client.name}</span>
            </button>
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
              <div className="py-12 text-center text-xs text-muted">
                <Briefcase className="h-8 w-8 text-muted/40 mx-auto mb-2" />
                <p>No projects created yet for this client.</p>
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e03d07]"
                >
                  <Plus className="h-3.5 w-3.5" /> Create First Project
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TASKS TAB */}
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

      {/* ======================================================== */}
      {/* MODAL 1: SCHEDULE SHOOT FOR THIS CLIENT                  */}
      {/* ======================================================== */}
      {showShootModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="relative flex flex-col w-full max-w-lg max-h-[92vh] rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-[#e8e8e3] overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e8e8e3] px-5 py-4 bg-white shrink-0">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">Schedule Shoot for {client.name}</h3>
                <p className="text-xs text-muted">Book camera crew, studio time, and gear list</p>
              </div>
              <button
                type="button"
                onClick={() => setShowShootModal(false)}
                className="rounded-full p-1.5 text-muted hover:bg-black/[0.05]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form id="shootForm" onSubmit={handleScheduleShoot} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-ink mb-1">Shoot Title / Scope *</label>
                <input
                  type="text"
                  required
                  value={shootTitle}
                  onChange={(e) => setShootTitle(e.target.value)}
                  placeholder="e.g. 4K Commercial Shoot - Product Reel"
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink mb-1">Shoot Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={shootStart}
                    onChange={(e) => setShootStart(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink mb-1">Shoot End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={shootEnd}
                    onChange={(e) => setShootEnd(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Location / Studio</label>
                <input
                  type="text"
                  value={shootLocation}
                  onChange={(e) => setShootLocation(e.target.value)}
                  placeholder="e.g. WasShot Media Studio, Jubilee Hills, Hyderabad"
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Equipment & Camera Gear Needed</label>
                <input
                  type="text"
                  value={shootEquipment}
                  onChange={(e) => setShootEquipment(e.target.value)}
                  placeholder="e.g. Sony FX3, 24-70mm GM II, DJI RS3 Pro"
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
                <span className="text-[10px] text-muted">Separate items with commas</span>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Director & Crew Notes</label>
                <textarea
                  rows={3}
                  value={shootNotes}
                  onChange={(e) => setShootNotes(e.target.value)}
                  placeholder="Wardrobe details, call times, shot list references..."
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 border-t border-[#e8e8e3] px-5 py-3.5 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setShowShootModal(false)}
                className="rounded-full border border-[#e8e8e3] px-4 py-2 text-xs font-semibold text-muted hover:text-ink hover:bg-black/[0.04]"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="shootForm"
                disabled={savingShoot}
                className="inline-flex items-center gap-1.5 rounded-full bg-orange px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e03d07] disabled:opacity-50"
              >
                {savingShoot ? "Booking Shoot..." : "Confirm & Schedule Shoot"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CREATE INVOICE FOR THIS CLIENT                  */}
      {/* ======================================================== */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="relative flex flex-col w-full max-w-xl max-h-[92vh] rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-[#e8e8e3] overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e8e8e3] px-5 py-4 bg-white shrink-0">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">New Invoice for {client.name}</h3>
                <p className="text-xs text-muted">Generate professional PDF bill with 18% GST breakdown</p>
              </div>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="rounded-full p-1.5 text-muted hover:bg-black/[0.05]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form id="invoiceForm" onSubmit={handleCreateInvoice} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink mb-1">Issue Date *</label>
                  <input
                    type="date"
                    required
                    value={invIssueDate}
                    onChange={(e) => setInvIssueDate(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-ink">Line Items & Deliverables *</label>
                  <button
                    type="button"
                    onClick={() =>
                      setInvItems([...invItems, { description: "High-Res Color Grading & Sound Master", quantity: 1, unitPrice: 15000 }])
                    }
                    className="text-orange font-bold hover:underline text-[11px]"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {invItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center bg-[#fafaf8] p-2 rounded-xl border border-[#ecece8]">
                      <input
                        type="text"
                        required
                        placeholder="Item description..."
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...invItems];
                          updated[index].description = e.target.value;
                          setInvItems(updated);
                        }}
                        className="flex-1 rounded-lg border border-[#e8e8e3] bg-white px-2.5 py-1.5 text-xs text-ink focus:border-orange focus:outline-none"
                      />
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...invItems];
                          updated[index].quantity = parseInt(e.target.value) || 1;
                          setInvItems(updated);
                        }}
                        className="w-16 rounded-lg border border-[#e8e8e3] bg-white px-2 py-1.5 text-center text-xs text-ink focus:border-orange focus:outline-none"
                        title="Quantity"
                      />
                      <input
                        type="number"
                        min="0"
                        required
                        value={item.unitPrice}
                        onChange={(e) => {
                          const updated = [...invItems];
                          updated[index].unitPrice = parseFloat(e.target.value) || 0;
                          setInvItems(updated);
                        }}
                        className="w-24 rounded-lg border border-[#e8e8e3] bg-white px-2 py-1.5 text-right text-xs text-ink focus:border-orange focus:outline-none"
                        title="Unit Rate (₹)"
                      />
                      {invItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setInvItems(invItems.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink mb-1">GST Tax Rate (%)</label>
                  <input
                    type="number"
                    value={invTaxRate}
                    onChange={(e) => setInvTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink mb-1">Payment Instructions</label>
                  <input
                    type="text"
                    value={invNotes}
                    onChange={(e) => setInvNotes(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Calculated Totals Preview */}
              <div className="rounded-xl bg-[#f9f9f7] p-3 border border-[#ecece8] space-y-1 text-xs">
                {(() => {
                  const subtotal = invItems.reduce((s, it) => s + (it.quantity * it.unitPrice), 0);
                  const gst = Math.round((subtotal * invTaxRate) / 100);
                  const total = subtotal + gst;
                  return (
                    <>
                      <div className="flex justify-between text-muted">
                        <span>Subtotal:</span>
                        <span className="font-mono">{formatMoney(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-muted">
                        <span>GST ({invTaxRate}%):</span>
                        <span className="font-mono">{formatMoney(gst)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-ink border-t border-[#e8e8e3] pt-1">
                        <span>Total Payable:</span>
                        <span className="font-mono text-orange text-sm">{formatMoney(total)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 border-t border-[#e8e8e3] px-5 py-3.5 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="rounded-full border border-[#e8e8e3] px-4 py-2 text-xs font-semibold text-muted hover:text-ink hover:bg-black/[0.04]"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="invoiceForm"
                disabled={savingInvoice}
                className="inline-flex items-center gap-1.5 rounded-full bg-orange px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e03d07] disabled:opacity-50"
              >
                {savingInvoice ? "Generating..." : "Generate Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CREATE PROJECT FOR THIS CLIENT                  */}
      {/* ======================================================== */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="relative flex flex-col w-full max-w-lg max-h-[92vh] rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-[#e8e8e3] overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e8e8e3] px-5 py-4 bg-white shrink-0">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">New Project for {client.name}</h3>
                <p className="text-xs text-muted">Initialize production roadmap and deliverables</p>
              </div>
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="rounded-full p-1.5 text-muted hover:bg-black/[0.05]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form id="projectForm" onSubmit={handleCreateProject} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-ink mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="e.g. Summer Brand Campaign 2026"
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink mb-1">Service Type</label>
                  <select
                    value={projService}
                    onChange={(e) => setProjService(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                  >
                    <option value="Commercial Video">Commercial Video</option>
                    <option value="Product Photography">Product Photography</option>
                    <option value="Post-Production & VFX">Post-Production & VFX</option>
                    <option value="Social Media Retainer">Social Media Retainer</option>
                    <option value="Brand Identity & Web">Brand Identity & Web</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-ink mb-1">Target Delivery Date</label>
                  <input
                    type="date"
                    value={projDueDate}
                    onChange={(e) => setProjDueDate(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Project Budget (₹)</label>
                <input
                  type="number"
                  value={projBudget}
                  onChange={(e) => setProjBudget(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Description & Scope</label>
                <textarea
                  rows={3}
                  value={projDescription}
                  onChange={(e) => setProjDescription(e.target.value)}
                  placeholder="Video duration, aspect ratios (9:16, 16:9), revisions limit..."
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 border-t border-[#e8e8e3] px-5 py-3.5 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="rounded-full border border-[#e8e8e3] px-4 py-2 text-xs font-semibold text-muted hover:text-ink hover:bg-black/[0.04]"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="projectForm"
                disabled={savingProject}
                className="inline-flex items-center gap-1.5 rounded-full bg-orange px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e03d07] disabled:opacity-50"
              >
                {savingProject ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: RECORD PAYMENT                                  */}
      {/* ======================================================== */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="relative flex flex-col w-full max-w-md rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-[#e8e8e3] overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e8e8e3] px-5 py-4 bg-white shrink-0">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">Record Settlement</h3>
                <p className="text-xs text-muted">
                  Invoice #{selectedInvoice.invoiceNumber || selectedInvoice.number || "INV"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="rounded-full p-1.5 text-muted hover:bg-black/[0.05]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-ink mb-1">Amount Paid (₹) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-sm font-bold font-mono text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="cash">Cash Settlement</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Transaction Ref / UTR / Note</label>
                <input
                  type="text"
                  placeholder="e.g. UTR-493820194830"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8e8e3]">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="rounded-full border border-[#e8e8e3] px-4 py-2 text-xs font-semibold text-muted hover:text-ink hover:bg-black/[0.04]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPayment}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
                >
                  {savingPayment ? "Saving..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: EDIT CLIENT PROFILE                             */}
      {/* ======================================================== */}
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
