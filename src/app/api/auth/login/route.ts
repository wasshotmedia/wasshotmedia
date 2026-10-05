import { NextRequest } from "next/server";
import { connectDb, isMongoConnected } from "@/lib/db";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validators";
import { errorJson, json } from "@/lib/utils";
import { ActivityLog, User } from "@/models";
import { localStore } from "@/lib/local-store";

export async function POST(request: NextRequest) {
  const limited = rateLimit(`login:${clientIp(request)}`, 15, 60_000);
  if (!limited.ok) {
    return errorJson("Too many login attempts. Try again shortly.", 429, {
      retryAfter: limited.retryAfter,
    });
  }
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return errorJson("Invalid email or password.", 400);

  const email = parsed.data.email.toLowerCase();
  const password = parsed.data.password;

  let user: any = null;

  try {
    await connectDb();
    if (isMongoConnected()) {
      user = await User.findOne({ email, isActive: true });
    }
  } catch {
    // MongoDB unavailable, proceed to local store
  }

  // Fallback to local store
  if (!user) {
    user = localStore.findOne("users", { email, isActive: true });
  }

  if (!user) {
    return errorJson("Invalid email or password.", 401);
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return errorJson("Invalid email or password.", 401);
  }

  const sessionUser = {
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role as "owner" | "admin" | "editor",
  };

  await setSessionCookie(sessionUser);

  if (isMongoConnected() && typeof user.save === "function") {
    try {
      user.lastLoginAt = new Date();
      await user.save();
      await ActivityLog.create({
        actorId: user._id,
        action: "login",
        ip: clientIp(request),
      });
    } catch {
      // ignore
    }
  } else {
    localStore.findByIdAndUpdate("users", String(user._id), {
      lastLoginAt: new Date().toISOString(),
    });
    localStore.logActivity("login", "user", String(user._id), { ip: clientIp(request) }, user.name);
  }

  return json({ user: sessionUser });
}
