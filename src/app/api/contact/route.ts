import { NextRequest } from "next/server";
import { connectDb, isMongoConnected } from "@/lib/db";
import { contactSchema } from "@/lib/validators";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { errorJson, json } from "@/lib/utils";
import { ContactMessage, Lead } from "@/models";
import { localStore } from "@/lib/local-store";
import { sendNewLeadAlert, sendClientConfirmation } from "@/lib/mail";

export async function POST(request: NextRequest) {
  const limited = rateLimit(`contact:${clientIp(request)}`, 10, 60_000);
  if (!limited.ok) return errorJson("Please wait before sending another message.", 429);

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return errorJson("Please check the form and try again.", 400);

  const data = parsed.data;

  // 1. Save to Database (MongoDB or LocalStore)
  try {
    await connectDb();
    if (isMongoConnected()) {
      const message = await ContactMessage.create(data);
      await Lead.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        service: data.service,
        message: data.description,
        budget: data.budget,
        timeline: data.timeline,
        stage: "new",
        source: "website",
        contactMessageId: message._id,
      });
    } else {
      localStore.create("messages", data);
      localStore.create("leads", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        service: data.service,
        message: data.description,
        budget: data.budget,
        timeline: data.timeline,
        stage: "new",
        source: "website",
      });
    }
  } catch (dbErr) {
    console.warn("[Contact] Fallback saving to localStore:", dbErr);
    localStore.create("messages", data);
    localStore.create("leads", {
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      service: data.service,
      message: data.description,
      budget: data.budget,
      timeline: data.timeline,
      stage: "new",
      source: "website",
    });
  }

  // 2. Send instant Resend email notifications (non-blocking)
  Promise.allSettled([
    sendNewLeadAlert(data),
    sendClientConfirmation(data),
  ]).catch((mailErr) => {
    console.warn("[Contact] Email notification error:", mailErr);
  });

  return json({ ok: true });
}
