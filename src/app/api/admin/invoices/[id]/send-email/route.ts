import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { requireUser, logActivity } from "@/lib/admin-guard";
import { errorJson, json } from "@/lib/utils";
import { connectDb, isMongoConnected } from "@/lib/db";
import { Invoice, Client } from "@/models";
import { localStore } from "@/lib/local-store";
import { sendInvoiceEmail } from "@/lib/mail";

export async function POST(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireUser();
  if (!session) return response;

  const { id } = await ctx.params;
  if (!id) return errorJson("Invoice ID required", 400);

  let invoice: any = null;
  let client: any = null;

  try {
    await connectDb();
    if (isMongoConnected()) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        invoice = await Invoice.findById(id).lean();
      } else {
        invoice = await Invoice.findOne({ invoiceNumber: id }).lean();
      }

      if (invoice && invoice.clientId) {
        client = await Client.findById(invoice.clientId).lean();
      }
    }
  } catch (err) {
    console.warn("MongoDB invoice fetch error:", err);
  }

  // Fallback to localStore
  if (!invoice) {
    invoice = localStore.findById("invoices" as any, id) ||
              localStore.find("invoices" as any).find((i: any) => i.invoiceNumber === id || i.number === id);
    if (invoice && invoice.clientId) {
      client = localStore.findById("clients" as any, invoice.clientId);
    }
  }

  if (!invoice) {
    return errorJson("Invoice record not found", 404);
  }

  if (!client || !client.email) {
    return errorJson("Client has no registered email address to receive the invoice.", 400);
  }

  const result = await sendInvoiceEmail(invoice, client);

  if (!result.sent) {
    return errorJson(result.reason || "Failed to deliver email through mail provider.", 502);
  }

  await logActivity(session, "send_email:invoice", "invoices", id, {
    recipient: client.email,
    invoiceNumber: invoice.invoiceNumber || invoice.number,
  });

  return json({
    ok: true,
    message: `Tax invoice successfully emailed to ${client.email}!`,
  });
}

export const runtime = "nodejs";
