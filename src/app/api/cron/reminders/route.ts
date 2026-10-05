import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { processDueReminders } from "@/lib/reminders";
import { errorJson, json } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return errorJson("Unauthorized", 401);
  }
  await connectDb();
  const results = await processDueReminders();
  return json({ processed: results.length, results });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
