import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { connectDb } from "../lib/db";
import { hashPassword } from "../lib/auth";
import { defaultContent } from "../lib/default-content";
import {
  AgencySettings,
  FAQ,
  PricingPlan,
  Service,
  User,
} from "../models";

async function seed() {
  await connectDb();

  const users = [
    {
      name: process.env.ADMIN_BOOTSTRAP_NAME || "Admin",
      email: process.env.ADMIN_BOOTSTRAP_EMAIL,
      password: process.env.ADMIN_BOOTSTRAP_PASSWORD,
      role: "owner" as const,
      title: "Creative & Digital Lead",
    },
    {
      name: process.env.ADMIN_BOOTSTRAP_NAME_2 || "Studio Lead",
      email: process.env.ADMIN_BOOTSTRAP_EMAIL_2,
      password: process.env.ADMIN_BOOTSTRAP_PASSWORD_2,
      role: "owner" as const,
      title: "Creative & Media Lead",
    },
  ];

  for (const user of users) {
    if (!user.email || !user.password) {
      console.log(`Skipping user ${user.name}: email/password not set`);
      continue;
    }
    const existing = await User.findOne({ email: user.email.toLowerCase() });
    if (existing) {
      console.log(`User exists: ${user.email}`);
      continue;
    }
    await User.create({
      name: user.name,
      email: user.email.toLowerCase(),
      passwordHash: await hashPassword(user.password),
      role: user.role,
      title: user.title,
    });
    console.log(`Created user: ${user.email}`);
  }

  const settings = await AgencySettings.findOne({ singleton: "agency" });
  if (!settings) {
    await AgencySettings.create({
      singleton: "agency",
      brandName: defaultContent.brandName,
      tagline: defaultContent.tagline,
      email: process.env.AGENCY_EMAIL || "",
      phone: process.env.AGENCY_PHONE || "",
      whatsapp: process.env.AGENCY_WHATSAPP || "",
      instagram: process.env.AGENCY_INSTAGRAM || "",
      linkedin: process.env.AGENCY_LINKEDIN || "",
      seoTitle: defaultContent.seoTitle,
      seoDescription: defaultContent.seoDescription,
      availabilityLabel: defaultContent.availabilityLabel,
      availableForProjects: true,
      founders: defaultContent.founders,
      homepage: defaultContent.homepage,
    });
    console.log("Created agency settings");
  }

  if ((await Service.countDocuments()) === 0) {
    await Service.insertMany(
      defaultContent.services.map((service, index) => ({
        ...service,
        published: true,
        order: index,
      })),
    );
    console.log("Seeded services");
  }

  if ((await FAQ.countDocuments()) === 0) {
    await FAQ.insertMany(
      defaultContent.faqs.map((faq, index) => ({
        ...faq,
        published: true,
        order: index,
      })),
    );
    console.log("Seeded FAQs");
  }

  if ((await PricingPlan.countDocuments()) === 0) {
    await PricingPlan.insertMany(
      defaultContent.pricing.map((plan, index) => ({
        ...plan,
        ctaLabel: "Get Started →",
        published: true,
        order: index,
      })),
    );
    console.log("Seeded pricing plans (no prices until set in admin)");
  }

  console.log("Seed complete. Portfolio and testimonials stay empty until published.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
