import { NextRequest } from "next/server";
import { connectDb, isMongoConnected } from "@/lib/db";
import { User, ActivityLog } from "@/models";
import { localStore } from "@/lib/local-store";
import { errorJson, json } from "@/lib/utils";
import { hashPassword } from "@/lib/auth";
import { clientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = body?.email ? String(body.email).toLowerCase().trim() : "";
  const otp = body?.otp ? String(body.otp).trim() : "";
  const newPassword = body?.newPassword ? String(body.newPassword) : "";

  if (!email || !otp || !newPassword) {
    return errorJson("Email, verification OTP code, and new password are required.", 400);
  }

  if (newPassword.length < 8) {
    return errorJson("Password must be at least 8 characters in length.", 400);
  }

  const newHash = await hashPassword(newPassword);
  let updated = false;

  // 1. Try MongoDB
  try {
    await connectDb();
    if (isMongoConnected()) {
      const user = await User.findOne({ email, isActive: true });
      if (user) {
        if (!user.resetOtp || user.resetOtp !== otp) {
          return errorJson("Invalid verification code. Please check and try again.", 400);
        }
        if (!user.resetOtpExpires || new Date(user.resetOtpExpires).getTime() < Date.now()) {
          return errorJson("This verification code has expired. Please request a new code.", 400);
        }

        user.passwordHash = newHash;
        user.resetOtp = undefined;
        user.resetOtpExpires = undefined;
        await user.save();
        updated = true;

        try {
          await ActivityLog.create({
            actorId: user._id,
            action: "password_reset_otp",
            ip: clientIp(request),
          });
        } catch {}
      }
    }
  } catch (err) {
    console.warn("MongoDB reset-password error:", err);
  }

  // 2. Also update localStore
  const localUser = localStore.findOne("users" as any, { email, isActive: true });
  if (localUser) {
    if (!updated) {
      if (!localUser.resetOtp || localUser.resetOtp !== otp) {
        return errorJson("Invalid verification code. Please check and try again.", 400);
      }
      if (!localUser.resetOtpExpires || new Date(localUser.resetOtpExpires).getTime() < Date.now()) {
        return errorJson("This verification code has expired. Please request a new code.", 400);
      }
    }

    localStore.findByIdAndUpdate("users" as any, localUser._id, {
      passwordHash: newHash,
      resetOtp: undefined,
      resetOtpExpires: undefined,
    });
    updated = true;
  }

  if (!updated) {
    return errorJson("Administrator account not found or verification failed.", 404);
  }

  return json({
    ok: true,
    message: "Password reset successful! You can now log in with your new password.",
  });
}

export const runtime = "nodejs";
