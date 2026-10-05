"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Target,
} from "lucide-react";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  timeline?: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToLead = async (msg: ContactMessage) => {
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: msg.name,
          email: msg.email,
          phone: msg.phone,
          company: msg.company,
          service: msg.service,
          budget: msg.budget,
          message: msg.message,
          stage: "new",
        }),
      });

      if (res.ok) {
        alert("Enquiry successfully added to Sales Leads CRM!");
      }
    } catch (err) {
      console.error("Failed to convert message to lead", err);
    }
  };

  return (
    <div suppressHydrationWarning className="space-y-6">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e8e8e3] pb-5 sm:flex-row sm:items-center">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-orange">
            Public Website Inbound · Briefs
          </span>
          <h1 className="display text-3xl font-extrabold text-ink">
            Incoming Enquiries ({messages.length})
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Direct project submissions received from the contact form on wasshotmedia.com.
          </p>
        </div>
      </div>

      {/* 2. MESSAGES LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-muted">Loading inquiries...</div>
        ) : messages.length === 0 ? (
          <div className="rounded-3xl border border-[#e8e8e3] bg-white p-12 text-center">
            <Mail className="mx-auto h-8 w-8 text-muted/40" />
            <h3 className="display mt-3 text-lg font-bold text-ink">No inquiries yet</h3>
            <p className="mt-1 text-xs text-muted">
              Submissions from the public contact form will appear here in real-time.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const rawPhone = msg.phone ? msg.phone.replace(/\D/g, "") : "";
            return (
              <div
                key={msg._id}
                className="rounded-3xl border border-[#e8e8e3] bg-white p-6 shadow-xs transition hover:border-black/20"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-ink">{msg.name}</h3>
                      {msg.company && (
                        <span className="rounded-md bg-black/[0.05] px-2 py-0.5 text-xs font-semibold text-muted">
                          {msg.company}
                        </span>
                      )}
                      <span className="rounded-full bg-orange/10 px-2 py-0.5 text-[10px] font-bold text-orange">
                        {msg.service || "General Inquiry"}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
                      <span>{msg.email}</span>
                      {msg.phone && <span>· {msg.phone}</span>}
                      {msg.budget && <span>· Budget: {msg.budget}</span>}
                      {msg.timeline && <span>· Timeline: {msg.timeline}</span>}
                      <span>
                        ·{" "}
                        {new Date(msg.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleConvertToLead(msg)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-orange/10 px-3.5 py-1.5 text-xs font-bold text-orange hover:bg-orange hover:text-white transition"
                    >
                      <Target className="h-3.5 w-3.5" />
                      <span>Convert to Lead</span>
                    </button>
                    <a
                      href={`mailto:${msg.email}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e8e3] bg-white px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-black hover:text-white transition"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>Reply</span>
                    </a>
                    {rawPhone && (
                      <a
                        href={`https://wa.me/${rawPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-600 hover:text-white transition"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb] p-4 text-xs leading-relaxed text-ink/90 whitespace-pre-wrap">
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
