import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDb, isMongoConnected } from "@/lib/db";
import { Invoice, Client, Project } from "@/models";
import { localStore } from "@/lib/local-store";
import { errorJson, json } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!id) return errorJson("Invoice ID required", 400);

  try {
    // 1. Try localStore if Mongo isn't connected
    if (!isMongoConnected()) {
      const inv = localStore.findById("invoices" as any, id) ||
                  localStore.find("invoices" as any).find((i: any) => i.invoiceNumber === id || i.number === id);
      if (!inv) return errorJson("Invoice not found", 404);

      const client = inv.clientId ? localStore.findById("clients" as any, inv.clientId) : null;
      const project = inv.projectId ? localStore.findById("projects" as any, inv.projectId) : null;

      return json({
        invoice: {
          ...inv,
          client: client || { name: "Client", email: "" },
          project: project || null,
        },
      });
    }

    // 2. MongoDB
    await connectDb();

    let query: any = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { invoiceNumber: id }, { number: id }] };
    } else {
      query = { $or: [{ invoiceNumber: id }, { number: id }] };
    }

    const invoice = await Invoice.findOne(query)
      .populate("clientId", "name company email phone city address business")
      .populate("projectId", "title name stage")
      .lean();

    if (!invoice) {
      return errorJson("Invoice not found", 404);
    }

    // Normalize invoice payload
    const normalized = {
      ...invoice,
      client: (invoice as any).clientId,
      project: (invoice as any).projectId,
      invoiceNumber: invoice.invoiceNumber || invoice.number || `INV-${String(invoice._id).slice(-6).toUpperCase()}`,
      subtotal: invoice.subtotal || invoice.items?.reduce((s: number, i: any) => s + (Number(i.quantity || 1) * Number(i.unitPrice || i.price || 0)), 0) || 0,
      total: invoice.total || 0,
      amountPaid: invoice.paid || 0,
      balance: invoice.balance !== undefined ? invoice.balance : Math.max(0, (invoice.total || 0) - (invoice.paid || 0)),
      taxRate: invoice.taxRate !== undefined ? invoice.taxRate : 18,
      tax: invoice.tax || 0,
    };

    return json({ invoice: normalized });
  } catch (err: any) {
    console.error("Public Invoice API error:", err);
    return errorJson(err.message || "Failed to load invoice", 500);
  }
}

export const runtime = "nodejs";
