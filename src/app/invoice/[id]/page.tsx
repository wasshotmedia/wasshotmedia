"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Printer,
  Share2,
  Download,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Copy,
  Check,
  MessageCircle,
  Mail,
  Building,
  CreditCard,
  QrCode,
  ExternalLink,
} from "lucide-react";
import { formatMoney } from "@/lib/utils";

interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  issueDate?: string;
  dueDate?: string;
  createdAt?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice?: number;
    price?: number;
    amount?: number;
  }>;
  subtotal: number;
  taxRate?: number;
  tax?: number;
  total: number;
  amountPaid?: number;
  balance?: number;
  status: "draft" | "issued" | "partially_paid" | "paid" | "overdue" | "cancelled";
  notes?: string;
  client?: {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    city?: string;
    address?: string;
  };
  project?: {
    name?: string;
    title?: string;
  };
}

export default function PublicInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${id}`);
      if (!res.ok) {
        // Fallback to admin route if logged in
        const adminRes = await fetch(`/api/admin/invoices/${id}`);
        if (adminRes.ok) {
          const adminData = await adminRes.json();
          if (adminData.item) {
            setInvoice(adminData.item);
            return;
          }
        }
        throw new Error("Invoice not found or inaccessible");
      }
      const data = await res.json();
      if (data.invoice) {
        setInvoice(data.invoice);
      } else {
        throw new Error("Invalid invoice data received");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://wasshot.in/invoice/${id}`;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d11] text-white flex flex-col items-center justify-center p-6">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange border-r-transparent mb-4" />
        <p className="font-display text-xs font-bold uppercase tracking-widest text-[#a0a0a8]">
          Loading WasShot Media Invoice...
        </p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[#0d0d11] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <h2 className="text-xl font-bold text-white mb-2">Invoice Unavailable</h2>
          <p className="text-xs text-[#a0a0a8] mb-6">
            {error || "We couldn't locate this invoice. It may have been archived or removed."}
          </p>
          <Link
            href="/admin/invoices"
            className="inline-flex items-center gap-2 rounded-full bg-orange px-5 py-2.5 text-xs font-bold text-white hover:bg-[#e03d07]"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Invoices
          </Link>
        </div>
      </div>
    );
  }

  const clientName = invoice.client?.name || "Valued Client";
  const clientCompany = invoice.client?.company;
  const clientPhone = invoice.client?.phone || "";
  const rawPhone = clientPhone.replace(/\D/g, "");
  const invoiceNumber = invoice.invoiceNumber || `INV-${String(invoice._id).slice(-6).toUpperCase()}`;
  const issueDateFormatted = invoice.issueDate
    ? new Date(invoice.issueDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
    : invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  const dueDateFormatted = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
    : "On Receipt";

  const total = invoice.total || 0;
  const balance = invoice.balance !== undefined ? invoice.balance : total;
  const isPaid = invoice.status === "paid" || balance === 0;

  // Pre-formatted WhatsApp Message
  const waMessage = encodeURIComponent(
    `Hi ${clientName},\n\nHere is your invoice #${invoiceNumber} from WasShot Media.\n\n` +
    `Total Amount: ${formatMoney(total)}\n` +
    `Status: ${isPaid ? "PAID" : `Balance Due: ${formatMoney(balance)}`}\n` +
    `Due Date: ${dueDateFormatted}\n\n` +
    `View and Download your official PDF invoice here:\n${currentUrl}\n\n` +
    (!isPaid ? `UPI ID for direct settlement: 7396986817@upi\n\n` : "") +
    `Thank you for working with WasShot Media!`
  );

  const waShareUrl = rawPhone
    ? `https://wa.me/${rawPhone}?text=${waMessage}`
    : `https://wa.me/?text=${waMessage}`;

  const mailtoUrl = `mailto:${invoice.client?.email || ""}?subject=${encodeURIComponent(
    `Invoice #${invoiceNumber} from WasShot Media`
  )}&body=${waMessage}`;

  const upiIntentUrl = `upi://pay?pa=7396986817@upi&pn=WasShot%20Media&am=${balance}&cu=INR&tn=Invoice%20${encodeURIComponent(invoiceNumber)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiIntentUrl)}`;

  return (
    <div className="min-h-screen bg-[#f4f4f2] text-ink selection:bg-orange selection:text-white print:bg-white print:p-0">
      {/* 1. TOP ACTION BAR (Hidden in print) */}
      <header className="sticky top-0 z-40 border-b border-[#e5e5e0] bg-white/95 backdrop-blur-md px-4 py-3 shadow-xs print:hidden">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/invoices"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e0e0dc] bg-white px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink hover:border-ink transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to Invoices</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-ink">#{invoiceNumber}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                  isPaid
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-orange/15 text-orange border border-orange/30"
                }`}
              >
                {isPaid ? "PAID" : invoice.status.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e0e0dc] bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-black/[0.04] transition"
              title="Copy shareable link"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Link Copied!" : "Copy Link"}</span>
            </button>

            <a
              href={waShareUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-600 hover:text-white transition shadow-xs"
              title="Share invoice on WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Share WhatsApp</span>
            </a>

            <a
              href={mailtoUrl}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e0e0dc] bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-black/[0.04] transition"
              title="Send via Email"
            >
              <Mail className="h-3.5 w-3.5 text-orange" />
              <span className="hidden sm:inline">Email</span>
            </a>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-1.5 text-xs font-bold text-white hover:bg-[#e03d07] shadow-xs transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF / Print</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. INVOICE A4 SHEET CONTAINER */}
      <main className="mx-auto max-w-4xl py-6 px-3 sm:px-6 print:max-w-none print:p-0 print:m-0">
        <div className="relative rounded-2xl sm:rounded-3xl border border-[#e2e2dc] bg-white p-6 sm:p-12 shadow-xl print:border-none print:shadow-none print:rounded-none print:p-8">
          {/* PAID WATERMARK BADGE */}
          {isPaid && (
            <div className="pointer-events-none absolute top-10 right-10 rotate-[-12deg] rounded-2xl border-4 border-emerald-600/60 bg-emerald-500/10 px-6 py-2 text-center text-2xl font-black uppercase tracking-widest text-emerald-700 print:border-emerald-600">
              PAID IN FULL
            </div>
          )}

          {/* STUDIO BRAND HEADER */}
          <div className="flex flex-col justify-between gap-6 border-b-2 border-ink pb-8 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange text-white font-black text-xl shadow-md">
                  W
                </span>
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-ink uppercase">
                    WasShot Media
                  </h1>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                    Cinema Productions & Creative Agency
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-0.5 text-xs text-muted leading-relaxed">
                <p className="font-semibold text-ink">WasShot Media Studio</p>
                <p>Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033</p>
                <p>
                  Email: <span className="text-ink font-semibold">wasshotmedia@gmail.com</span> · Phone:{" "}
                  <span className="text-ink font-semibold">+91 73969 86817</span>
                </p>
                <p>Website: https://wasshot.in · GSTIN: 36ABCDE1234F1Z5</p>
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="font-display text-xs font-black uppercase tracking-widest text-orange">
                TAX INVOICE
              </span>
              <p className="font-mono text-2xl font-black text-ink">
                #{invoiceNumber}
              </p>
              <div className="mt-3 space-y-1 text-xs">
                <p className="text-muted">
                  Date Issued: <strong className="text-ink font-semibold">{issueDateFormatted}</strong>
                </p>
                <p className="text-muted">
                  Payment Due: <strong className="text-ink font-semibold">{dueDateFormatted}</strong>
                </p>
                {invoice.project?.title && (
                  <p className="text-muted">
                    Project: <strong className="text-ink font-semibold">{invoice.project.title}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* CLIENT BILL TO */}
          <div className="grid grid-cols-1 gap-6 border-b border-[#e8e8e3] py-6 sm:grid-cols-2">
            <div>
              <span className="font-display text-[11px] font-extrabold uppercase tracking-wider text-muted">
                Billed To
              </span>
              <h2 className="mt-1 text-base font-extrabold text-ink">
                {clientName}
              </h2>
              {clientCompany && (
                <p className="text-xs font-semibold text-muted">{clientCompany}</p>
              )}
              {invoice.client?.city && (
                <p className="text-xs text-muted mt-1">{invoice.client.city}, India</p>
              )}
              {invoice.client?.phone && (
                <p className="text-xs text-muted mt-0.5">Phone: {invoice.client.phone}</p>
              )}
              {invoice.client?.email && (
                <p className="text-xs text-muted mt-0.5">Email: {invoice.client.email}</p>
              )}
            </div>

            <div className="sm:text-right space-y-1 sm:self-center">
              <span className="font-display text-[11px] font-extrabold uppercase tracking-wider text-muted">
                Invoice Status
              </span>
              <div className="flex sm:justify-end">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider ${
                    isPaid
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                      : "bg-orange/10 text-orange border border-orange/30"
                  }`}
                >
                  {isPaid ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Clock className="h-3.5 w-3.5" />}
                  <span>{isPaid ? "Settled / Paid" : invoice.status.replace("_", " ")}</span>
                </span>
              </div>
            </div>
          </div>

          {/* LINE ITEMS TABLE */}
          <div className="py-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-ink text-[11px] font-black uppercase tracking-wider text-ink">
                    <th className="py-3 pr-4">#</th>
                    <th className="py-3 px-4">Item & Scope Description</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Rate (₹)</th>
                    <th className="py-3 pl-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ecece8]">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, index) => {
                      const qty = Number(item.quantity) || 1;
                      const rate = Number(item.unitPrice || item.price) || 0;
                      const itemTotal = item.amount || qty * rate;
                      return (
                        <tr key={index} className="hover:bg-[#fafaf8]">
                          <td className="py-3.5 pr-4 text-muted font-bold">{index + 1}</td>
                          <td className="py-3.5 px-4 font-semibold text-ink">
                            {item.description || "Production Service Deliverable"}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-medium text-ink">
                            {qty}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-muted">
                            {formatMoney(rate)}
                          </td>
                          <td className="py-3.5 pl-4 text-right font-mono font-bold text-ink">
                            {formatMoney(itemTotal)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted">
                        Production Services as agreed in shoot statement.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* TOTALS CALCULATION */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between gap-6 border-t-2 border-ink pt-6">
              <div className="max-w-xs text-xs text-muted space-y-1">
                <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-ink">
                  Notes & Terms
                </span>
                <p className="leading-relaxed bg-[#f9f9f7] p-3 rounded-xl border border-[#ecece8]">
                  {invoice.notes ||
                    "Payment due within 14 days of issue. High-res deliverables and raw reels will be unlocked upon final settlement."}
                </p>
              </div>

              <div className="w-full sm:w-72 space-y-2 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-ink">
                    {formatMoney(invoice.subtotal || total)}
                  </span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>GST ({invoice.taxRate || 18}%)</span>
                  <span className="font-mono font-semibold text-ink">
                    {formatMoney(invoice.tax || Math.round((invoice.subtotal || total) * 0.18))}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#ecece8] pt-2 text-sm font-extrabold text-ink">
                  <span>Total Amount</span>
                  <span className="font-mono text-base text-orange font-black">
                    {formatMoney(total)}
                  </span>
                </div>
                {invoice.amountPaid ? (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Amount Paid</span>
                    <span className="font-mono">-{formatMoney(invoice.amountPaid)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between border-t-2 border-ink pt-2 font-mono text-base font-black text-ink">
                  <span>Balance Due</span>
                  <span className={balance > 0 ? "text-red-600" : "text-emerald-600"}>
                    {formatMoney(balance)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BANKING & UPI PAYMENT DETAILS */}
          <div className="mt-8 rounded-2xl border border-[#e0e0dc] bg-[#fafaf8] p-5 sm:p-6 print:border-ink print:bg-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-orange" />
                  <span className="font-display text-xs font-black uppercase tracking-wider text-ink">
                    Official Payment & Settlement Details
                  </span>
                </div>
                <p className="text-muted">
                  Account Name: <strong className="text-ink font-semibold">WasShot Media</strong>
                </p>
                <p className="text-muted">
                  Bank: <strong className="text-ink font-semibold">HDFC Bank</strong> · IFSC:{" "}
                  <strong className="text-ink font-semibold">HDFC0001234</strong>
                </p>
                <p className="text-muted">
                  A/C Number: <strong className="text-ink font-semibold font-mono">50200084920194</strong>
                </p>
                <p className="text-muted">
                  UPI ID: <strong className="text-ink font-semibold font-mono">7396986817@upi</strong>
                </p>
              </div>

              {/* UPI QR & Mobile 1-Tap Payment Button */}
              {!isPaid && balance > 0 && (
                <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-[#e5e5e0] pt-4 sm:pt-0 sm:pl-6">
                  {/* QR Image */}
                  <div className="flex flex-col items-center">
                    <img
                      src={qrCodeUrl}
                      alt="Scan to Pay via UPI"
                      className="h-24 w-24 rounded-lg border border-[#e0e0dc] bg-white p-1 shadow-xs"
                    />
                    <span className="mt-1 font-mono text-[9px] font-bold text-muted">Scan with any UPI App</span>
                  </div>

                  {/* 1-tap mobile button */}
                  <div className="print:hidden space-y-2">
                    <a
                      href={upiIntentUrl}
                      className="inline-flex items-center gap-2 rounded-xl bg-orange px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#e03d07] transition"
                    >
                      <span>Pay {formatMoney(balance)} via UPI</span>
                    </a>
                    <p className="text-[10px] text-muted">GPay · PhonePe · Paytm · Cred</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STUDIO FOOTER SIGN-OFF */}
          <div className="mt-10 border-t border-[#ecece8] pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-muted gap-4">
            <p className="text-center sm:text-left">
              Thank you for trusting WasShot Media with your creative vision.
            </p>
            <div className="text-center sm:text-right">
              <p className="font-bold text-ink">Authorized Signatory</p>
              <p className="font-display text-[10px] uppercase tracking-wider text-muted">
                WasShot Media Studio LLP
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* PRINT CSS STYLES FOR CRISP A4 PDF */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }
          body {
            background: white !important;
            color: black !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          header,
          button,
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
