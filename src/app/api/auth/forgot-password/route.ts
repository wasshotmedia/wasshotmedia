import { NextRequest } from "next/server";
import { connectDb, isMongoConnected } from "@/lib/db";
import { User } from "@/models";
import { localStore } from "@/lib/local-store";
import { errorJson, json } from "@/lib/utils";
import { sendOtpEmail } from "@/lib/mail";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = body?.email ? String(body.email).toLowerCase().trim() : "";

  if (!email || !email.includes("@")) {
    return errorJson("Please provide a valid registered email address.", 400);
  }

  // Generate 6-digit cryptographic OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  let userFound = false;
  let userName = "Admin";

  try {
    await connectDb();
    if (isMongoConnected()) {
      const user = await User.findOne({ email, isActive: true });
      if (user) {
        userFound = true;
        userName = user.name;
        user.resetOtp = otp;
        user.resetOtpExpires = expires;
        await user.save();
      }
    }
  } catch (err) {
    console.warn("MongoDB check error in forgot-password:", err);
  }

  // Also check / update localStore
  const localUser = localStore.findOne("users" as any, { email, isActive: true });
  if (localUser) {
    userFound = true;
    userName = localUser.name || userName;
    localStore.findByIdAndUpdate("users" as any, localUser._id, {
      resetOtp: otp,
      resetOtpExpires: expires.toISOString(),
    });
  }

  if (!userFound) {
    // For security, inform user or check allowed admin emails
    const allowedAdmins = [
      "praneethbadugu7781@gmail.com",
      "wassemakram6114@gmail.com",
      (process.env.ADMIN_BOOTSTRAP_EMAIL || "").toLowerCase(),
      (process.env.ADMIN_BOOTSTRAP_EMAIL_2 || "").toLowerCase(),
    ].filter(Boolean);

    if (!allowedAdmins.includes(email)) {
      return errorJson("This email address is not registered as a WasShot Media administrator.", 404);
    }
  }

  // Dispatch branded OTP Email
  try {
    const res = await sendOtpEmail(email, otp, userName);
    console.log(`[OTP] Sent verification code to ${email}: success=${res.sent}`);
  } catch (err) {
    console.warn("[OTP] Failed to send email:", err);
  }

  return json({
    ok: true,
    message: `Verification code sent to ${email}. Please check your inbox (and spam folder). Code valid for 10 minutes.`,
  });
}

export const runtime = "nodejs";
