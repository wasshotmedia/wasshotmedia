import { Resend } from "resend";
import nodemailer from "nodemailer";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const DEFAULT_FROM = process.env.RESEND_FROM || "WasShot Media <onboarding@resend.dev>";
const AGENCY_NOTIFICATION_EMAIL = process.env.AGENCY_EMAIL || "wasshotmedia@gmail.com";

export function isMailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY || smtpConfigured());
}

export function smtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM,
  );
}

export interface SendEmailArgs {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(args: SendEmailArgs): Promise<{
  sent: boolean;
  id?: string;
  provider?: "resend" | "smtp";
  reason?: string;
}> {
  // 1. Try Resend if configured
  if (resend) {
    try {
      const from = args.from || DEFAULT_FROM;
      const to = Array.isArray(args.to) ? args.to : [args.to];
      const payload: any = {
        from,
        to,
        subject: args.subject,
      };
      if (args.html) payload.html = args.html;
      if (args.text) payload.text = args.text;
      if (args.replyTo) payload.reply_to = args.replyTo;

      const response = await resend.emails.send(payload);

      if (response.error) {
        console.warn("[Resend] Warning sending email:", response.error.message);
        // Fall back to SMTP if available
      } else if (response.data) {
        return {
          sent: true,
          id: response.data.id,
          provider: "resend",
        };
      }
    } catch (err: any) {
      console.warn("[Resend] API Error:", err.message);
    }
  }

  // 2. Fallback to SMTP
  if (smtpConfigured()) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT || 587) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: args.from || process.env.SMTP_FROM,
        to: Array.isArray(args.to) ? args.to.join(", ") : args.to,
        subject: args.subject,
        text: args.text,
        html: args.html,
        replyTo: args.replyTo,
      });

      return {
        sent: true,
        id: info.messageId,
        provider: "smtp",
      };
    } catch (smtpErr: any) {
      console.error("[SMTP] Failed to send email:", smtpErr.message);
      return {
        sent: false,
        reason: smtpErr.message,
      };
    }
  }

  return {
    sent: false,
    reason: "No active email service configured or delivery failed.",
  };
}

export interface LeadEnquiryData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  timeline?: string;
  description: string;
}

/**
 * Send notification email to the WasShot Media founder inbox when a new brief arrives
 */
export async function sendNewLeadAlert(data: LeadEnquiryData) {
  const subject = `🔥 New Project Brief: ${data.name} (${data.company || "Direct Founder"})`;
  
  const text = `
New Client Brief Received on WasShot Media

Client: ${data.name}
Company: ${data.company || "N/A"}
Email: ${data.email}
Phone: ${data.phone || "N/A"}
Service: ${data.service || "General Enquiry"}
Budget: ${data.budget || "Not Specified"}
Timeline: ${data.timeline || "Not Specified"}

Project Overview:
${data.description}

View in Studio Admin: http://localhost:3000/admin/leads
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f2; color: #111111; margin: 0; padding: 24px; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e8e8e3; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
    .header { background: #0c0c0c; color: #ffffff; padding: 32px 32px 28px; border-bottom: 2px solid #ff4d00; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 12px; color: #ff4d00; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 32px; }
    .badge { display: inline-block; background: rgba(255, 77, 0, 0.1); color: #ff4d00; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 99px; text-transform: uppercase; margin-bottom: 20px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .meta-table td { padding: 10px 0; border-bottom: 1px solid #f0f0eb; font-size: 13px; }
    .meta-label { color: #888884; font-weight: 600; width: 120px; text-transform: uppercase; font-size: 11px; }
    .meta-val { color: #111111; font-weight: 700; }
    .brief-box { background: #fbfbfa; border: 1px solid #e8e8e3; border-radius: 14px; padding: 18px; margin-top: 20px; }
    .brief-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #888884; margin-bottom: 8px; letter-spacing: 0.5px; }
    .brief-text { font-size: 14px; line-height: 1.6; color: #222222; margin: 0; white-space: pre-wrap; }
    .footer { padding: 24px 32px; background: #fafaf8; border-top: 1px solid #f0f0eb; text-align: center; font-size: 12px; color: #888884; }
    .cta-btn { display: inline-block; background: #ff4d00; color: #ffffff !important; font-weight: 700; font-size: 13px; padding: 12px 24px; border-radius: 99px; text-decoration: none; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>WasShot Media · Studio OS</h1>
      <p>Inbound Client Enquiry Drop</p>
    </div>
    <div class="content">
      <div class="badge">New Lead Received</div>
      <table class="meta-table">
        <tr><td class="meta-label">Client Name</td><td class="meta-val">${data.name}</td></tr>
        <tr><td class="meta-label">Company</td><td class="meta-val">${data.company || "N/A"}</td></tr>
        <tr><td class="meta-label">Email</td><td class="meta-val"><a href="mailto:${data.email}" style="color: #ff4d00; text-decoration: none;">${data.email}</a></td></tr>
        <tr><td class="meta-label">Phone</td><td class="meta-val">${data.phone || "N/A"}</td></tr>
        <tr><td class="meta-label">Service</td><td class="meta-val">${data.service || "General"}</td></tr>
        <tr><td class="meta-label">Budget</td><td class="meta-val" style="color: #059669;">${data.budget || "Flexible"}</td></tr>
        <tr><td class="meta-label">Timeline</td><td class="meta-val">${data.timeline || "Not specified"}</td></tr>
      </table>

      <div class="brief-box">
        <div class="brief-title">Project Vision & Brief</div>
        <p class="brief-text">${data.description}</p>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="http://localhost:3000/admin/leads" class="cta-btn">Open Studio CRM →</a>
      </div>
    </div>
    <div class="footer">
      WasShot Media · Cinema-Grade Creative Media & Bespoke Web Engineering
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: AGENCY_NOTIFICATION_EMAIL,
    subject,
    text,
    html,
    replyTo: data.email,
  });
}

/**
 * Send receipt confirmation to the prospective client
 */
export async function sendClientConfirmation(data: LeadEnquiryData) {
  const subject = `We've received your brief · WasShot Media`;
  const text = `
Hi ${data.name},

Thank you for reaching out to WasShot Media.

We've received your brief regarding "${data.service || "your project"}". Our directorial and engineering leads are reviewing your project requirements and will reply within 2–4 hours with our initial thoughts and next steps.

In the meantime, feel free to explore our recent work or message us on WhatsApp (+91 73969 86817) for urgent enquiries.

Best regards,
WasShot Media Studio Team
Hyderabad, India
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f2; color: #111111; margin: 0; padding: 24px; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #e8e8e3; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.04); }
    .header { background: #0c0c0c; color: #ffffff; padding: 40px 36px; text-align: center; border-bottom: 2px solid #ff4d00; }
    .brand { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .tagline { color: #ff4d00; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 6px; }
    .content { padding: 36px; }
    .greeting { font-size: 20px; font-weight: 800; color: #111111; margin-top: 0; }
    .p { font-size: 14.5px; line-height: 1.65; color: #444444; margin-bottom: 16px; }
    .highlight-card { background: #fafaf8; border: 1px solid #e8e8e3; border-radius: 16px; padding: 20px; margin: 24px 0; }
    .highlight-item { font-size: 13px; color: #666; margin-bottom: 6px; }
    .highlight-item strong { color: #111; }
    .footer { padding: 28px 36px; background: #fafaf8; border-top: 1px solid #f0f0eb; text-align: center; font-size: 12px; color: #888884; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">WasShot Media</div>
      <div class="tagline">Creative Media × Digital Engineering</div>
    </div>
    <div class="content">
      <h2 class="greeting">We've received your project brief, ${data.name}.</h2>
      <p class="p">
        Thank you for trusting WasShot Media. Our directors and digital team have received your project enquiry and are reviewing the scope.
      </p>
      
      <div class="highlight-card">
        <div class="highlight-item"><strong>Service:</strong> ${data.service || "Creative Collaboration"}</div>
        <div class="highlight-item"><strong>Estimated Timeline:</strong> ${data.timeline || "As specified"}</div>
        <div class="highlight-item"><strong>Turnaround Guarantee:</strong> Direct founder review within 2–4 hours</div>
      </div>

      <p class="p">
        If you have reference links, moodboards, or urgent questions, you can reply directly to this email or reach us on WhatsApp at <strong>+91 73969 86817</strong>.
      </p>
    </div>
    <div class="footer">
      WasShot Media Studio · Hyderabad, India<br/>
      <span style="color: #ff4d00;">wasshotmedia.com</span>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: data.email,
    subject,
    text,
    html,
  });
}

/**
 * Send branded OTP verification email for Admin password reset
 */
export async function sendOtpEmail(email: string, otp: string, name?: string) {
  const subject = `Your WasShot Media Security Verification Code: ${otp}`;
  const text = `
Hi ${name || "Admin"},

Your one-time verification code (OTP) for resetting your WasShot Media password is:

${otp}

This code is valid for 10 minutes. If you did not request this code, please ignore this email.

WasShot Media Studio Security
Road No. 36, Jubilee Hills, Hyderabad
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d0d11; color: #ffffff; margin: 0; padding: 24px; }
    .container { max-width: 520px; margin: 0 auto; background: #16161d; border-radius: 24px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.5); }
    .header { background: #0b0b0e; padding: 36px 32px 28px; text-align: center; border-bottom: 2px solid #ff4d00; }
    .logo { width: 80px; height: 80px; border-radius: 20px; margin: 0 auto 14px; display: block; object-fit: contain; }
    .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; margin: 0; }
    .tagline { color: #ff4d00; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; }
    .content { padding: 36px 32px; text-align: center; }
    .greeting { font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 12px; }
    .desc { font-size: 14px; line-height: 1.6; color: #a0a0ab; margin-bottom: 24px; }
    .otp-card { background: #20202a; border: 1px solid rgba(255, 77, 0, 0.3); border-radius: 16px; padding: 24px 16px; margin: 24px 0; }
    .otp-code { font-family: 'Courier New', monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #ff5500; text-shadow: 0 0 20px rgba(255,85,0,0.3); margin: 0; }
    .expiry { font-size: 11px; color: #888894; margin-top: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .warning { font-size: 12px; color: #777784; margin-top: 20px; line-height: 1.5; }
    .footer { padding: 20px 32px; background: #0f0f14; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; font-size: 11px; color: #666672; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://wasshot.in/brand/wasshotlogo.png" alt="WasShot Media" class="logo" />
      <h1 class="brand">WasShot Media</h1>
      <p class="tagline">Admin Identity Verification</p>
    </div>
    <div class="content">
      <h2 class="greeting">Password Reset Verification</h2>
      <p class="desc">
        You requested a password change for <strong>${email}</strong>. Use the secure 6-digit verification code below to set your new password:
      </p>
      
      <div class="otp-card">
        <div class="otp-code">${otp}</div>
        <div class="expiry">Expires in 10 Minutes · Single-Use</div>
      </div>

      <p class="warning">
        If you did not request this OTP, please disregard this email. Your password will remain unchanged.
      </p>
    </div>
    <div class="footer">
      WasShot Media Studio · Road No. 36, Jubilee Hills, Hyderabad<br/>
      Official Studio Security System
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: email,
    subject,
    text,
    html,
  });
}

/**
 * Send branded Tax Invoice email directly to client
 */
export async function sendInvoiceEmail(invoice: any, client: any) {
  const invoiceNum = invoice.invoiceNumber || invoice.number || "INV";
  const clientName = client.name || "Valued Client";
  const recipientEmail = client.email;
  if (!recipientEmail) {
    return { sent: false, reason: "Client has no email address specified." };
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://wasshot.in";
  const invoiceUrl = `${origin}/invoice/${invoice._id}`;
  const totalStr = `₹${Number(invoice.total || 0).toLocaleString("en-IN")}`;
  const balanceStr = `₹${Number(invoice.balance !== undefined ? invoice.balance : invoice.total || 0).toLocaleString("en-IN")}`;
  const isPaid = invoice.status === "paid" || Number(invoice.balance || 0) === 0;

  const subject = `Invoice #${invoiceNum} from WasShot Media — ${isPaid ? "Paid in Full" : `Due: ${balanceStr}`}`;

  const text = `
Hi ${clientName},

Please find your official tax invoice #${invoiceNum} from WasShot Media.

Total Amount: ${totalStr}
Status: ${isPaid ? "PAID IN FULL" : `Balance Due: ${balanceStr}`}

View & Download your official PDF invoice here:
${invoiceUrl}

UPI ID for direct settlement: 7396986817@ybl

Thank you for partnering with WasShot Media!

WasShot Media Studio
Road No. 36, Jubilee Hills, Hyderabad
Phone: +91 73969 86817
  `.trim();

  const itemsHtml = (invoice.items || [])
    .map(
      (it: any, idx: number) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #f0f0eb; font-size: 13px; color: #222;">${idx + 1}. ${it.description || "Production Deliverable"}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #f0f0eb; font-size: 13px; text-align: center; color: #666;">${it.quantity || 1}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #f0f0eb; font-size: 13px; text-align: right; font-weight: 700; color: #111;">₹${Number(it.amount || (it.quantity || 1) * (it.unitPrice || it.price || 0)).toLocaleString("en-IN")}</td>
    </tr>
  `
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f2; color: #111111; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #e8e8e3; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.04); }
    .header { background: #0c0c0c; color: #ffffff; padding: 36px 32px 30px; text-align: center; border-bottom: 2px solid #ff4d00; }
    .logo { width: 84px; height: 84px; border-radius: 20px; margin: 0 auto 12px; display: block; object-fit: contain; }
    .brand { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; margin: 0; }
    .tagline { color: #ff4d00; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; }
    .content { padding: 36px 32px; }
    .greeting { font-size: 20px; font-weight: 800; color: #111111; margin-top: 0; margin-bottom: 10px; }
    .desc { font-size: 14px; line-height: 1.6; color: #555555; margin-bottom: 24px; }
    .inv-card { background: #fafaf8; border: 1px solid #e8e8e3; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
    .inv-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e8e8e3; padding-bottom: 12px; margin-bottom: 12px; }
    .badge { display: inline-block; background: ${isPaid ? "#ecfdf5" : "#fff7ed"}; color: ${isPaid ? "#047857" : "#c2410c"}; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 99px; text-transform: uppercase; border: 1px solid ${isPaid ? "#a7f3d0" : "#ffedd5"}; }
    .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .totals-box { margin-top: 20px; border-top: 2px solid #111111; padding-top: 14px; }
    .tot-row { display: flex; justify-content: space-between; font-size: 13px; color: #666; margin-bottom: 6px; }
    .tot-grand { display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; color: #111; margin-top: 10px; border-top: 1px solid #e8e8e3; padding-top: 10px; }
    .upi-box { background: #fff8f5; border: 1px solid #ffdcd0; border-radius: 14px; padding: 18px; margin: 24px 0; text-align: center; }
    .upi-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #c2410c; letter-spacing: 1px; margin-bottom: 6px; }
    .upi-id { font-family: 'Courier New', monospace; font-size: 20px; font-weight: 900; color: #ff4d00; margin: 0; }
    .btn-container { text-align: center; margin: 32px 0 16px; }
    .cta-btn { display: inline-block; background: #ff4d00; color: #ffffff !important; font-weight: 800; font-size: 14px; padding: 14px 32px; border-radius: 99px; text-decoration: none; box-shadow: 0 4px 14px rgba(255, 77, 0, 0.3); }
    .footer { padding: 24px 32px; background: #fafaf8; border-top: 1px solid #f0f0eb; text-align: center; font-size: 12px; color: #888884; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://wasshot.in/brand/wasshotlogo.png" alt="WasShot Media" class="logo" />
      <div class="brand">WasShot Media</div>
      <div class="tagline">Cinema Productions & Creative Agency</div>
    </div>
    <div class="content">
      <h2 class="greeting">Hello ${clientName},</h2>
      <p class="desc">
        Here is your official tax invoice <strong>#${invoiceNum}</strong> from WasShot Media Studio. You can review the line items below or click the button to download your official A4 PDF copy.
      </p>

      <div class="inv-card">
        <table style="width: 100%; margin-bottom: 12px;">
          <tr>
            <td style="font-size: 14px; font-weight: 800; color: #111;">Invoice #${invoiceNum}</td>
            <td style="text-align: right;"><span class="badge">${isPaid ? "PAID IN FULL" : "PAYMENT DUE"}</span></td>
          </tr>
        </table>

        <table class="items-table">
          <thead>
            <tr style="font-size: 11px; text-transform: uppercase; color: #888; border-bottom: 1px solid #e8e8e3;">
              <th style="text-align: left; padding-bottom: 8px;">Scope Description</th>
              <th style="text-align: center; padding-bottom: 8px;">Qty</th>
              <th style="text-align: right; padding-bottom: 8px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals-box">
          <table style="width: 100%;">
            <tr><td style="font-size: 13px; color: #666; padding: 3px 0;">Subtotal</td><td style="text-align: right; font-weight: 600;">₹${Number(invoice.subtotal || invoice.total || 0).toLocaleString("en-IN")}</td></tr>
            <tr><td style="font-size: 13px; color: #666; padding: 3px 0;">GST (18%)</td><td style="text-align: right; font-weight: 600;">₹${Number(invoice.tax || Math.round((invoice.subtotal || invoice.total || 0) * 0.18)).toLocaleString("en-IN")}</td></tr>
            <tr style="border-top: 1px solid #e8e8e3; font-weight: 800; font-size: 15px; color: #111;">
              <td style="padding-top: 8px;">Total Payable</td>
              <td style="text-align: right; padding-top: 8px; color: #ff4d00;">${totalStr}</td>
            </tr>
            <tr style="font-weight: 900; font-size: 16px; color: ${isPaid ? "#047857" : "#b91c1c"};">
              <td style="padding-top: 4px;">Balance Due</td>
              <td style="text-align: right; padding-top: 4px;">${balanceStr}</td>
            </tr>
          </table>
        </div>
      </div>

      ${
        !isPaid
          ? `
      <div class="upi-box">
        <div class="upi-title">Direct UPI Settlement</div>
        <div class="upi-id">7396986817@ybl</div>
        <div style="font-size: 11px; color: #888; margin-top: 6px;">Supported: GPay · PhonePe · Paytm · Cred · BHIM</div>
      </div>
      `
          : ""
      }

      <div class="btn-container">
        <a href="${invoiceUrl}" class="cta-btn">View & Download Official PDF Invoice →</a>
      </div>
    </div>
    <div class="footer">
      WasShot Media Studio · Road No. 36, Jubilee Hills, Hyderabad<br/>
      Phone: +91 73969 86817 · Email: wasshotmedia@gmail.com · <a href="https://wasshot.in" style="color: #ff4d00; text-decoration: none;">wasshot.in</a>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: recipientEmail,
    subject,
    text,
    html,
  });
}

