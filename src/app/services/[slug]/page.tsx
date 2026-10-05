import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicContent } from "@/lib/content";
import { PublicShell } from "@/components/site/HomePage";
import { VisualScene, type VisualKey } from "@/components/site/Visuals";
import { ArrowLink } from "@/components/site/Logo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = await getPublicContent();
  const service = content.services.find((s) => s.slug === slug);
  if (!service) return { title: "Service" };
  return { title: service.title, description: service.description };
}

export default async function ServiceDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getPublicContent();
  const service = content.services.find((s) => s.slug === slug);
  if (!service) notFound();
  return (
    <PublicShell content={content}>
      <article className="site-grid grid items-center gap-10 pb-24 pt-36 lg:grid-cols-2">
        <div>
          <p className="eyebrow">{service.number}</p>
          <h1 className="display mt-4 text-6xl md:text-8xl">{service.title}</h1>
          <p className="mt-6 max-w-md text-muted">{service.description}</p>
          <ul className="mt-8 space-y-2">
            {(service.deliverables || []).map((item: string) => (
              <li key={item}>— {item}</li>
            ))}
          </ul>
          <div className="mt-10">
            <ArrowLink href="/contact">Start a project</ArrowLink>
          </div>
        </div>
        <VisualScene kind={(service.visualKey as VisualKey) || "shooting"} className="min-h-[420px]" />
      </article>
    </PublicShell>
  );
}
