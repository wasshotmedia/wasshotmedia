import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  company: z.string().max(160).optional().or(z.literal("")),
  service: z.string().max(80).optional().or(z.literal("")),
  description: z.string().min(10).max(4000),
  budget: z.string().max(80).optional().or(z.literal("")),
  timeline: z.string().max(80).optional().or(z.literal("")),
});

export const clientSchema = z
  .object({
    name: z.string().min(2),
    contactPerson: z.string().optional().or(z.literal("")),
    company: z.string().optional().or(z.literal("")),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    whatsapp: z.string().optional().or(z.literal("")),
    business: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    status: z.string().optional(),
    website: z.string().optional().or(z.literal("")),
    socialLinks: z
      .object({
        instagram: z.string().optional(),
        linkedin: z.string().optional(),
      })
      .optional(),
    address: z.string().optional().or(z.literal("")),
    notes: z.string().optional().or(z.literal("")),
  })
  .transform((data) => ({
    ...data,
    business: data.business || data.company,
  }));

export const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  service: z.string().optional().or(z.literal("")),
  message: z.string().optional().or(z.literal("")),
  budget: z.string().optional().or(z.literal("")),
  timeline: z.string().optional().or(z.literal("")),
  stage: z
    .enum([
      "new",
      "contacted",
      "qualified",
      "proposal_sent",
      "negotiation",
      "won",
      "lost",
    ])
    .optional(),
  assignedTo: z.string().optional().or(z.literal("")),
  followUpAt: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const projectSchema = z
  .object({
    name: z.string().min(2).optional(),
    title: z.string().min(2).optional(),
    clientId: z.string().optional().or(z.literal("")),
    type: z.enum(["video", "website", "seo", "marketing", "mixed", "branding", "other"]).optional(),
    service: z.string().optional(),
    stage: z.string().optional(),
    status: z.string().optional(),
    budget: z.number().optional(),
    description: z.string().optional().or(z.literal("")),
    startDate: z.string().optional().or(z.literal("")),
    dueDate: z.string().optional().or(z.literal("")),
    deadline: z.string().optional().or(z.literal("")),
    team: z.array(z.string()).optional(),
    assignedTo: z.array(z.string()).optional(),
    services: z.array(z.string()).optional(),
    notes: z.string().optional().or(z.literal("")),
  })
  .transform((data) => ({
    ...data,
    name: data.name || data.title || "Untitled Project",
    type: (data.type && ["video", "website", "seo", "marketing", "mixed"].includes(data.type)
      ? data.type
      : data.service && ["video", "website", "seo", "marketing"].includes(data.service)
      ? (data.service as any)
      : "video") as "video" | "website" | "seo" | "marketing" | "mixed",
  }));

export const taskSchema = z.object({
  title: z.string().min(2),
  projectId: z.string().optional().or(z.literal("")),
  clientId: z.string().optional().or(z.literal("")),
  assigneeId: z.string().optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z.enum(["todo", "in_progress", "waiting", "review", "done"]).optional(),
  dueDate: z.string().optional().or(z.literal("")),
  checklist: z
    .array(z.object({ text: z.string(), done: z.boolean().optional() }))
    .optional(),
  notes: z.string().optional().or(z.literal("")),
});

export const eventSchema = z
  .object({
    type: z.enum([
      "shoot",
      "meeting",
      "site_visit",
      "deadline",
      "delivery",
      "editing",
      "other",
    ]),
    title: z.string().min(2),
    clientId: z.string().optional().or(z.literal("")),
    projectId: z.string().optional().or(z.literal("")),
    start: z.string(),
    end: z.string(),
    location: z.string().optional().or(z.literal("")),
    locationUrl: z.string().optional().or(z.literal("")),
    mapLink: z.string().optional().or(z.literal("")),
    assignedTo: z.array(z.string()).optional(),
    assignedTeam: z.array(z.string()).default([]),
    equipmentChecklist: z.any().optional(),
    shotList: z.any().optional(),
    equipment: z.array(z.string()).optional(),
    notes: z.string().optional().or(z.literal("")),
    status: z.enum(["draft", "confirmed", "scheduled", "in_progress", "completed", "rescheduled", "cancelled"]).optional(),
    reminderOffsets: z.array(z.number()).optional(),
    overrideConflict: z.boolean().optional(),
  })
  .transform((data) => ({
    ...data,
    assignedTeam:
      data.assignedTeam && data.assignedTeam.length > 0
        ? data.assignedTeam
        : data.assignedTo || [],
    mapLink: data.mapLink || data.locationUrl,
  }));

export const invoiceSchema = z.object({
  clientId: z.string().min(1),
  projectId: z.string().optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().positive(),
        price: z.number().nonnegative(),
      }),
    )
    .min(1),
  discount: z.number().nonnegative().optional(),
  taxRate: z.number().nonnegative().optional(),
  paid: z.number().nonnegative().optional(),
  dueDate: z.string().optional().or(z.literal("")),
  status: z
    .enum(["draft", "issued", "partially_paid", "paid", "overdue", "cancelled"])
    .optional(),
  notes: z.string().optional().or(z.literal("")),
});

export const cmsServiceSchema = z.object({
  title: z.string().min(2),
  slug: z.string().optional(),
  number: z.string().optional(),
  description: z.string().optional(),
  deliverables: z.array(z.string()).optional(),
  visualKey: z.string().optional(),
  imageUrl: z.string().optional(),
  published: z.boolean().optional(),
  order: z.number().optional(),
});

export const portfolioSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  year: z.string().optional(),
  role: z.string().optional(),
  services: z.array(z.string()).optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  order: z.number().optional(),
  clientName: z.string().optional(),
});

export const testimonialSchema = z.object({
  clientName: z.string().min(2),
  company: z.string().optional(),
  project: z.string().optional(),
  quote: z.string().min(8),
  imageUrl: z.string().optional(),
  published: z.boolean().optional(),
  order: z.number().optional(),
});

export const faqSchema = z.object({
  question: z.string().min(4),
  answer: z.string().min(4),
  published: z.boolean().optional(),
  order: z.number().optional(),
});

export const pricingSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  startingPrice: z.number().nullable().optional(),
  currency: z.string().optional(),
  billingType: z.string().optional(),
  features: z.array(z.string()).optional(),
  ctaLabel: z.string().optional(),
  highlighted: z.boolean().optional(),
  published: z.boolean().optional(),
  order: z.number().optional(),
});

export const settingsSchema = z.object({
  brandName: z.string().optional(),
  tagline: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  address: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  ogImage: z.string().optional(),
  availabilityLabel: z.string().optional(),
  availableForProjects: z.boolean().optional(),
  founders: z
    .array(
      z.object({
        name: z.string(),
        role: z.string().optional(),
        bio: z.string().optional(),
        responsibilities: z.array(z.string()).optional(),
        avatarUrl: z.string().optional(),
        instagram: z.string().optional(),
        linkedin: z.string().optional(),
      }),
    )
    .optional(),
  homepage: z
    .object({
      heroLabel: z.string().optional(),
      heroHeadline: z.array(z.string()).optional(),
      heroMessage: z.string().optional(),
      heroSupport: z.string().optional(),
      introLabel: z.string().optional(),
      introHeadline: z.array(z.string()).optional(),
      introSupport: z.string().optional(),
    })
    .optional(),
});
