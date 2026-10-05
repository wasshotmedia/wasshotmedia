import "dotenv/config";
import { connectDb } from "@/lib/db";
import { AgencySettings } from "@/models";

async function main() {
  await connectDb();
  await AgencySettings.findOneAndUpdate(
    { singleton: "agency" },
    {
      $set: {
        email: "wasshotmedia@gmail.com",
        phone: "+91 7396986817",
        whatsapp: "+91 7396986817",
        instagram: "https://instagram.com/wasshot.media",
        linkedin: "",
        address: "Vijayawada, Andhra Pradesh, India",
      },
    },
    { upsert: true },
  );
  console.log("Agency settings updated successfully in MongoDB Atlas!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to update settings:", err);
  process.exit(1);
});
