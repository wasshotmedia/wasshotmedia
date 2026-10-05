import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";
import { Hero } from "./Hero";
import { Marquee } from "./Marquee";
import { WorkShowcase } from "./WorkShowcase";
import { ServicesPanel } from "./ServicesPanel";
import { FaqList } from "./FaqList";
import { Reveal } from "./Reveal";
import { formatMoney } from "@/lib/utils";
import type { PublicContent } from "@/lib/content";
import { LiquidMetalButton } from "./LiquidMetalButton";
import { IntroPreloader } from "./IntroPreloader";
import { TemplateHelloIntro } from "./TemplateHelloIntro";
import { ProcessSection } from "./ProcessSection";
import { WhySection } from "./WhySection";
import Link from "next/link";

export function PublicShell({
  content,
  children,
}: {
  content: PublicContent;
  children: React.ReactNode;
}) {
  return (
    <div id="top">
      <SiteNav
        available={content.settings.availableForProjects}
        availabilityLabel={content.settings.availabilityLabel}
      />
      {children}
      <SiteFooter
        tagline={content.settings.tagline}
        email={content.settings.email}
        phone={content.settings.phone}
        whatsapp={content.settings.whatsapp}
        instagram={content.settings.instagram}
        linkedin={content.settings.linkedin}
      />
    </div>
  );
}

export function HomePage({ content }: { content: PublicContent }) {
  const intro = content.settings.homepage;
  return (
    <PublicShell content={content}>
      <IntroPreloader />
      <Hero
        label={intro.heroLabel || "Creative Media × Digital"}
        message={intro.heroMessage || ""}
        support={intro.heroSupport || ""}
      />
      <Marquee items={content.marquee} />
      <TemplateHelloIntro lines={intro.introHeadline || []} support={intro.introSupport || ""} />
      <WorkShowcase projects={content.portfolio} />
      <ServicesPanel services={content.services} />
      <ProcessSection steps={content.process} />
      <WhySection items={content.why} />
      <PricingSection plans={content.pricing} />
      <FaqList faqs={content.faqs} />
    </PublicShell>
  );
}

function PricingSection({ plans }: { plans: PublicContent["pricing"] }) {
  return (
    <section id="pricing" className="site-grid py-24">
      <p className="eyebrow">(Pricing plan)</p>
      <h2 className="display mt-4 text-5xl md:text-7xl">Explore Pricing</h2>
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = formatMoney(plan.startingPrice, plan.currency || "INR");
          return (
            <article
              key={plan.title}
              className={`rounded-[28px] p-8 ${plan.highlighted ? "bg-ink text-white" : "bg-white"}`}
            >
              <h3 className="text-lg">{plan.title}</h3>
              <p className={`mt-2 text-sm ${plan.highlighted ? "text-white/70" : "text-muted"}`}>
                {plan.description}
              </p>
              <p className="display mt-8 text-4xl">
                {price ? (
                  <>
                    <span className="block text-sm font-medium tracking-normal">Starting at</span>
                    {price}
                  </>
                ) : (
                  "Let's talk"
                )}
              </p>
              {plan.billingType ? (
                <p className={`mt-1 text-sm ${plan.highlighted ? "text-white/60" : "text-muted"}`}>
                  {plan.billingType}
                </p>
              ) : null}
              <ul className="mt-8 space-y-3 text-sm">
                {(plan.features || []).map((f: string) => (
                  <li key={f}>— {f}</li>
                ))}
              </ul>
              <div className="mt-8">
                <LiquidMetalButton
                  label={plan.ctaLabel || "Get Started →"}
                  href="/contact"
                  size="sm"
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
