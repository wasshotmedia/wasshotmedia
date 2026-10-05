import type { MetadataRoute } from "next";
import { getPublicContent } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const content = await getPublicContent();
  const staticRoutes = ["", "/work", "/services", "/about", "/contact", "/privacy", "/terms"].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
    }),
  );
  const services = content.services.map((service) => ({
    url: `${base}/services/${service.slug}`,
    lastModified: new Date(),
  }));
  const work = content.portfolio.map((project) => ({
    url: `${base}/work/${project.slug}`,
    lastModified: new Date(),
  }));
  return [...staticRoutes, ...services, ...work];
}
