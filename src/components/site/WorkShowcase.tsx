"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { PublicContent } from "@/lib/content";

export interface ShowcaseProject {
  slug: string;
  name: string;
  clientName?: string;
  year?: string;
  role?: string;
  services?: string[];
  description?: string;
  imageUrl?: string;
}

export function WorkShowcase({
  projects,
}: {
  projects?: PublicContent["portfolio"];
}) {
  const displayProjects = (projects || []).map((p, idx) => ({
    ...p,
    bgClass:
      idx % 3 === 0
        ? "bg-[#1c1c1c]"
        : idx % 3 === 1
        ? "bg-[#150f0d]"
        : "bg-[#0d0d0d]",
  }));

  const total = String(displayProjects.length).padStart(2, "0");

  return (
    <section id="work" className="relative pb-32 pt-12 md:pt-16">
      {/* 1. Giant Watermark: "Recent Works" */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 select-none overflow-hidden text-center pb-6 md:pb-10">
        <h2 className="font-display font-black text-4xl sm:text-7xl md:text-9xl lg:text-[148px] xl:text-[164px] tracking-[-0.04em] text-black/[0.08] uppercase leading-none pointer-events-none">
          Recent Works
        </h2>
      </div>

      {/* 2. Projects Container (Only admin-added projects) */}
      {displayProjects.length > 0 ? (
        <div className="site-grid relative">
          <div className="relative space-y-10 sm:space-y-16 md:space-y-20 pb-16">
            {displayProjects.map((project, idx) => {
              const projectNumber = String(idx + 1).padStart(2, "0");

              return (
                <div
                  key={project.slug}
                  className="sticky transition-all duration-300"
                  style={{
                    top: `calc(72px + ${idx * 16}px)`,
                    zIndex: idx + 10,
                  }}
                >
                  {/* Individual Card */}
                  <div
                    className={`relative overflow-hidden rounded-2xl sm:rounded-[36px] md:rounded-[48px] ${project.bgClass} border border-white/10 p-4.5 sm:p-8 md:p-14 text-white shadow-[0_24px_80px_rgba(0,0,0,0.6)]`}
                  >
                    {/* Ambient Glow */}
                    <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-orange/15 blur-[100px]" />

                    {/* 3-Column Layout Matching Template Screenshot */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 lg:gap-12 items-center">
                      {/* Left Column: Number + Description + Title */}
                      <div className="lg:col-span-3 flex flex-col justify-between self-stretch">
                        <div>
                          {/* 01 / XX Counter */}
                          <div className="flex items-center gap-2 mb-4">
                            <span className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-orange">
                              {projectNumber}
                            </span>
                            <span className="text-white/30 text-lg font-medium">/ {total}</span>
                          </div>

                          {/* Title */}
                          <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
                            {project.name}
                          </h3>

                          {/* Description Paragraph */}
                          <p className="text-sm md:text-base text-white/70 font-normal leading-relaxed">
                            {project.description}
                          </p>
                        </div>

                        {/* Small Explore Link on Mobile */}
                        <div className="mt-6 lg:hidden">
                          <Link
                            href={`/work/${project.slug}`}
                            className="inline-flex items-center gap-2 rounded-full bg-orange px-5 py-2.5 font-display text-xs font-bold text-white shadow-lg transition hover:bg-white hover:text-ink"
                          >
                            <span>Explore Project</span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>

                      {/* Center Column: Big Project Showcase Frame */}
                      <div className="lg:col-span-6">
                        <div className="group relative overflow-hidden rounded-[20px] sm:rounded-[26px] md:rounded-[32px] border border-white/10 aspect-[16/10] sm:aspect-[4/3] bg-black/50 shadow-2xl">
                          {project.imageUrl ? (
                            <Image
                              src={project.imageUrl}
                              alt={project.name}
                              fill
                              priority={idx === 0}
                              sizes="(max-width: 1024px) 100vw, 550px"
                              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-black via-[#1c1c1c] to-black" />
                          )}

                          {/* Subtle Dark Vignette */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        </div>
                      </div>

                      {/* Right Column: Year, Role & Services */}
                      <div className="lg:col-span-3 flex flex-col justify-between self-stretch border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
                        <div className="space-y-5">
                          {/* Year */}
                          <div>
                            <p className="font-display text-xs uppercase tracking-widest text-white/50">
                              Year
                            </p>
                            <p className="font-display text-2xl font-black text-white mt-1">
                              {project.year || "2026"}
                            </p>
                          </div>

                          {/* Role */}
                          {project.role && (
                            <div>
                              <p className="font-display text-xs uppercase tracking-widest text-white/50">
                                Category / Role
                              </p>
                              <p className="font-display text-sm font-semibold text-white/90 mt-1">
                                {project.role}
                              </p>
                            </div>
                          )}

                          {/* Services List */}
                          {project.services && project.services.length > 0 && (
                            <div>
                              <p className="font-display text-xs uppercase tracking-widest text-white/50 mb-2">
                                Deliverables
                              </p>
                              <ul className="space-y-1.5 font-display text-sm font-medium text-white/80">
                                {project.services.map((srv) => (
                                  <li key={srv} className="flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-orange" />
                                    <span>{srv}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Desktop Explore CTA Button */}
                        <div className="mt-8 hidden lg:block">
                          <Link
                            href={`/work/${project.slug}`}
                            className="inline-flex items-center gap-2 rounded-full bg-orange px-5 py-2.5 font-display text-xs font-bold text-white shadow-lg transition-all duration-300 hover:bg-white hover:text-ink hover:scale-105"
                          >
                            <span>Explore Project</span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="site-grid">
          <div className="mx-auto max-w-xl rounded-3xl border border-black/10 bg-white p-10 text-center shadow-xs">
            <p className="font-display text-xs uppercase tracking-widest text-orange font-bold">
              Studio Portfolio
            </p>
            <h3 className="font-display text-2xl font-extrabold text-ink mt-2">
              Selected Works In Production
            </h3>
            <p className="text-xs text-muted mt-2 leading-relaxed">
              New client case studies will show here as soon as they are added and published from the Studio Admin.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/admin/portfolio"
                className="inline-flex items-center gap-1.5 rounded-full bg-orange px-5 py-2.5 font-display text-xs font-bold text-white shadow-xs hover:bg-ink transition"
              >
                <span>+ Add Case Study in Admin →</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
