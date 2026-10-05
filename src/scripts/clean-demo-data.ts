import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { connectDb } from "../lib/db";
import {
  User,
  Client,
  Project,
  CalendarEvent,
  Reminder,
  Invoice,
  Payment,
  Lead,
  PortfolioProject,
  Testimonial,
  AgencySettings,
  ContactMessage,
} from "../models";

async function main() {
  await connectDb();
  console.log("=== CURRENT DATABASE STATE ===");
  console.log("Clients:", await Client.countDocuments());
  console.log("Projects:", await Project.countDocuments());
  console.log("Events:", await CalendarEvent.countDocuments());
  console.log("Reminders:", await Reminder.countDocuments());
  console.log("Leads:", await Lead.countDocuments());
  console.log("Invoices:", await Invoice.countDocuments());
  console.log("Payments:", await Payment.countDocuments());
  console.log("Portfolio:", await PortfolioProject.countDocuments());
  console.log("Testimonials:", await Testimonial.countDocuments());
  console.log("Messages:", await ContactMessage.countDocuments());

  // Clean all fake demo / test data
  console.log("\nRemoving test & fake demo data...");
  await Client.deleteMany({});
  await Project.deleteMany({});
  await CalendarEvent.deleteMany({});
  await Reminder.deleteMany({});
  await Lead.deleteMany({});
  await Invoice.deleteMany({});
  await Payment.deleteMany({});
  await PortfolioProject.deleteMany({});
  await Testimonial.deleteMany({});
  // Keep real contact messages if any, remove test messages
  await ContactMessage.deleteMany({ email: { $regex: /test|example|abc/i } });

  // Ensure AgencySettings has the real original details provided by the user
  await AgencySettings.findOneAndUpdate(
    { singleton: "agency" },
    {
      $set: {
        brandName: "WasShot Media",
        tagline: "WE CREATE. YOU GROW.",
        email: "wasshotmedia@gmail.com",
        phone: "+91 7396986817",
        phones: ["+91 7396986817", "+91 7330820239"],
        whatsapp: "+91 7396986817",
        city: "Vijayawada, Andhra Pradesh, India",
        address: "Vijayawada, Andhra Pradesh, India",
      },
    },
    { upsert: true, new: true }
  );

  console.log("\n=== DATABASE CLEANED SUCCESSFULLY ===");
  console.log("Clients remaining:", await Client.countDocuments());
  console.log("Projects remaining:", await Project.countDocuments());
  console.log("Events remaining:", await CalendarEvent.countDocuments());
  console.log("Portfolio remaining:", await PortfolioProject.countDocuments());
  console.log("Testimonials remaining:", await Testimonial.countDocuments());
  console.log("Agency Settings verified with original email & numbers.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
