import type { Metadata } from "next";
import { getPublicContent } from "@/lib/content";
import { PublicShell } from "@/components/site/HomePage";
import { BlurSlideText } from "@/components/site/Reveal";
import { WorkShowcase } from "@/components/site/WorkShowcase";

export const metadata: Metadata = {
  title: "Work — Selected Portfolio & Commercial Productions",
  description:
    "Stories that look good. Digital experiences that work. Explore selected commercial productions and digital experiences from WasShot Media.",
};

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const content = await getPublicContent();
  return (
    <PublicShell content={content}>
      {/* Hero Header Matching Services (Right-to-Left Motion Blur Text Reveal, No Circles) */}
      <section className="relative overflow-hidden pt-36 pb-14 md:pt-44 md:pb-20">
        <div className="site-grid text-center">
          <h1 className="display text-5xl sm:text-7xl md:text-8xl lg:text-[96px] xl:text-[104px] leading-[1.06] tracking-[-0.03em] text-ink">
            <div className="flex flex-wrap items-center justify-center gap-x-[0.25em]">
              <BlurSlideText text="Our Work" trigger="mount" delay={0.1} />
              <span className="text-orange">
                <BlurSlideText text="In Action" trigger="mount" delay={0.28} />
              </span>
            </div>
            <div className="mt-2 sm:mt-3 md:mt-4 flex flex-wrap items-center justify-center gap-x-[0.25em]">
              <BlurSlideText text="Featured Work" trigger="mount" delay={0.46} />
            </div>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            From commercial cinema campaigns to high-performance web engineering, explore how WasShot Media delivers impactful creative execution for ambitious brands.
          </p>
        </div>
      </section>

      {/* Recent Works Watermark & Dark Container Showcase (Template Image 3) */}
      <WorkShowcase projects={content.portfolio} />
    </PublicShell>
  );
}
