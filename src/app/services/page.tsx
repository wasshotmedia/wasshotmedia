import type { Metadata } from "next";
import Link from "next/link";
import { getPublicContent } from "@/lib/content";
import { PublicShell } from "@/components/site/HomePage";
import { ServicesPanel } from "@/components/site/ServicesPanel";
import { FaqList } from "@/components/site/FaqList";
import { BlurSlideText } from "@/components/site/Reveal";
import { VisualScene, type VisualKey } from "@/components/site/Visuals";
import { BrandEmblem } from "@/components/site/Logo";
import { LiquidMetalButton } from "@/components/site/LiquidMetalButton";
import {
  Camera,
  Film,
  Code2,
  TrendingUp,
  Megaphone,
  Compass,
  ArrowRight,
  CheckCircle2,
  Layers,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services & Capabilities",
  description:
    "Cinematic video production, bespoke web engineering, color grading, SEO, and brand growth strategies by WasShot Media.",
};

const DETAILED_SERVICES = [
  {
    number: "01",
    slug: "shooting",
    visualKey: "shooting",
    icon: Camera,
    title: "Cinematic Shooting",
    tagline: "Visual storytelling with commercial intent.",
    overview:
      "From commercial brand campaigns to intimate product visuals, we craft moving and still imagery with high-end camera packages, lighting mastery, and precise directorial vision.",
    features: [
      "4K / 6K Cinema Camera Workflows",
      "Studio & On-Location Lighting Design",
      "Aerial Drone Cinematography & Movement",
      "Commercial Product & Narrative Direction",
    ],
    deliverables: [
      "Brand Hero Films",
      "Product Commercials",
      "High-Res Stills & Editorial Shoots",
      "Multi-Cam Event & Live Production",
    ],
  },
  {
    number: "02",
    slug: "video-editing",
    visualKey: "editing",
    icon: Film,
    title: "Video Editing & Post",
    tagline: "Pacing, color science, and sound shaped to captivate.",
    overview:
      "Great footage is only the beginning. We sculpt raw takes into sharp, cohesive narratives with rhythmic editing, Hollywood-grade color grading, and immersive sound design.",
    features: [
      "Dynamic Narrative Pacing & Offline Editing",
      "ACES Color Science & Precision Grading",
      "Spatial Sound Design & Broadcast Mixing",
      "Shortform Social Retain Cuts (9:16)",
    ],
    deliverables: [
      "Director's Cut & Broadcast Masters",
      "High-Impact Social Ad Cutdowns",
      "Color Grade LUTs & Master Files",
      "Sound Design & Stereo Master Tracks",
    ],
  },
  {
    number: "03",
    slug: "website-development",
    visualKey: "websites",
    icon: Code2,
    title: "Custom Web Engineering",
    tagline: "High-performance digital experiences that convert.",
    overview:
      "We design and build bespoke web applications that reflect your brand's prestige. Fast load times, responsive fluid layouts, and interactive WebGL shaders that leave lasting impressions.",
    features: [
      "Next.js App Router Architecture",
      "Interactive Shaders & Motion Design",
      "Mobile-First Responsive Systems",
      "Headless CMS & Scalable Backends",
    ],
    deliverables: [
      "Custom Digital Flagships & Landing Pages",
      "Headless CMS Client Dashboards",
      "SEO-Ready Clean Codebase",
      "Core Web Vitals 95+ Optimization",
    ],
  },
  {
    number: "04",
    slug: "seo",
    visualKey: "seo",
    icon: TrendingUp,
    title: "SEO & Search Engine Growth",
    tagline: "Organic authority that compounds over time.",
    overview:
      "Search visibility built on technical perfection, structured data, and high-intent keyword mapping so your brand shows up where clients are actively searching.",
    features: [
      "Deep Technical Site & Architecture Audits",
      "Schema Graph & Semantic Entity Structuring",
      "High-Value Keyword Authority Strategy",
      "Local & International Search Rankings",
    ],
    deliverables: [
      "Full Technical SEO Implementation",
      "Keyword Mapping & Competitive Blueprint",
      "On-Page Content Optimization",
      "Monthly Organic Ranking Reports",
    ],
  },
  {
    number: "05",
    slug: "promotions",
    visualKey: "promotions",
    icon: Megaphone,
    title: "Brand Campaigns & Promotions",
    tagline: "Strategic distribution where attention matters most.",
    overview:
      "Even the most beautiful creative fails without distribution. We craft targeted promotional roadmaps and ad creatives engineered to generate reach, leads, and brand recall.",
    features: [
      "High-Converting Paid Social Ad Creative",
      "Multi-Channel Launch Execution",
      "Audience Segmentation & Funnel Structuring",
      "Omni-Channel Distribution Schedules",
    ],
    deliverables: [
      "Performance Ad Creative Assets",
      "Campaign Launch Playbooks",
      "Content Calendar & Distribution Strategy",
      "Conversion & ROAS Analysis",
    ],
  },
  {
    number: "06",
    slug: "strategy",
    visualKey: "strategy",
    icon: Compass,
    title: "Creative Strategy & Direction",
    tagline: "Clarity before the first frame or line of code.",
    overview:
      "Every successful production starts with deep strategic alignment. We analyze your commercial goals, define your visual identity, and build an airtight project roadmap.",
    features: [
      "Brand Positioning & Narrative Framing",
      "Visual Language Guidelines & Art Direction",
      "Commercial Goal Mapping & Scoping",
      "Comprehensive Production Blueprints",
    ],
    deliverables: [
      "Brand Positioning Document",
      "Creative Brief & Moodboards",
      "Project Production Roadmap",
      "Art Direction Guidelines",
    ],
  },
];

const PROCESS_STEPS = [
  {
    num: "01",
    title: "Brief & Strategic Alignment",
    detail: "We listen to your commercial objectives, timeline, and audience to structure a clear, agreed-upon scope.",
  },
  {
    num: "02",
    title: "Creative Production & Build",
    detail: "Cameras roll, design systems take shape, and code is engineered with zero handoff friction.",
  },
  {
    num: "03",
    title: "Refinement & Polish",
    detail: "Color grading, sound design, browser testing, and meticulous client reviews until every detail shines.",
  },
  {
    num: "04",
    title: "Launch & Growth Rollout",
    detail: "Deployment to production, campaign distribution, and measurement to drive tangible business growth.",
  },
];

export default async function ServicesPage() {
  const content = await getPublicContent();

  return (
    <PublicShell content={content}>
      {/* Hero Header Matching Template (Right-to-Left Motion Blur Reveal, No Circles) */}
      <section className="relative overflow-hidden pt-28 pb-14 sm:pt-36 md:pt-44 md:pb-24">
        <div className="site-grid text-center">
          <h1 className="display text-4xl sm:text-7xl md:text-8xl lg:text-[96px] xl:text-[104px] leading-[1.08] sm:leading-[1.06] tracking-[-0.03em] text-ink">
            <div className="flex flex-wrap items-center justify-center gap-x-[0.25em]">
              <BlurSlideText text="Our Creative" trigger="mount" delay={0.1} />
              <span className="text-orange">
                <BlurSlideText text="Services" trigger="mount" delay={0.28} />
              </span>
            </div>
            <div className="mt-1 sm:mt-2.5 flex flex-wrap items-center justify-center gap-x-[0.25em]">
              <BlurSlideText text="Excellence Delivered" trigger="mount" delay={0.46} />
            </div>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base leading-relaxed text-muted md:text-lg">
            We eliminated the split between video production and web engineering. WasShot Media operates as a unified studio, giving ambitious brands everything they need to command attention and scale online.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mx-auto mt-10 sm:mt-12 grid w-full max-w-4xl grid-cols-2 gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl border border-black/[0.08] bg-white p-4 sm:p-6 shadow-xs sm:grid-cols-4">
            <div>
              <p className="display text-xl sm:text-2xl font-extrabold text-ink md:text-[26px]">6 CORE</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted">Creative Services</p>
            </div>
            <div>
              <p className="display text-xl sm:text-2xl font-extrabold text-ink md:text-[26px]">END-TO-END</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted">Production &amp; Delivery</p>
            </div>
            <div>
              <p className="display text-xl sm:text-2xl font-extrabold text-ink md:text-[26px]">100% IN-HOUSE</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted">Creative Execution</p>
            </div>
            <div>
              <p className="display text-xl sm:text-2xl font-extrabold text-orange md:text-[26px]">CLIENT-FIRST</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted">Strategy &amp; Results</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Quick Explorer Panel */}
      <ServicesPanel services={content.services} />

      {/* Deep-Dive Editorial Dossiers */}
      <section className="site-grid py-20 border-t border-black/[0.08]">
        <div className="text-center">
          <p className="eyebrow">Comprehensive Breakdown</p>
          <h2 className="display mt-4 text-4xl leading-tight md:text-6xl">
            Our 6 Disciplines in Detail
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Explore the exact technologies, standards, and tangible deliverables behind every service we provide.
          </p>
        </div>

        <div className="mt-16 space-y-12">
          {DETAILED_SERVICES.map((srv, index) => {
            const Icon = srv.icon;
            const isReversed = index % 2 === 1;
            return (
              <div
                key={srv.slug}
                id={srv.slug}
                className="overflow-hidden rounded-2xl sm:rounded-[32px] border border-black/[0.08] bg-white p-5 sm:p-8 md:p-12 shadow-[0_16px_50px_rgba(17,17,17,0.03)] transition-all duration-300"
              >
                <div className={`grid gap-10 lg:grid-cols-12 lg:items-center ${isReversed ? "lg:flex-row-reverse" : ""}`}>
                  {/* Text Column */}
                  <div className={`space-y-6 ${isReversed ? "lg:col-span-6 lg:order-2" : "lg:col-span-6"}`}>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-base font-extrabold tracking-wider text-orange">
                        {srv.number}
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-black/20" />
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                        <Icon className="h-3.5 w-3.5 text-orange" />
                        <span>Discipline</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="display text-3xl font-extrabold text-ink md:text-4xl">
                        {srv.title}
                      </h3>
                      <p className="mt-1 font-medium text-orange">
                        {srv.tagline}
                      </p>
                    </div>

                    <p className="text-sm leading-relaxed text-muted md:text-base">
                      {srv.overview}
                    </p>

                    {/* Features list */}
                    <div className="space-y-2.5 pt-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-ink">
                        Technical Standards:
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {srv.features.map((feat) => (
                          <div key={feat} className="flex items-center gap-2 text-xs font-medium text-ink/80">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Deliverables tags */}
                    <div className="pt-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-ink mb-2.5">
                        Client Deliverables:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {srv.deliverables.map((del) => (
                          <span
                            key={del}
                            className="rounded-full border border-black/10 bg-[#efeee9]/70 px-3.5 py-1 text-xs font-medium text-ink"
                          >
                            {del}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <LiquidMetalButton
                        label="Commission This Service →"
                        href="/contact"
                        size="md"
                      />
                    </div>
                  </div>

                  {/* Visual Scene Column */}
                  <div className={`lg:col-span-6 ${isReversed ? "lg:order-1" : ""}`}>
                    <VisualScene
                      kind={srv.visualKey as VisualKey}
                      className="min-h-[360px] md:min-h-[440px] shadow-lg rounded-[28px]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Production & Engineering Process Section */}
      <section className="site-grid py-20 border-t border-black/[0.08]">
        <div className="text-center">
          <p className="eyebrow">Studio Methodology</p>
          <h2 className="display mt-4 text-4xl leading-tight md:text-6xl">
            From First Brief to Final Output
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Our agile, 4-phase production pipeline keeps every stakeholder aligned and guarantees zero delivery delays.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step) => (
            <div
              key={step.num}
              className="rounded-3xl border border-black/[0.08] bg-white p-8 shadow-xs transition hover:border-black/20"
            >
              <span className="font-display text-xs font-extrabold tracking-wider text-orange uppercase">
                PHASE {step.num}
              </span>
              <h3 className="display mt-4 text-xl font-bold text-ink">
                {step.title}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <FaqList faqs={content.faqs} />

      {/* Project CTA Callout */}
      <section className="site-grid pb-24">
        <div className="overflow-hidden rounded-[36px] bg-ink p-8 text-white md:p-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange/30 bg-orange/10 px-3.5 py-1 text-xs font-semibold text-orange">
                <Zap className="h-3.5 w-3.5" />
                <span>LET&apos;S COLLABORATE</span>
              </div>
              <h2 className="display mt-6 text-4xl leading-[1.04] md:text-6xl">
                Have a project that requires exceptional execution?
              </h2>
              <p className="mt-5 text-base text-white/70 md:text-lg">
                Send your brief or book a direct strategic consultation with the WasShot Media studio team.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <LiquidMetalButton
                  label="Start Your Project →"
                  href="/contact"
                  size="lg"
                />
                <a
                  href="https://wa.me/917396986817"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-ink"
                >
                  Quick WhatsApp Brief
                </a>
              </div>
            </div>

            <BrandEmblem size={160} className="hidden sm:block shrink-0 shadow-[0_16px_60px_rgba(255,77,20,0.4)]" />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
