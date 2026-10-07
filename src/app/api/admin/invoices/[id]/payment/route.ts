import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { requireUser, lean, logActivity } from "@/lib/admin-guard";
import { errorJson, json } from "@/lib/utils";
import { isMongoConnected } from "@/lib/db";
import { localStore } from "@/lib/local-store";
import { Invoice, Payment } from "@/models";
import { deriveInvoiceStatus } from "@/lib/domain";

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { session, response } = await requireUser();
  if (!session) return response;
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));

  const amount = Number(body.amount || 0);
  if (!amount || amount <= 0) {
    return errorJson("Invalid payment amount", 400);
  }

  const method = body.paymentMethod || body.method || "upi";
  const notes = body.reference || body.notes || "";

  // Local store fallback
  if (!isMongoConnected()) {
    const existing = localStore.findById("invoices", id);
    if (!existing) return errorJson("Invoice not found", 404);

    const paid = (existing.amountPaid || 0) + amount;
    const balance = Math.max(0, (existing.total || 0) - paid);
    const updated = localStore.findByIdAndUpdate("invoices", id, {
      amountPaid: paid,
      balance,
      status: balance === 0 ? "paid" : "partially_paid",
    });

    localStore.create("payments", {
      invoiceId: id,
      amount,
      method,
      notes,
    });

    localStore.logActivity("payment:invoice", "invoices", id, { amount, balance }, session.name);
    return json({ item: updated });
  }

  // MongoDB path
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return errorJson("Invalid invoice ID", 400);
  }

  const existing = await Invoice.findById(id);
  if (!existing) return errorJson("Invoice not found", 404);

  await Payment.create({
    invoiceId: existing._id,
    amount,
    method,
    notes,
    paidAt: new Date(),
  });

  existing.paid = (existing.paid || 0) + amount;
  existing.balance = Math.max(0, (existing.total || 0) - existing.paid);
  existing.status = deriveInvoiceStatus({
    current: existing.status,
    total: existing.total || 0,
    paid: existing.paid,
    dueDate: existing.dueDate,
  });
  await existing.save();

  await logActivity(session, "payment:invoice", "invoices", id, {
    amount,
    newBalance: existing.balance,
    status: existing.status,
  });

  return json({
    item: {
      ...lean(existing),
      invoiceNumber: existing.invoiceNumber || existing.number,
    },
  });
}

export const runtime = "nodejs";
