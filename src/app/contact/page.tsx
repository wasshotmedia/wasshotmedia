import { getPublicContent } from "@/lib/content";
import { PublicShell } from "@/components/site/HomePage";
import { ContactForm } from "@/components/site/ContactForm";
import { FaqList } from "@/components/site/FaqList";
import { BlurSlideText } from "@/components/site/Reveal";
import { Mail, Phone, MapPin, MessageCircle, ShieldCheck, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Contact & Project Inquiry | WasShot Media",
  description: "Start a project with WasShot Media. Commercial video production, video editing, websites, campaigns, and digital growth.",
};

export default async function ContactPage() {
  const content = await getPublicContent();
  const email = content.settings.email || "wasshotmedia@gmail.com";
  const phone1 = "+91 7396986817";
  const phone2 = "+91 7330820239";
  const whatsappUrl = `https://wa.me/917396986817`;

  return (
    <PublicShell content={content}>
      {/* 1. Cinematic Hero Header Matching Agero Template (Right-to-Left Motion Blur Reveal, No Circles) */}
      <section className="relative overflow-hidden pt-28 pb-14 sm:pt-36 sm:pb-20 md:pt-44 md:pb-28">
        <div className="site-grid text-center">
          <h1 className="display text-4xl sm:text-7xl md:text-8xl lg:text-[96px] xl:text-[104px] leading-[1.08] sm:leading-[1.06] tracking-[-0.03em] text-ink">
            <div className="flex flex-wrap items-center justify-center gap-x-[0.25em]">
              <BlurSlideText text="Let’s Build" trigger="mount" delay={0.1} />
              <span className="text-orange">
                <BlurSlideText text="Something" trigger="mount" delay={0.28} />
              </span>
            </div>
            <div className="mt-1 sm:mt-3 md:mt-4 flex flex-wrap items-center justify-center gap-x-[0.25em]">
              <BlurSlideText text="Great Together" trigger="mount" delay={0.46} />
            </div>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-sm sm:text-lg leading-relaxed text-muted">
            Let’s create work worth talking about. Whether it’s commercial production, cutting-edge websites, or brand growth, we’re ready.
          </p>
        </div>
      </section>

      {/* 2. Project Brief Form & Direct Studio Channels Section */}
      <section className="site-grid grid gap-12 pb-28 pt-4 lg:grid-cols-12 items-start">
        {/* Left Column: Direct Studio Channels & Commitments */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <p className="eyebrow">( Contact )</p>
          <h2 className="display mt-3 text-3xl sm:text-4xl md:text-5xl text-ink">
            Start a conversation
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted">
            Reach out directly through any channel below or submit the project brief.
          </p>

          {/* Direct Channels */}
          <div className="mt-8 space-y-3.5">
            {/* Direct Email */}
            <a
              href={`mailto:${email}`}
              className="group flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4 shadow-xs transition-all duration-300 hover:border-orange hover:shadow-[0_8px_30px_rgba(255,77,20,0.12)] hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#efeee9] text-orange transition-colors group-hover:bg-orange group-hover:text-white">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Direct Email</p>
                  <p className="font-semibold text-ink transition-colors group-hover:text-orange text-sm sm:text-base">
                    {email}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-orange opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                Send →
              </span>
            </a>

            {/* Direct Calling Lines */}
            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#efeee9] text-orange">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Direct Calling Lines</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold text-ink text-sm sm:text-base mt-0.5">
                    <a href="tel:+917396986817" className="transition hover:text-orange">
                      {phone1}
                    </a>
                    <span className="text-black/20">•</span>
                    <a href="tel:+917330820239" className="transition hover:text-orange">
                      {phone2}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp Inquiry */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-2xl border border-emerald-500/25 bg-emerald-50/60 p-4 transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Instant Chat</p>
                  <p className="font-semibold text-emerald-950 text-sm sm:text-base">
                    Chat with WasShot on WhatsApp
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform pr-2">
                ↗
              </span>
            </a>

            {/* Studio Headquarters */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-black/10 bg-white p-4 shadow-xs">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#efeee9] text-orange">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Studio Headquarters</p>
                <p className="font-semibold text-ink text-sm sm:text-base">Vijayawada, Andhra Pradesh, India</p>
              </div>
            </div>
          </div>

          {/* Quality Commitments */}
          <div className="mt-8 rounded-2xl border border-black/[0.06] bg-[#faf9f6] p-4 text-xs text-muted space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-orange shrink-0" />
              <span>Direct Creative Director involvement on every project</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-orange shrink-0" />
              <span>100% Confidentiality &amp; NDA protected proposals</span>
            </div>
          </div>
        </div>

        {/* Right Column: High-Level Contact Form */}
        <div className="lg:col-span-7">
          <ContactForm whatsapp="917396986817" />
        </div>
      </section>

      {/* 3. 2-Column Rounded FAQs Matching Template */}
      <FaqList faqs={content.faqs} />
    </PublicShell>
  );
}
