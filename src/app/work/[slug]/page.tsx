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
  const project = content.portfolio.find((p) => p.slug === slug);
  if (!project) return { title: "Project" };
  return {
    title: project.name,
    description: project.description,
  };
}

export const dynamic = "force-dynamic";

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getPublicContent();
  const project = content.portfolio.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <PublicShell content={content}>
      <article className="site-grid pb-20 pt-28 sm:pt-36">
        <p className="eyebrow">{project.year || "2026"}</p>
        <h1 className="display mt-3 text-3xl sm:text-5xl md:text-7xl lg:text-8xl">{project.name}</h1>
        <div className="mt-8 sm:mt-10 overflow-hidden rounded-2xl sm:rounded-[32px] border border-black/10">
          {project.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.imageUrl}
              alt={project.name}
              className="w-full max-h-[600px] object-cover"
            />
          ) : (
            <VisualScene kind={"websites" as VisualKey} className="min-h-[420px] rounded-none" />
          )}
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <p className="md:col-span-2 text-base md:text-lg text-muted leading-relaxed">
            {project.description}
          </p>
          <dl className="space-y-4 text-xs md:text-sm">
            {project.clientName && (
              <div>
                <dt className="text-muted font-bold uppercase tracking-wider text-[10px]">Client</dt>
                <dd className="font-semibold text-ink mt-0.5">{project.clientName}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted font-bold uppercase tracking-wider text-[10px]">Category / Role</dt>
              <dd className="font-semibold text-ink mt-0.5">{project.role || "Production"}</dd>
            </div>
            {project.services && project.services.length > 0 && (
              <div>
                <dt className="text-muted font-bold uppercase tracking-wider text-[10px]">Deliverables</dt>
                <dd className="font-semibold text-ink mt-0.5">{project.services.join(", ")}</dd>
              </div>
            )}
          </dl>
        </div>
        <div className="mt-12">
          <ArrowLink href="/contact">Start a similar project</ArrowLink>
        </div>
      </article>
    </PublicShell>
  );
}
