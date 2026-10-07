"use client";

import { useEffect, useState } from "react";
import {
  Receipt,
  Search,
  Filter,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  DollarSign,
  TrendingUp,
  X,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { formatMoney } from "@/lib/utils";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  client?: { _id: string; name: string; company?: string };
  project?: { _id: string; title: string };
  issueDate: string;
  dueDate: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; amount: number }>;
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: "draft" | "issued" | "partially_paid" | "paid" | "overdue" | "cancelled";
  notes?: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Create Invoice Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formClientId, setFormClientId] = useState("");
  const [formProjectId, setFormProjectId] = useState("");
  const [formIssueDate, setFormIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formDueDate, setFormDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );
  const [formItems, setFormItems] = useState([
    { description: "Cinematography & 4K Production", quantity: 1, unitPrice: 45000 },
  ]);
  const [formTaxRate, setFormTaxRate] = useState(18); // GST 18%
  const [formNotes, setFormNotes] = useState(
    "Bank: HDFC Bank · WasShot Media · IFSC: HDFC0001234 · UPI: 7396986817@upi"
  );

  // Record Payment Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentRef, setPaymentRef] = useState("");
  const [recordingPayment, setRecordingPayment] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, cliRes, projRes] = await Promise.all([
        fetch("/api/admin/invoices").then((r) => r.json()).catch(() => ({ items: [] })),
        fetch("/api/admin/clients").then((r) => r.json()).catch(() => ({ items: [] })),
        fetch("/api/admin/projects").then((r) => r.json()).catch(() => ({ items: [] })),
      ]);

      setInvoices(invRes.items || []);
      setClients(cliRes.items || []);
      setProjects(projRes.items || []);
    } catch (err) {
      console.error("Failed to load invoices", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientId || formItems.length === 0) {
      alert("Please select a client and add at least one line item.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: formClientId,
          projectId: formProjectId || undefined,
          issueDate: new Date(formIssueDate).toISOString(),
          dueDate: new Date(formDueDate).toISOString(),
          items: formItems.map((item) => {
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
          taxRate: formTaxRate,
          notes: formNotes,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.error || (data.issues ? JSON.stringify(data.issues) : "Failed to create invoice");
        alert(`Failed to create invoice: ${msg}`);
        return;
      }

      await loadData();
      setShowCreateModal(false);
      setFormClientId("");
      setFormProjectId("");
      setFormItems([
        { description: "Cinematography & 4K Production", quantity: 1, unitPrice: 45000 },
      ]);
    } catch (err: any) {
      alert(err.message || "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !paymentAmount) return;

    setRecordingPayment(true);
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

      if (res.ok) {
        await loadData();
        setSelectedInvoice(null);
        setPaymentAmount("");
        setPaymentRef("");
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "Failed to record payment");
      }
    } catch (err: any) {
      alert(err.message || "Failed to record payment");
    } finally {
      setRecordingPayment(false);
    }
  };

  // Calculations for Overview Cards
  const totalInvoiced = invoices.reduce((s, inv) => s + (inv.total || 0), 0);
  const totalCollected = invoices.reduce((s, inv) => s + (inv.amountPaid || 0), 0);
  const totalOutstanding = invoices.reduce((s, inv) => s + (inv.balance ?? inv.total ?? 0), 0);
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;

  const filtered = invoices.filter((inv) => {
    if (filterStatus !== "all" && inv.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = (inv.invoiceNumber || (inv as any).number || "").toLowerCase().includes(q);
      const matchClient = inv.client?.name?.toLowerCase().includes(q);
      if (!matchNum && !matchClient) return false;
    }
    return true;
  });

  return (
    <div suppressHydrationWarning className="space-y-6">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e8e8e3] pb-5 sm:flex-row sm:items-center">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-orange">
            Financial Management · Studio Billings
          </span>
          <h1 className="display text-3xl font-extrabold text-ink">
            Invoices & Payments ({invoices.length})
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Generate client invoices, track GST/tax, and record payments via UPI and Bank Transfer.
          </p>
        </div>

        <button
          suppressHydrationWarning
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#e03d07]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>+ New Invoice</span>
        </button>
      </div>

      {/* 2. FINANCIAL METRICS CARDS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#e8e8e3] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Invoiced</span>
            <Receipt className="h-4 w-4 text-orange" />
          </div>
          <p className="display mt-2 text-2xl font-extrabold text-ink">
            {formatMoney(totalInvoiced)}
          </p>
          <span className="text-[10px] text-muted">Lifetime billed</span>
        </div>

        <div className="rounded-2xl border border-[#e8e8e3] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Collected</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="display mt-2 text-2xl font-extrabold text-emerald-600">
            {formatMoney(totalCollected)}
          </p>
          <span className="text-[10px] text-muted">Received in bank/UPI</span>
        </div>

        <div className="rounded-2xl border border-[#e8e8e3] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider">Outstanding Balance</span>
            <Clock className="h-4 w-4 text-orange" />
          </div>
          <p className="display mt-2 text-2xl font-extrabold text-ink">
            {formatMoney(totalOutstanding)}
          </p>
          <span className="text-[10px] text-muted">Awaiting settlement</span>
        </div>

        <div className="rounded-2xl border border-[#e8e8e3] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider">Overdue Invoices</span>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <p className="display mt-2 text-2xl font-extrabold text-red-600">
            {overdueCount}
          </p>
          <span className="text-[10px] text-muted">Action required</span>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e8e8e3] bg-white p-3 text-xs">
        <div className="flex flex-1 items-center gap-2">
          <Search className="h-4 w-4 text-muted" />
          <input
            suppressHydrationWarning
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice number or client name..."
            className="w-full bg-transparent text-xs text-ink placeholder-muted focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-orange" />
          <select
            suppressHydrationWarning
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-[#e8e8e3] bg-[#fbfbfa] px-2.5 py-1 text-xs font-medium text-ink focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="issued">Issued</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* 4. INVOICES TABLE */}
      <div className="rounded-2xl sm:rounded-3xl border border-[#e8e8e3] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead>
              <tr className="border-b border-[#e8e8e3] bg-[#fafaf8] text-[10px] font-bold uppercase tracking-wider text-muted">
                <th className="px-5 py-3">Invoice #</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0eb]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-muted">
                    Loading invoices...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-muted">
                    No invoices found. Click &quot;+ New Invoice&quot; to generate an invoice.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv._id} className="hover:bg-[#fbfbfa] transition">
                    <td className="px-5 py-3.5 font-bold text-ink">
                      #{inv.invoiceNumber || (inv as any).number || "INV"}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-ink">{inv.client?.name || "Client"}</p>
                      {inv.client?.company && (
                        <p className="text-[11px] text-muted">{inv.client.company}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-muted">
                      {new Date(inv.dueDate).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-ink">
                      {formatMoney(inv.total)}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-semibold text-muted">
                      {inv.balance > 0 ? formatMoney(inv.balance) : "₹0"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          inv.status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : inv.status === "partially_paid"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : inv.status === "overdue"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-orange/10 text-orange border border-orange/20"
                        }`}
                      >
                        {inv.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {inv.status !== "paid" && (
                        <button
                          suppressHydrationWarning
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setPaymentAmount(inv.balance ? inv.balance.toString() : inv.total.toString());
                          }}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white"
                        >
                          <CreditCard className="h-3 w-3" />
                          <span>Record Payment</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. CREATE INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="relative flex flex-col w-full max-w-2xl max-h-[92vh] rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-[#e8e8e3] overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header (Sticky at top) */}
            <div className="flex items-center justify-between border-b border-[#e8e8e3] px-5 py-4 bg-white shrink-0">
              <div>
                <h3 className="display text-xl font-bold text-ink">Generate Studio Invoice</h3>
                <p className="text-xs text-muted">Create client bill with GST breakdown and banking info</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-full p-1.5 text-muted hover:bg-black/[0.05]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="createInvoiceForm" onSubmit={handleCreateInvoice} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                  <label className="block font-bold text-ink mb-1">Project</label>
                  <select
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-ink focus:border-orange focus:bg-white focus:outline-none"
                  >
                    <option value="">Select Project (Optional)</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block font-bold text-ink mb-1">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={formIssueDate}
                    onChange={(e) => setFormIssueDate(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">GST Tax Rate (%)</label>
                  <input
                    type="number"
                    value={formTaxRate}
                    onChange={(e) => setFormTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Line items */}
              <div>
                <label className="block font-bold text-ink mb-2">Line Items</label>
                <div className="space-y-3">
                  {formItems.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center p-2 sm:p-0 rounded-xl bg-[#fbfbfa] sm:bg-transparent border sm:border-0 border-[#e8e8e3]">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...formItems];
                          updated[idx].description = e.target.value;
                          setFormItems(updated);
                        }}
                        placeholder="Description of service / equipment"
                        className="flex-1 rounded-xl border border-[#e8e8e3] bg-white sm:bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...formItems];
                            updated[idx].quantity = parseInt(e.target.value) || 1;
                            setFormItems(updated);
                          }}
                          placeholder="Qty"
                          className="w-20 rounded-xl border border-[#e8e8e3] bg-white sm:bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none text-center"
                        />
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const updated = [...formItems];
                            updated[idx].unitPrice = parseFloat(e.target.value) || 0;
                            setFormItems(updated);
                          }}
                          placeholder="Rate ₹"
                          className="flex-1 sm:w-32 rounded-xl border border-[#e8e8e3] bg-white sm:bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                        />
                        {formItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFormItems(formItems.filter((_, i) => i !== idx))}
                            className="p-2 text-muted hover:text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setFormItems([
                        ...formItems,
                        { description: "Video Editing & Post-Production", quantity: 1, unitPrice: 20000 },
                      ])
                    }
                    className="text-orange font-bold hover:underline"
                  >
                    + Add Item
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Payment Instructions & Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] p-2.5 text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>
            </form>

            {/* Sticky Action Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-[#e8e8e3] px-5 py-3.5 bg-[#fafaf8] shrink-0">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-full border border-[#e8e8e3] bg-white px-5 py-2 font-semibold text-muted hover:text-ink transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="createInvoiceForm"
                disabled={saving}
                className="rounded-full bg-orange px-6 py-2 font-bold text-white shadow-xs hover:bg-[#e03d07] disabled:opacity-50 transition"
              >
                {saving ? "Creating..." : "Generate Invoice →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. RECORD PAYMENT MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#e8e8e3]">
            <div className="flex items-center justify-between border-b border-[#e8e8e3] pb-4">
              <div>
                <h3 className="display text-xl font-bold text-ink">Record Payment</h3>
                <p className="text-xs text-muted">
                  Invoice #{selectedInvoice.invoiceNumber || (selectedInvoice as any).number || "INV"} · Balance:{" "}
                  <strong>{formatMoney(selectedInvoice.balance)}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="rounded-full p-1.5 text-muted hover:bg-black/[0.05]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-ink mb-1">Payment Amount (₹ INR) *</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-base font-bold text-ink focus:border-orange focus:bg-white focus:outline-none"
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
                  <option value="bank_transfer">Bank Transfer (NEFT / IMPS / RTGS)</option>
                  <option value="cash">Cash Settlement</option>
                  <option value="card">Card / POS</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Transaction Ref / UTR / Note</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. UPI-123456789 or NEFT-AXIS001"
                  className="w-full rounded-xl border border-[#e8e8e3] bg-[#fbfbfa] px-3 py-2 text-ink focus:border-orange focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#e8e8e3]">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="rounded-full border border-[#e8e8e3] px-4 py-2 font-semibold text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPayment}
                  className="rounded-full bg-emerald-600 px-5 py-2 font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
                >
                  {recordingPayment ? "Saving..." : "Confirm Payment →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
