import { connectDb, isDbConfigured, isMongoConnected } from "@/lib/db";
import { defaultContent } from "@/lib/default-content";
import { localStore } from "@/lib/local-store";
import {
  AgencySettings,
  FAQ,
  PortfolioProject,
  PricingPlan,
  Service,
  Testimonial,
} from "@/models";

export type PublicContent = {
  settings: {
    brandName: string;
    tagline: string;
    email: string;
    phone: string;
    whatsapp: string;
    instagram: string;
    linkedin: string;
    address: string;
    seoTitle: string;
    seoDescription: string;
    ogImage: string;
    availabilityLabel: string;
    availableForProjects: boolean;
    founders?: any[];
    homepage?: any;
  };
  services: any[];
  faqs: any[];
  pricing: any[];
  portfolio: Array<{
    slug: string;
    name: string;
    year?: string;
    role?: string;
    services?: string[];
    description?: string;
    imageUrl?: string;
    clientName?: string;
  }>;
  testimonials?: any[];
  capabilities: typeof defaultContent.capabilities;
  process: typeof defaultContent.process;
  why: typeof defaultContent.why;
  marquee: typeof defaultContent.marquee;
  dbConnected: boolean;
};

function getFromLocalStore(): PublicContent {
  const settings = localStore.getSettings() || {};
  const rawPortfolio = (localStore.find("portfolio") || []).filter(
    (p: any) => p.published !== false
  );

  const portfolio = rawPortfolio.map((p: any) => ({
    slug: p.slug || (p.title || p.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: p.title || p.name || "Untitled Project",
    clientName: p.client || p.clientName || "",
    year: p.year || "2026",
    role: p.category || p.role || "Production",
    services: p.deliverables || p.services || [],
    description: p.description || "",
    imageUrl: p.imageUrl || "",
  }));

  const services = (localStore.find("services") || []).filter((s: any) => s.published !== false);
  const faqs = (localStore.find("faqs") || []).filter((f: any) => f.published !== false);
  const pricing = (localStore.find("pricing") || []).filter((p: any) => p.published !== false);
  const testimonials = (localStore.find("testimonials") || []).filter((t: any) => t.published !== false);

  return {
    settings: {
      brandName: settings?.brandName || defaultContent.brandName,
      tagline: settings?.tagline || defaultContent.tagline,
      email: settings?.email || "wasshotmedia@gmail.com",
      phone: settings?.phone || "+91 7396986817",
      whatsapp: settings?.whatsapp || "+91 7396986817",
      instagram: settings?.instagram || "https://instagram.com/wasshotmedia",
      linkedin: settings?.linkedin || "https://linkedin.com/company/wasshotmedia",
      address: settings?.address || "Hyderabad, India",
      seoTitle: settings?.seoTitle || defaultContent.seoTitle,
      seoDescription: settings?.seoDescription || defaultContent.seoDescription,
      ogImage: settings?.ogImage || "",
      availabilityLabel: settings?.availabilityLabel || defaultContent.availabilityLabel,
      availableForProjects: settings?.availableForProjects ?? true,
      founders: settings?.founders?.length ? settings.founders : defaultContent.founders,
      homepage: {
        ...defaultContent.homepage,
        ...(settings?.homepage || {}),
      },
    },
    services: services.length ? services : defaultContent.services,
    faqs: faqs.length ? faqs : defaultContent.faqs,
    pricing: pricing.length ? pricing : defaultContent.pricing,
    portfolio,
    testimonials,
    capabilities: defaultContent.capabilities,
    process: defaultContent.process,
    why: defaultContent.why,
    marquee: defaultContent.marquee,
    dbConnected: false,
  };
}

let cachedPublicContent: PublicContent | null = null;
let lastCacheTimestamp = 0;
const CACHE_TTL_MS = 2000; // 2s cache so CMS changes appear live

export async function getPublicContent(): Promise<PublicContent> {
  const now = Date.now();
  if (cachedPublicContent && now - lastCacheTimestamp < CACHE_TTL_MS) {
    return cachedPublicContent;
  }

  // Fast path: if MongoDB is not connected, immediately use local store with zero cache delay
  if (!isMongoConnected()) {
    return getFromLocalStore();
  }

  try {
    const fetchDb = async () => {
      await connectDb();
      const [settings, services, faqs, pricing, rawPortfolio, testimonials] =
        await Promise.all([
          AgencySettings.findOne({ singleton: "agency" }).lean(),
          Service.find({ published: true }).sort({ order: 1 }).lean(),
          FAQ.find({ published: true }).sort({ order: 1 }).lean(),
          PricingPlan.find({ published: true }).sort({ order: 1 }).lean(),
          PortfolioProject.find({ published: true }).sort({ order: 1 }).lean(),
          Testimonial.find({ published: true }).sort({ order: 1 }).lean(),
        ]);

      const portfolio = (rawPortfolio || []).map((p: any) => ({
        slug: p.slug,
        name: p.name || p.title || "Untitled Project",
        year: p.year || "2026",
        role: p.role || p.category || "Production",
        services: p.services || p.deliverables || [],
        description: p.description || "",
        imageUrl: p.imageUrl || "",
        clientName: p.clientName || p.client || "",
      }));

      const content: PublicContent = {
        settings: {
          brandName: settings?.brandName || defaultContent.brandName,
          tagline: settings?.tagline || defaultContent.tagline,
          email: settings?.email || "wasshotmedia@gmail.com",
          phone: settings?.phone || "+91 7396986817",
          whatsapp: settings?.whatsapp || "+91 7396986817",
          instagram: settings?.instagram || "https://instagram.com/wasshotmedia",
          linkedin: settings?.linkedin || "https://linkedin.com/company/wasshotmedia",
          address: settings?.address || "Hyderabad, India",
          seoTitle: settings?.seoTitle || defaultContent.seoTitle,
          seoDescription: settings?.seoDescription || defaultContent.seoDescription,
          ogImage: settings?.ogImage || "",
          availabilityLabel:
            settings?.availabilityLabel || defaultContent.availabilityLabel,
          availableForProjects: settings?.availableForProjects ?? true,
          founders:
            settings?.founders?.length ? settings.founders : defaultContent.founders,
          homepage: {
            ...defaultContent.homepage,
            ...(settings?.homepage || {}),
          },
        },
        services: services.length ? services : defaultContent.services,
        faqs: faqs.length ? faqs : defaultContent.faqs,
        pricing: pricing.length ? pricing : defaultContent.pricing,
        portfolio,
        testimonials,
        capabilities: defaultContent.capabilities,
        process: defaultContent.process,
        why: defaultContent.why,
        marquee: defaultContent.marquee,
        dbConnected: true,
      };

      return JSON.parse(JSON.stringify(content));
    };

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DB timeout")), 1200)
    );

    const result = await Promise.race([fetchDb(), timeout]);
    cachedPublicContent = result;
    lastCacheTimestamp = Date.now();
    return result;
  } catch {
    const localContent = getFromLocalStore();
    cachedPublicContent = localContent;
    lastCacheTimestamp = Date.now();
    return localContent;
  }
}
