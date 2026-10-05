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
