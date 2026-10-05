import { getSession } from "@/lib/auth";
import { errorJson, json } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session) return errorJson("Unauthorized", 401);
  return json({ user: session });
}
